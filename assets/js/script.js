// ── Menú mobile (sin Bootstrap): transición + scroll-lock ──
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuPanel = document.querySelector("[data-menu]");
if (menuToggle && menuPanel) {
  const setMenu = (open) => {
    menuPanel.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("overflow-hidden", open); // scroll-lock del fondo
  };
  menuToggle.addEventListener("click", () => setMenu(!menuPanel.classList.contains("is-open")));
  // Cerrar al tocar un link
  menuPanel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  // Si el viewport pasa a desktop con el menú abierto, liberar el scroll-lock
  matchMedia("(min-width: 768px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });
}

// ── Header: opacar al scrollear ───────────────────────
const siteHeader = document.getElementById("top");
if (siteHeader) {
  const onHeaderScroll = () => siteHeader.classList.toggle("scrolled", window.scrollY > 10);
  onHeaderScroll();
  window.addEventListener("scroll", onHeaderScroll, { passive: true });
}

// ── Reveal progresivo al scroll (escalonado por tanda) ──
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.body.classList.add("reveal-ready");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      const batch = entries.filter((e) => e.isIntersecting);
      batch.forEach((entry, i) => {
        const el = entry.target;
        // Los elementos que entran juntos al viewport se escalonan 80ms entre sí.
        // El delay se limpia al terminar para no demorar transiciones posteriores (hover).
        if (i > 0) {
          el.style.transitionDelay = Math.min(i * 80, 400) + "ms";
          el.addEventListener("transitionend", () => (el.style.transitionDelay = ""), { once: true });
        }
        el.classList.add("is-in");
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));
}

// ── Formulario de contacto (Web3Forms, AJAX) ─────────
function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}

document.querySelectorAll(".contact-form").forEach((form) => {
  const requiredInputs = form.querySelectorAll("input[required], select[required], textarea[required]");

  const markField = (input) => {
    const ok = input.value.trim() && !(input.type === "email" && !validateEmail(input.value));
    input.classList.toggle("ring-2", !ok);
    input.classList.toggle("ring-error-soft", !ok);
    return !!ok;
  };

  // Validación en vivo: registrada una sola vez, no por submit.
  // Solo limpia el error una vez marcado; no lo enciende mientras el usuario tipea.
  requiredInputs.forEach((input) =>
    input.addEventListener("input", () => {
      if (input.classList.contains("ring-2")) markField(input);
    })
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formMessage = form.querySelector(".form-note") || document.querySelector("#form-message");
    if (formMessage) {
      formMessage.textContent = "";
      formMessage.className = "form-note mt-3 text-center text-sm";
    }

    let isValid = true;
    requiredInputs.forEach((input) => {
      if (!markField(input)) isValid = false;
    });

    if (!isValid) {
      if (formMessage) {
        formMessage.textContent = "Por favor, completá correctamente todos los campos obligatorios.";
        formMessage.classList.add("text-error-soft");
      }
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    const originalBtnText = submitBtn ? submitBtn.textContent : "Enviar";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando propuesta...";
    }

    const formObj = Object.fromEntries(new FormData(form).entries());

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(formObj),
    })
      .then((r) => r.json())
      .then((data) => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
        if (data.success === "true" || data.success === true) {
          if (formMessage) {
            formMessage.textContent = "¡Gracias por escribirnos! Te responderemos en menos de 24 horas con una propuesta para tu caso.";
            formMessage.classList.add("text-violet-accent");
          }
          form.reset();
          requiredInputs.forEach((i) => i.classList.remove("ring-2", "ring-error-soft"));
        } else {
          throw new Error("Web3Forms response was not successful");
        }
      })
      .catch(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
        if (formMessage) {
          formMessage.textContent = "No pudimos enviar tu mensaje. Reintentá o escribinos por WhatsApp.";
          formMessage.classList.add("text-error-soft");
        }
      });
  });
});

// ── Spotlight en glass-cards: la luz sigue el mouse ──
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.addEventListener(
    "pointermove",
    (e) => {
      const card = e.target.closest(".glass-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", e.clientX - r.left + "px");
      card.style.setProperty("--spot-y", e.clientY - r.top + "px");
    },
    { passive: true }
  );
}

// ── Contadores animados (KPIs del mockup BiFrost) ──
const counters = document.querySelectorAll("[data-count]");
if (counters.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        const el = entry.target;
        const to = parseFloat(el.dataset.countTo);
        if (!Number.isFinite(to)) return;
        const decimals = parseInt(el.dataset.countDecimals || "0", 10);
        const prefix = el.dataset.countPrefix || "";
        const suffix = el.dataset.countSuffix || "";
        const start = performance.now();
        const duration = 1200;
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          el.textContent = prefix + (to * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => countObserver.observe(el));
}

// ── Barra de progreso de scroll ──
const progressBar = document.querySelector(".scroll-progress");
if (progressBar) {
  let max = 0;
  const measure = () => {
    max = document.documentElement.scrollHeight - window.innerHeight;
  };
  const onProgress = () => {
    progressBar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  };
  measure();
  onProgress();
  window.addEventListener("scroll", onProgress, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("load", measure);
}
