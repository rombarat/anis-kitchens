/* ============================================================
   Anis Kitchens — Interactions
   ============================================================ */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '972525970972';
  var MOBILE_BREAKPOINT = 960;

  /* ----- Year ----- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var header = document.getElementById('siteHeader');
  var fab = document.querySelector('.whatsapp-fab');
  var toggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');

  /* ============================================================
     Header scroll states (rAF-throttled)
     ============================================================ */
  var ticking = false;

  function updateHeader() {
    ticking = false;
    if (!header) return;
    var y = window.scrollY || window.pageYOffset || 0;
    var scrolled = y > 24;
    header.classList.toggle('is-scrolled', scrolled);
    header.classList.toggle('is-hero', !scrolled);
    if (fab) fab.classList.toggle('is-visible', y > 600);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateHeader);
    }
  }

  updateHeader();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ============================================================
     Mobile nav — iOS-safe scroll lock + focus management
     ============================================================ */
  var savedScrollY = 0;
  var navIsOpen = false;
  var lastFocused = null;

  function lockScroll() {
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = -savedScrollY + 'px';
    document.body.classList.add('nav-open');
  }

  function unlockScroll() {
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    // Restore instantly — smooth behaviour here would fight the menu close.
    var prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, savedScrollY);
    document.documentElement.style.scrollBehavior = prev;
  }

  function setNav(open) {
    if (!toggle || !mobileNav || open === navIsOpen) return;
    navIsOpen = open;

    toggle.classList.toggle('is-open', open);
    mobileNav.classList.toggle('is-open', open);
    if (header) header.classList.toggle('is-nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
    mobileNav.setAttribute('aria-hidden', String(!open));

    if (open) {
      lastFocused = document.activeElement;
      lockScroll();
      var first = mobileNav.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    } else {
      unlockScroll();
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus({ preventScroll: true });
      }
      lastFocused = null;
    }
    updateHeader();
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      setNav(!navIsOpen);
    });

    // Close on any menu link (the smooth-scroll handler below then takes over).
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (!navIsOpen) return;

      if (e.key === 'Escape') {
        setNav(false);
        return;
      }

      // Trap focus inside the open menu.
      if (e.key === 'Tab') {
        var items = [toggle].concat(
          Array.prototype.slice.call(mobileNav.querySelectorAll('a[href], button:not([disabled])'))
        );
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Never leave the menu open (and the page locked) when rotating to desktop.
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (navIsOpen && window.innerWidth > MOBILE_BREAKPOINT) setNav(false);
        updateHeader();
      }, 120);
    });
  }

  /* ----- Hide the floating WhatsApp button over the contact section ----- */
  var contactSection = document.getElementById('contact');
  if (fab && contactSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        fab.classList.toggle('is-hidden', entry.isIntersecting);
      });
    }, { threshold: 0.12 }).observe(contactSection);
  }

  /* ============================================================
     Reveal on scroll
     ============================================================ */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });

    // Safety net: anything still hidden after 3s becomes visible regardless.
    setTimeout(function () {
      Array.prototype.forEach.call(reveals, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
      });
    }, 3000);
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
  }

  /* ============================================================
     Smooth scroll with header offset
     ============================================================ */
  function scrollToTarget(target) {
    var offset = (header ? header.offsetHeight : 0) + 12;
    var top = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - offset;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  }

  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      var target;
      try {
        target = document.querySelector(id);
      } catch (_) {
        return;
      }
      if (!target) return;
      e.preventDefault();

      // If the menu was open, the scroll lock has just been released — wait a
      // frame so offsets are measured against the restored document.
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          scrollToTarget(target);
          try { history.replaceState(null, '', id); } catch (_) {}
        });
      });
    });
  });

  /* ============================================================
     Contact form → WhatsApp
     ============================================================ */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  function setFieldError(input, message) {
    if (!input) return;
    var errEl = document.getElementById(input.id + 'Error');
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (errEl) {
        errEl.textContent = message;
        errEl.classList.add('is-shown');
      }
    } else {
      input.removeAttribute('aria-invalid');
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.remove('is-shown');
      }
    }
  }

  // Israeli mobile/landline: 9–10 digits, optionally +972 prefixed.
  function normalisePhone(raw) {
    return raw.replace(/[\s\-().]/g, '');
  }

  function isValidPhone(raw) {
    var v = normalisePhone(raw);
    if (/^\+?972\d{8,9}$/.test(v)) return true;
    return /^0\d{8,9}$/.test(v);
  }

  if (form) {
    var nameInput = form.querySelector('#name');
    var phoneInput = form.querySelector('#phone');

    [nameInput, phoneInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') setFieldError(input, '');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = (nameInput && nameInput.value || '').trim();
      var phone = (phoneInput && phoneInput.value || '').trim();
      var city = (form.querySelector('#city') && form.querySelector('#city').value || '').trim();
      var message = (form.querySelector('#message') && form.querySelector('#message').value || '').trim();

      var firstInvalid = null;

      if (name.length < 2) {
        setFieldError(nameInput, 'נא למלא שם מלא.');
        firstInvalid = firstInvalid || nameInput;
      } else {
        setFieldError(nameInput, '');
      }

      if (!phone) {
        setFieldError(phoneInput, 'נא למלא מספר טלפון.');
        firstInvalid = firstInvalid || phoneInput;
      } else if (!isValidPhone(phone)) {
        setFieldError(phoneInput, 'מספר הטלפון לא נראה תקין. לדוגמה: 052-5970972');
        firstInvalid = firstInvalid || phoneInput;
      } else {
        setFieldError(phoneInput, '');
      }

      if (firstInvalid) {
        if (status) status.textContent = 'יש להשלים את הפרטים המסומנים.';
        firstInvalid.focus();
        return;
      }

      var lines = [
        'שלום, פנייה דרך אתר אניס מטבחים',
        '',
        'שם: ' + name,
        'טלפון: ' + phone
      ];
      if (city) lines.push('עיר/אזור: ' + city);
      if (message) {
        lines.push('');
        lines.push('פרטי הפרויקט:');
        lines.push(message);
      }

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));

      if (status) status.textContent = 'מעביר ל‑WhatsApp…';

      var win = window.open(url, '_blank', 'noopener');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Popup blocked (common on iOS) — navigate in place instead.
        window.location.href = url;
        return;
      }

      setTimeout(function () {
        if (status) status.textContent = 'נפתח חלון WhatsApp עם פרטי הפנייה.';
      }, 600);
    });
  }
})();
