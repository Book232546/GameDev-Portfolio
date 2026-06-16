const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
const alertTriggers = document.querySelectorAll('[data-alert]');
const reveals = document.querySelectorAll('.reveal');
const shotPrev = document.getElementById('shotPrev');
const shotNext = document.getElementById('shotNext');
const shotImage = document.getElementById('shotImage');
const shotCounter = document.getElementById('shotCounter');
const shotDots = document.getElementById('shotDots');
const lightbox = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxBackdrop = document.querySelector('[data-lightbox-close]');

// Build screenshot list dynamically from data-screenshots attribute on the carousel element.
// To add/remove images, edit ONLY the data-screenshots list in Port.html — no JS changes needed.
const carouselEl = document.querySelector('[data-screenshots]');
const screenshotImages = carouselEl
  ? carouselEl.dataset.screenshots
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((src, i) => ({ src, alt: `Game screenshot ${i + 1}` }))
  : [];

let currentScreenshotIndex = 0;

function updateNavState() {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}

function closeMobileMenu() {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}

function isLightboxOpen() {
  return Boolean(lightbox && lightbox.classList.contains('open'));
}

function syncLightbox() {
  if (!lightboxImage || !lightboxCaption) {
    return;
  }

  const current = screenshotImages[currentScreenshotIndex];
  lightboxImage.src = current.src;
  lightboxImage.alt = current.alt;
  lightboxCaption.textContent = `${currentScreenshotIndex + 1} / ${screenshotImages.length}`;
}

function updateDots() {
  if (!shotDots) {
    return;
  }

  Array.from(shotDots.children).forEach((dot, index) => {
    const isActive = index === currentScreenshotIndex;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
}

function renderScreenshot(index) {
  const total = screenshotImages.length;
  currentScreenshotIndex = (index + total) % total;
  const current = screenshotImages[currentScreenshotIndex];

  shotImage.src = current.src;
  shotImage.alt = current.alt;
  shotCounter.textContent = `${currentScreenshotIndex + 1} / ${total}`;
  updateDots();
  syncLightbox();
}

function buildDots() {
  if (!shotDots) {
    return;
  }

  shotDots.innerHTML = '';

  screenshotImages.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Go to screenshot ${index + 1}`);
    dot.addEventListener('click', () => {
      renderScreenshot(index);
    });
    shotDots.appendChild(dot);
  });
}

function openLightbox() {
  if (!lightbox) {
    return;
  }

  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  syncLightbox();
}

function closeLightbox() {
  if (!lightbox) {
    return;
  }

  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

updateNavState();

window.addEventListener('scroll', updateNavState, { passive: true });

toggle.addEventListener('click', () => {
  const isOpen = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
});

links.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

alertTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    alert(trigger.dataset.alert);
  });
});

buildDots();

if (shotPrev && shotNext && shotImage && shotCounter && screenshotImages.length > 0) {
  renderScreenshot(0);

  shotPrev.addEventListener('click', () => {
    renderScreenshot(currentScreenshotIndex - 1);
  });

  shotNext.addEventListener('click', () => {
    renderScreenshot(currentScreenshotIndex + 1);
  });

  shotImage.addEventListener('click', openLightbox);
  shotImage.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox();
    }
  });
}

if (shotCounter && screenshotImages.length > 0) {
  shotCounter.textContent = `1 / ${screenshotImages.length}`;
}

if (lightboxCaption && screenshotImages.length > 0) {
  lightboxCaption.textContent = `1 / ${screenshotImages.length}`;
}

if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
}

if (lightboxPrev) {
  lightboxPrev.addEventListener('click', () => {
    renderScreenshot(currentScreenshotIndex - 1);
    openLightbox();
  });
}

if (lightboxNext) {
  lightboxNext.addEventListener('click', () => {
    renderScreenshot(currentScreenshotIndex + 1);
    openLightbox();
  });
}

if (lightboxBackdrop) {
  lightboxBackdrop.addEventListener('click', closeLightbox);
}

document.addEventListener('keydown', (event) => {
  if (!isLightboxOpen()) {
    return;
  }

  if (event.key === 'Escape') {
    closeLightbox();
  }

  if (event.key === 'ArrowLeft') {
    renderScreenshot(currentScreenshotIndex - 1);
  }

  if (event.key === 'ArrowRight') {
    renderScreenshot(currentScreenshotIndex + 1);
  }
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('visible'));
}
