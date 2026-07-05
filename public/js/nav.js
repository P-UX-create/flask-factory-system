(function initNav() {
  const hamburger = document.getElementById('navHamburger');
  const nav       = document.getElementById('sideNav');
  const backdrop  = document.getElementById('navBackdrop');
  const logoutBtn = document.getElementById('logoutBtn');

  if (!hamburger || !nav) return;

  // ── Active route ──────────────────────────────────────────────────────────
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link[data-route]').forEach(link => {
    const route = link.dataset.route.replace(/\/$/, '');
    if (route === currentPath) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // ── State helpers ─────────────────────────────────────────────────────────
  const isMobile = () => window.innerWidth <= 820;

  function open() {
    nav.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close navigation');
    if (isMobile()) {
      backdrop.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }
  }

  function close() {
    nav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
    backdrop.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  // ── Click: always bound, behavior differs by breakpoint ──────────────────
 hamburger.addEventListener('click', () => {
    if (isMobile()) {
      // Mobile: click toggles
      nav.classList.contains('is-open') ? close() : open();
    } else {
      // Desktop: click also works as a fallback toggle
      nav.classList.contains('is-open') ? close() : open();
    }
  });

  // ── Desktop: hover intent (always bound, guarded inside) ──────────────────
  let hoverTimer = null;

  hamburger.addEventListener('mouseenter', () => {
    if (isMobile()) return;
    clearTimeout(hoverTimer);
    open();
  });

  hamburger.addEventListener('mouseleave', () => {
    if (isMobile()) return;
    hoverTimer = setTimeout(() => {
      // Only close if nav itself isn't being hovered
      if (!nav.matches(':hover')) close();
    }, 150);
  });

  nav.addEventListener('mouseenter', () => {
    if (isMobile()) return;
    clearTimeout(hoverTimer);
  });

  nav.addEventListener('mouseleave', () => {
    if (isMobile()) return;
    hoverTimer = setTimeout(close, 150);
  });

  // ── Backdrop + Escape ─────────────────────────────────────────────────────
  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) close();
  });

  // ── Close on nav link click (mobile) ─────────────────────────────────────
  nav.querySelectorAll('.nav-link[data-route]').forEach(link => {
    link.addEventListener('click', () => { if (isMobile()) close(); });
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } catch { /* best effort */ }
      finally {
        window.location.replace('/');
      }
    });
  }
})();