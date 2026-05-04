/* ============================================================
   Anis Kitchens — Interactions
   ============================================================ */
(function () {
  'use strict';

  const WHATSAPP_NUMBER = '972525970972';

  /* ----- Year ----- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Header scroll states ----- */
  const header = document.getElementById('siteHeader');
  const hero = document.querySelector('.hero');
  const fab = document.querySelector('.whatsapp-fab');

  function updateHeader() {
    if (!header) return;
    const scrolled = window.scrollY > 24;
    header.classList.toggle('is-scrolled', scrolled);
    header.classList.toggle('is-hero', !scrolled);

    if (fab) fab.classList.toggle('is-visible', window.scrollY > 600);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader);

  /* ----- Mobile nav ----- */
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  function setNav(open) {
    if (!toggle || !mobileNav) return;
    toggle.classList.toggle('is-open', open);
    mobileNav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    mobileNav.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.contains('is-open');
      setNav(!isOpen);
    });
    mobileNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setNav(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        setNav(false);
      }
    });
  }

  /* ----- Reveal on scroll ----- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ----- Smooth scroll with header offset ----- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header ? header.offsetHeight : 0) + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      try { history.replaceState(null, '', id); } catch (_) {}
    });
  });

  /* ----- Contact form → WhatsApp ----- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = (form.elements.name?.value || '').trim();
      const phone = (form.elements.phone?.value || '').trim();
      const city = (form.elements.city?.value || '').trim();
      const message = (form.elements.message?.value || '').trim();

      if (!name || !phone) {
        if (status) status.textContent = 'נא למלא לפחות שם וטלפון.';
        return;
      }

      const lines = [
        'שלום, פנייה דרך אתר אניס מטבחים',
        '',
        'שם: ' + name,
        'טלפון: ' + phone,
      ];
      if (city) lines.push('עיר/אזור: ' + city);
      if (message) {
        lines.push('');
        lines.push('פרטי הפרויקט:');
        lines.push(message);
      }

      const text = lines.join('\n');
      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);

      if (status) status.textContent = 'מעביר ל‑WhatsApp…';
      window.open(url, '_blank', 'noopener');
      setTimeout(() => {
        if (status) status.textContent = 'נפתח חלון WhatsApp עם פרטי הפנייה.';
      }, 600);
    });
  }
})();
