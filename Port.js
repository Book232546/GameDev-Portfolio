const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
const alertTriggers = document.querySelectorAll('[data-alert]');
const reveals = document.querySelectorAll('.reveal');
const lightbox = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxBackdrop = document.querySelector('[data-lightbox-close]');

// Support multiple carousels on the page. Each carousel reads its own `data-screenshots` list.
const carouselEls = Array.from(document.querySelectorAll('[data-screenshots]'));

let activeLightboxImages = [];
let activeLightboxIndex = 0;

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
  if (!lightboxImage || !lightboxCaption || !activeLightboxImages.length) {
    return;
  }

  const current = activeLightboxImages[activeLightboxIndex];
  lightboxImage.src = current.src;
  lightboxImage.alt = current.alt;
  lightboxCaption.textContent = `${activeLightboxIndex + 1} / ${activeLightboxImages.length}`;
}

function openLightboxFor(carouselImages, index) {
  if (!lightbox) return;
  activeLightboxImages = carouselImages;
  activeLightboxIndex = (index + carouselImages.length) % carouselImages.length;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  syncLightbox();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Initialize each carousel independently
carouselEls.forEach((carouselEl) => {
  const screenshots = carouselEl.dataset.screenshots
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((src, i) => ({ src, alt: `Screenshot ${i + 1}` }));

  if (!screenshots.length) return;

  const prevBtn = carouselEl.querySelector('.carousel-btn-prev');
  const nextBtn = carouselEl.querySelector('.carousel-btn-next');
  const imgEl = carouselEl.querySelector('img');
  const counterEl = carouselEl.querySelector('.carousel-counter');
  // find the dots container nearby (sibling inside same parent)
  const dotsContainer = carouselEl.parentElement.querySelector('.carousel-dots');

  let currentIndex = 0;

  function updateDots() {
    if (!dotsContainer) return;
    Array.from(dotsContainer.children).forEach((dot, idx) => {
      const isActive = idx === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function render(index) {
    const total = screenshots.length;
    currentIndex = (index + total) % total;
    const current = screenshots[currentIndex];
    if (imgEl) {
      imgEl.src = current.src;
      imgEl.alt = current.alt;
    }
    if (counterEl) {
      counterEl.textContent = `${currentIndex + 1} / ${total}`;
    }
    updateDots();
  }

  // build dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    screenshots.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to screenshot ${idx + 1}`);
      dot.addEventListener('click', () => render(idx));
      dotsContainer.appendChild(dot);
    });
  }

  // attach controls
  if (prevBtn) prevBtn.addEventListener('click', () => render(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => render(currentIndex + 1));

  if (imgEl) {
    imgEl.addEventListener('click', () => openLightboxFor(screenshots, currentIndex));
    imgEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightboxFor(screenshots, currentIndex);
      }
    });
  }

  // initial render
  render(0);
});

// lightbox navigation
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev) {
  lightboxPrev.addEventListener('click', () => {
    if (!activeLightboxImages.length) return;
    activeLightboxIndex = (activeLightboxIndex - 1 + activeLightboxImages.length) % activeLightboxImages.length;
    syncLightbox();
  });
}
if (lightboxNext) {
  lightboxNext.addEventListener('click', () => {
    if (!activeLightboxImages.length) return;
    activeLightboxIndex = (activeLightboxIndex + 1) % activeLightboxImages.length;
    syncLightbox();
  });
}
if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (event) => {
  if (!isLightboxOpen()) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') {
    if (!activeLightboxImages.length) return;
    activeLightboxIndex = (activeLightboxIndex - 1 + activeLightboxImages.length) % activeLightboxImages.length;
    syncLightbox();
  }
  if (event.key === 'ArrowRight') {
    if (!activeLightboxImages.length) return;
    activeLightboxIndex = (activeLightboxIndex + 1) % activeLightboxImages.length;
    syncLightbox();
  }
});

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

// IntersectionObserver reveal logic continues below
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
