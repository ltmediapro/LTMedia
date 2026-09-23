const INTRO_STORAGE_KEY = "ltmedia-intro-seen";
const introLoader = document.querySelector("#intro-loader");
const introVideo = document.querySelector("#intro-video");
const skipIntroButton = document.querySelector("#skip-intro");

function hasSeenIntro() {
  try {
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
  } catch {
    // If storage is unavailable, the intro still completes normally.
  }
}

function finishIntro() {
  if (!introLoader || introLoader.classList.contains("is-exiting")) return;
  markIntroSeen();
  introLoader.classList.add("is-exiting");
  window.setTimeout(() => {
    document.body.classList.remove("intro-active");
    introLoader.hidden = true;
    introLoader.setAttribute("aria-hidden", "true");
  }, 360);
}

function setupIntro() {
  if (!introLoader || !introVideo || hasSeenIntro()) {
    introLoader?.setAttribute("aria-hidden", "true");
    if (introLoader) introLoader.hidden = true;
    document.body.classList.remove("intro-active");
    return;
  }

  introVideo.muted = true;
  introVideo.addEventListener("ended", finishIntro, { once: true });
  introVideo.addEventListener("error", finishIntro, { once: true });
  skipIntroButton?.addEventListener("click", finishIntro, { once: true });

  window.setTimeout(() => {
    if (!introLoader.classList.contains("is-exiting") && skipIntroButton) {
      skipIntroButton.hidden = false;
      skipIntroButton.classList.add("is-ready");
    }
  }, 1000);

  const playback = introVideo.play();
  playback?.catch(() => {
    if (skipIntroButton) {
      skipIntroButton.hidden = false;
      skipIntroButton.classList.add("is-ready");
    }
  });
}

setupIntro();

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
