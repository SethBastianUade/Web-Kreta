// Efectos del home oscuro "Aurora": shader de fondo (aurora + mesh + mouse),
// dot grid interactivo y parallax de capas. Todo opcional: si falta el elemento
// o el usuario pide reduced-motion, no se ejecuta.
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Fondo: shader WebGL (aurora gradient + mesh ember + highlight del mouse) ──
  (function shader() {
    var canvas = document.getElementById("aurora-shader");
    if (!canvas || reduce) return;
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    var SCALE = 0.5; // ponytail: gradiente suave, el upscale es invisible; subir a 1 si aparece banding
    function syncSize() {
      var w = Math.max(1, Math.round((canvas.clientWidth || 1280) * SCALE)),
        h = Math.max(1, Math.round((canvas.clientHeight || 720) * SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(syncSize).observe(canvas);
    syncSize();

    var vs =
      "attribute vec2 a_position;varying vec2 v_texCoord;" +
      "void main(){v_texCoord=a_position*0.5+0.5;gl_Position=vec4(a_position,0.0,1.0);}";
    var fs = [
      "#ifdef GL_FRAGMENT_PRECISION_HIGH",
      "precision highp float;",
      "#else",
      "precision mediump float;",
      "#endif",
      "uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;",
      "varying vec2 v_texCoord;",
      "vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}",
      "float snoise(vec2 v){",
      " const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);",
      " vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);",
      " vec2 i1;i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);",
      " vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);",
      " vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));",
      " vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);",
      " m=m*m;m=m*m;vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;",
      " vec3 ox=floor(x+0.5);vec3 a0=x-ox;",
      " m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);",
      " vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;",
      " return 130.0*dot(m,g);}",
      "void main(){",
      " vec2 uv=v_texCoord;vec2 mouse=u_mouse/u_resolution;",
      " vec3 color=vec3(0.039,0.039,0.039);",
      " float n1=snoise(uv*2.0+u_time*0.1);float n2=snoise(uv*3.0-u_time*0.15);",
      " float aurora=smoothstep(0.1,0.5,n1*n2);",
      " vec3 auroraColor1=vec3(0.486,0.447,1.0);vec3 auroraColor2=vec3(0.1,0.2,0.4);",
      " color=mix(color,auroraColor1,aurora*0.3);color=mix(color,auroraColor2,aurora*0.2);",
      " vec2 emberPos=vec2(0.8,0.2)+0.1*vec2(sin(u_time*0.5),cos(u_time*0.7));",
      " float emberDist=length(uv-emberPos);vec3 emberColor=vec3(1.0,0.4,0.2);",
      " color+=emberColor*(1.0-smoothstep(0.0,0.6,emberDist))*0.15;",
      " float mouseDist=length(uv-mouse);",
      " color+=auroraColor1*(1.0-smoothstep(0.0,0.4,mouseDist))*0.1;",
      " gl_FragColor=vec4(color,1.0);}",
    ].join("\n");

    function cs(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("aurora-shader: compile failed", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }
    var vsh = cs(gl.VERTEX_SHADER, vs);
    var fsh = cs(gl.FRAGMENT_SHADER, fs);
    if (!vsh || !fsh) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("aurora-shader: link failed", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    var uTime = gl.getUniformLocation(prog, "u_time");
    var uRes = gl.getUniformLocation(prog, "u_resolution");
    var uMouse = gl.getUniformLocation(prog, "u_mouse");

    var mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    window.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        mouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
        mouse.y = (1 - (e.clientY - rect.top) / rect.height) * canvas.height;
      }
    });

    var lastDraw = 0;
    var FRAME_MS = 1000 / 30; // ponytail: 30fps alcanza para un gradiente lento
    function render(t) {
      requestAnimationFrame(render);
      if (t - lastDraw < FRAME_MS) return;
      lastDraw = t;
      if (typeof ResizeObserver === "undefined") syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    render(0);
  })();

  // ── Hero: dot grid interactivo (canvas 2D) ──
  (function dotGrid() {
    var container = document.getElementById("dot-grid");
    if (!container || reduce) return;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    container.appendChild(canvas);

    var dots = [],
      spacing = 40,
      radius = 1.5,
      mouse = { x: -1000, y: -1000 };

    function init() {
      var w = (canvas.width = container.clientWidth || window.innerWidth);
      var h = (canvas.height = container.clientHeight || window.innerHeight);
      dots = [];
      for (var x = spacing / 2; x < w; x += spacing)
        for (var y = spacing / 2; y < h; y += spacing) dots.push({ x: x, y: y });
    }
    var rafId = null;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i],
          dist = Math.hypot(mouse.x - d.x, mouse.y - d.y),
          max = 150,
          size = radius,
          op = 0.15;
        if (dist < max) {
          var f = 1 - dist / max;
          size = radius + f * 3;
          op = 0.15 + f * 0.6;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + op + ")";
        ctx.fill();
      }
      rafId = requestAnimationFrame(animate);
    }
    function start() {
      if (rafId === null) rafId = requestAnimationFrame(animate);
    }
    function stop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 150);
    });
    // El grid no captura eventos (pointer-events:none); seguimos el mouse a nivel ventana.
    window.addEventListener("mousemove", function (e) {
      var rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    // En mobile no hay mouse: seguimos el dedo para que el grid reaccione.
    window.addEventListener(
      "touchmove",
      function (e) {
        var t = e.touches[0];
        if (!t) return;
        var rect = container.getBoundingClientRect();
        mouse.x = t.clientX - rect.left;
        mouse.y = t.clientY - rect.top;
      },
      { passive: true }
    );
    init();
    if (typeof IntersectionObserver !== "undefined") {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? start() : stop();
      }).observe(container);
    } else {
      start(); // ponytail: sin IO, comportamiento previo
    }
  })();

  // ── Parallax de capas del hero ──
  (function parallax() {
    var layers = document.querySelectorAll(".parallax-layer");
    if (!layers.length || reduce) return;
    document.addEventListener("mousemove", function (e) {
      var x = (window.innerWidth - e.pageX * 2) / 100;
      var y = (window.innerHeight - e.pageY * 2) / 100;
      layers.forEach(function (layer) {
        var speed = parseFloat(layer.getAttribute("data-speed")) || 0.05;
        layer.style.transform = "translate(" + x * speed + "rem," + y * speed + "rem)";
      });
    });
  })();
})();
