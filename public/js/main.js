document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  initMobileNav();
  initHeroCarousel();
});

function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileNav');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    });
  });
}

function initHeroCarousel() {
  const slidesContainer = document.getElementById('heroSlides');
  const dotsContainer = document.getElementById('heroDots');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  if (!slidesContainer || !dotsContainer) return;

  const slides = Array.from(slidesContainer.querySelectorAll('.hero-slide'));
  if (slides.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AUTOPLAY_MS = 6000;

  let current = slides.findIndex(s => s.classList.contains('is-active'));
  if (current < 0) current = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i, true));
    dotsContainer.appendChild(dot);
  });

  function render() {
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    const dots = dotsContainer.querySelectorAll('button');
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
  }

  function goTo(index, userInitiated) {
    current = (index + slides.length) % slides.length;
    render();
    if (userInitiated) restartAutoplay();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    timer = setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
  }
  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1, true));
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1, true));

  const heroSection = slidesContainer.closest('.hero');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoplay);
    heroSection.addEventListener('mouseleave', startAutoplay);
    heroSection.addEventListener('touchstart', stopAutoplay, { passive: true });
    heroSection.addEventListener('touchend', startAutoplay, { passive: true });
  }

  render();
  startAutoplay();
}