(() => {
  'use strict';

  const root = document.documentElement;

  /* ---------- Theme ---------- */
  const THEME_KEY = 'kn-theme';
  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    const color = theme === 'light' ? '#f7f7fb' : '#07070b';
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((m) => m.setAttribute('content', color));
  };

  const stored = (() => {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  })();
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(stored || (prefersLight ? 'light' : 'dark'));

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch {}
    });
  }

  /* ---------- Nav: scroll state + burger ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const navLinksWrap = document.querySelector('.nav__links');
  const navLinks = Array.from(document.querySelectorAll('.nav__links a[data-nav]'));

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 6);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (burger && navLinksWrap) {
    burger.addEventListener('click', () => {
      const open = navLinksWrap.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    navLinksWrap.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        navLinksWrap.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Active nav link via IntersectionObserver ---------- */
  const sectionIds = navLinks.map(a => a.getAttribute('href')).filter(Boolean);
  const sections = sectionIds
    .map(id => document.querySelector(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const setActive = (id) => {
      navLinks.forEach(a => {
        a.classList.toggle('is-active', a.getAttribute('href') === id);
      });
    };

    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive('#' + visible.target.id);
    }, {
      rootMargin: '-45% 0px -50% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && reveals.length) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => ro.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-revealed'));
  }

  /* ---------- Subtle mouse glow on skill cards ---------- */
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
