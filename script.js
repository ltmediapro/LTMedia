const modal = document.querySelector("#contact-modal");
const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

function openModal() {
  modal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => modal.querySelector("input")?.focus(), 0);
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

document.querySelectorAll("[data-open-modal]").forEach((button) => button.addEventListener("click", openModal));
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();
});

menuToggle?.addEventListener("click", () => {
  const open = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "Thanks — your enquiry is ready for the LT Media team.";
  form.reset();
});

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

document.querySelector(".brand-image")?.addEventListener("error", (event) => {
  event.currentTarget.hidden = true;
  document.querySelector(".brand-fallback").style.display = "block";
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      instance.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
