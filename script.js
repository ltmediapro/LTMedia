const INTRO_STORAGE_KEY = "ltmedia-intro-seen";
const INTRO_MAX_DURATION = 4000;
const introLoader = document.querySelector("#intro-loader");
const introVideo = document.querySelector("#intro-video");
const skipIntro = document.querySelector("#skip-intro");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let introFinishTimer;
let lenis = null;

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
    console.warn("[LTMedia] Session storage is unavailable; the intro will play again later.");
  }
}

function unlockScroll() {
  document.body.classList.remove("intro-active");
  lenis?.start();
}

function lockScroll() {
  document.body.classList.add("intro-active");
  lenis?.stop();
}

function finishIntro(reason = "complete") {
  if (!introLoader || introLoader.classList.contains("is-exiting")) return;
  window.clearTimeout(introFinishTimer);
  introVideo?.pause();
  markIntroSeen();
  if (reason !== "complete") {
    console.info("[LTMedia] Intro skipped: " + reason + ".");
  }
  introLoader.classList.add("is-exiting");
  window.setTimeout(() => {
    unlockScroll();
    introLoader.hidden = true;
    introLoader.setAttribute("aria-hidden", "true");
    introLoader.remove();
  }, 360);
}

function setupIntro() {
  if (!introLoader || !introVideo || hasSeenIntro() || prefersReducedMotion.matches) {
    if (prefersReducedMotion.matches) {
      console.info("[LTMedia] Reduced motion is enabled; skipping the intro video.");
    }
    introLoader?.setAttribute("aria-hidden", "true");
    if (introLoader) introLoader.hidden = true;
    unlockScroll();
    return;
  }

  lockScroll();
  if (skipIntro) {
    skipIntro.hidden = false;
    skipIntro.addEventListener("click", () => finishIntro("manual skip"), { once: true });
  }

  introVideo.muted = true;
  introVideo.addEventListener("loadedmetadata", () => {
    console.info("[LTMedia] Intro video metadata loaded.");
  }, { once: true });
  introVideo.addEventListener("playing", () => {
    window.clearTimeout(introFinishTimer);
    console.info("[LTMedia] Intro video playback started.");
  }, { once: true });
  introVideo.addEventListener("ended", () => finishIntro("video ended"), { once: true });
  introVideo.addEventListener("error", (event) => {
    console.error("[LTMedia] Intro video failed to load. Check lt-media-intro.mp4 and its codec.", event);
    finishIntro("video error");
  }, { once: true });

  introFinishTimer = window.setTimeout(() => {
    console.error("[LTMedia] Intro video did not start within 4 seconds.");
    finishIntro("start timeout");
  }, INTRO_MAX_DURATION);

  const playback = introVideo.play();
  playback?.catch((error) => {
    console.error("[LTMedia] Intro video play() failed.", error);
    finishIntro("playback failure");
  });
}

function setupLenis() {
  if (prefersReducedMotion.matches || lenis) return;
  if (!window.Lenis) {
    console.error("[LTMedia] Lenis v1.1.18 was not loaded; native scrolling will be used.");
    return;
  }

  lenis = new window.Lenis({
    autoRaf: false,
    anchors: true,
    smoothWheel: true,
    syncTouch: true
  });

  if (document.body.classList.contains("intro-active")) {
    lenis.stop();
  }

  function raf(time) {
    if (!lenis) return;
    lenis.raf(time);
    window.requestAnimationFrame(raf);
  }

  window.requestAnimationFrame(raf);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupLenis, { once: true });
} else {
  setupLenis();
}

setupIntro();

function setupParticles() {
  const particleCanvas = document.querySelector(".background-layer");
  const particleContext = particleCanvas?.getContext("2d");
  if (!particleCanvas || !particleContext || prefersReducedMotion.matches) {
    if (particleCanvas && prefersReducedMotion.matches) particleCanvas.hidden = true;
    return;
  }

  const colors = ["#3b82f6", "#60a5fa", "#1d4ed8"];
  let particles = [];
  let particleAnimationFrame = null;
  let lastParticleTime = 0;

  const getParticleCount = () => window.matchMedia("(max-width: 680px)").matches ? 30 : 70;

  function createParticles() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    particles = Array.from({ length: getParticleCount() }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.35 + 0.25,
      twinkleSpeed: Math.random() * 0.0012 + 0.0004,
      phase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }

  function resizeParticles() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    particleCanvas.width = Math.floor(window.innerWidth * pixelRatio);
    particleCanvas.height = Math.floor(window.innerHeight * pixelRatio);
    particleContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createParticles();
  }

  function stopParticles() {
    if (particleAnimationFrame) {
      window.cancelAnimationFrame(particleAnimationFrame);
      particleAnimationFrame = null;
    }
    lastParticleTime = 0;
  }

  function animateParticles(time) {
    if (document.hidden) {
      particleAnimationFrame = null;
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const delta = lastParticleTime ? Math.min((time - lastParticleTime) / 16.67, 3) : 1;
    lastParticleTime = time;
    particleContext.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      if (particle.x < -particle.radius) particle.x = width + particle.radius;
      if (particle.x > width + particle.radius) particle.x = -particle.radius;
      if (particle.y < -particle.radius) particle.y = height + particle.radius;
      if (particle.y > height + particle.radius) particle.y = -particle.radius;

      const opacity = Math.max(
        0.05,
        Math.min(0.9, particle.opacity + Math.sin(time * particle.twinkleSpeed + particle.phase) * 0.12)
      );
      particleContext.globalAlpha = opacity;
      particleContext.fillStyle = particle.color;
      particleContext.shadowColor = particle.color;
      particleContext.shadowBlur = particle.radius * 5;
      particleContext.beginPath();
      particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      particleContext.fill();
    });

    particleContext.globalAlpha = 1;
    particleContext.shadowBlur = 0;
    particleAnimationFrame = window.requestAnimationFrame(animateParticles);
  }

  function startParticles() {
    if (!particleAnimationFrame && !document.hidden) {
      lastParticleTime = performance.now();
      particleAnimationFrame = window.requestAnimationFrame(animateParticles);
    }
  }

  resizeParticles();
  startParticles();
  window.addEventListener("resize", resizeParticles, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopParticles();
    } else {
      startParticles();
    }
  });
}

setupParticles();

const cursorGlow = document.querySelector(".cursor-glow");
if (cursorGlow && !prefersReducedMotion.matches && window.matchMedia("(hover: hover)").matches) {
  document.addEventListener("mousemove", (event) => {
    cursorGlow.style.left = event.clientX + "px";
    cursorGlow.style.top = event.clientY + "px";
  }, { passive: true });
}

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
