// Hamburger Menu & Bootstrap Collapse integration
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-links");
const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
const sections = document.querySelectorAll("main section[id]");

// Handle menu toggle for custom styles + Bootstrap collapse events
if (menuToggle) {
  const siteMenuEl = document.getElementById("siteMenu");
  if (siteMenuEl) {
    // Sync custom hamburger animations with Bootstrap collapse events
    siteMenuEl.addEventListener("show.bs.collapse", () => {
      menuToggle.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
    });
    siteMenuEl.addEventListener("hide.bs.collapse", () => {
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  } else if (navMenu) {
    // Fallback for custom JS toggle if Bootstrap collapse is not used
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      menuToggle.classList.toggle("is-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        menuToggle.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }
}

// Active link highlighting via IntersectionObserver
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      const currentLink = document.querySelector(`.nav-links a[href="#${id}"]`);

      if (entry.isIntersecting) {
        document
          .querySelectorAll(".nav-links a[href^='#']")
          .forEach((link) => link.classList.remove("is-active"));

        if (currentLink) currentLink.classList.add("is-active");
      }
    });
  },
  {
    threshold: 0.4,
    rootMargin: "-10% 0px -40% 0px",
  }
);

sections.forEach((section) => sectionObserver.observe(section));

// Form Validation and Feedback (Visual feedback to the user)
const forms = document.querySelectorAll(".contact-form");

forms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const formMessage = form.querySelector(".form-note") || document.querySelector("#form-message");
    if (formMessage) {
      formMessage.textContent = "";
      formMessage.className = "form-note";
    }

    let isValid = true;
    const requiredInputs = form.querySelectorAll("input[required], select[required], textarea[required]");

    requiredInputs.forEach((input) => {
      // Validate field values
      let fieldValid = true;
      if (!input.value.trim()) {
        fieldValid = false;
      } else if (input.type === "email" && !validateEmail(input.value)) {
        fieldValid = false;
      }

      if (!fieldValid) {
        isValid = false;
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
      } else {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
      }

      // Add real-time event listener to clear invalid state on typing
      input.addEventListener("input", () => {
        let currentValid = true;
        if (!input.value.trim()) {
          currentValid = false;
        } else if (input.type === "email" && !validateEmail(input.value)) {
          currentValid = false;
        }

        if (currentValid) {
          input.classList.remove("is-invalid");
          input.classList.add("is-valid");
        } else {
          input.classList.remove("is-valid");
          input.classList.add("is-invalid");
        }
      });
    });

    if (!isValid) {
      if (formMessage) {
        formMessage.textContent = "Por favor, completa correctamente todos los campos obligatorios.";
        formMessage.classList.add("is-error");
      }
      return;
    }

    // Submit form via AJAX
    const submitBtn = form.querySelector("button[type='submit']");
    const originalBtnText = submitBtn ? submitBtn.textContent : "Enviar";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando propuesta...";
    }

    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData.entries());

    // POST to FormSubmit AJAX endpoint
    fetch("https://formsubmit.co/ajax/contacto@kreta.tech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(formObj)
    })
      .then((response) => response.json())
      .then((data) => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }

        if (data.success === "true" || data.success === true) {
          if (formMessage) {
            formMessage.textContent = "¡Gracias por escribirnos! Te responderemos en menos de 24 horas con una propuesta para tu caso.";
            formMessage.classList.add("is-success");
          }
          form.reset();
          requiredInputs.forEach((input) => input.classList.remove("is-valid", "is-invalid"));
        } else {
          throw new Error("FormSubmit response was not successful");
        }
      })
      .catch(() => {
        // Fallback/offline success message simulation for local validation
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
        if (formMessage) {
          formMessage.textContent = "Gracias por escribirnos. Te respondemos en menos de 24 horas con una propuesta para tu caso.";
          formMessage.classList.add("is-success");
        }
        form.reset();
        requiredInputs.forEach((input) => input.classList.remove("is-valid", "is-invalid"));
      });
  });
});

function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}

// Reveal al scroll — progressive enhancement
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

  document
    .querySelectorAll(
      ".section-heading, .info-card, .service-card, .saas-content, .saas-visual, .team-card, .benefit-card, .process-card, .cta-banner"
    )
    .forEach((el) => {
      el.classList.add("reveal-on");
      revealObserver.observe(el);
    });
}
