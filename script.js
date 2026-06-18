const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-links");
const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
const sections = document.querySelectorAll("main section[id]");
const contactForm = document.querySelector(".contact-form");
const formMessage = document.querySelector("#form-message");

if (menuToggle && navMenu) {
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

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      const currentLink = document.querySelector(`.nav-links a[href="#${id}"]`);

      if (!currentLink) return;

      if (entry.isIntersecting) {
        document
          .querySelectorAll(".nav-links a[href^='#']")
          .forEach((link) => link.classList.remove("is-active"));

        currentLink.classList.add("is-active");
      }
    });
  },
  {
    threshold: 0.4,
    rootMargin: "-10% 0px -40% 0px",
  }
);

sections.forEach((section) => sectionObserver.observe(section));

if (contactForm && formMessage) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formMessage.textContent =
      "Gracias por escribirnos. Te respondemos en menos de 24 horas con una propuesta para tu caso.";
    formMessage.classList.add("is-success");
    contactForm.reset();
  });
}

// Reveal al scroll — progressive enhancement (sin JS, todo queda visible)
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
