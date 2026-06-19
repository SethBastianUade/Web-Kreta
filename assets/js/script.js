// ── Menú mobile (sin Bootstrap) ──────────────────────
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuPanel = document.querySelector("[data-menu]");
if (menuToggle && menuPanel) {
  menuToggle.addEventListener("click", () => {
    const open = menuPanel.classList.toggle("hidden") === false;
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  // Cerrar al tocar un link
  menuPanel.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      menuPanel.classList.add("hidden");
      menuToggle.setAttribute("aria-expanded", "false");
    })
  );
}

// ── Reveal progresivo al scroll ──────────────────────
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.body.classList.add("reveal-ready");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
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
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formMessage = form.querySelector(".form-note") || document.querySelector("#form-message");
    if (formMessage) {
      formMessage.textContent = "";
      formMessage.className = "form-note mt-3 text-center text-sm";
    }

    let isValid = true;
    const requiredInputs = form.querySelectorAll("input[required], select[required], textarea[required]");

    requiredInputs.forEach((input) => {
      let fieldValid = true;
      if (!input.value.trim()) fieldValid = false;
      else if (input.type === "email" && !validateEmail(input.value)) fieldValid = false;

      input.classList.toggle("ring-2", !fieldValid);
      input.classList.toggle("ring-error", !fieldValid);
      if (!fieldValid) isValid = false;

      input.addEventListener("input", () => {
        let ok = input.value.trim() && !(input.type === "email" && !validateEmail(input.value));
        input.classList.toggle("ring-2", !ok);
        input.classList.toggle("ring-error", !ok);
      });
    });

    if (!isValid) {
      if (formMessage) {
        formMessage.textContent = "Por favor, completá correctamente todos los campos obligatorios.";
        formMessage.classList.add("text-error");
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
            formMessage.classList.add("text-primary");
          }
          form.reset();
          requiredInputs.forEach((i) => i.classList.remove("ring-2", "ring-error"));
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
          formMessage.classList.add("text-error");
        }
      });
  });
});
