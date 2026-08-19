/* ===================================================================
   TANJIM MAHBUB — PORTFOLIO SCRIPT (v3)
   Vanilla JS, no dependencies. Handles: scroll progress, masthead
   state, mobile menu, scroll reveals, smooth scroll offset, image
   lightbox, active nav-state, image-load fallback, footer year.
   Deliberately minimal — no counters, no skill bars, no testimonial
   carousel. The brief asked for subtle motion only.
   =================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* -----------------------------------------------------------
     1. SCROLL PROGRESS — hairline indicator, top of page
  ----------------------------------------------------------- */
  function initScrollProgress() {
    var bar = document.getElementById('progress');
    if (!bar) return;

    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* -----------------------------------------------------------
     2. MASTHEAD STATE — adds a hairline border once scrolled
  ----------------------------------------------------------- */
  function initMasthead() {
    var masthead = document.getElementById('masthead');
    if (!masthead) return;

    function update() {
      if (window.scrollY > 12) {
        masthead.classList.add('is-scrolled');
      } else {
        masthead.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* -----------------------------------------------------------
     3. MOBILE MENU
  ----------------------------------------------------------- */
  function initMobileMenu() {
    var btn = document.getElementById('menuBtn');
    var menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    function close() {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function toggle() {
      var isOpen = menu.classList.toggle('is-open');
      btn.classList.toggle('is-active', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    btn.addEventListener('click', toggle);
    qsa('a', menu).forEach(function (link) { link.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* -----------------------------------------------------------
     4. SCROLL REVEAL — quiet fade/rise, staggered slightly
     Applies to work items, timeline entries, and achievement
     entries so the page never reveals as one flat block.
  ----------------------------------------------------------- */
  function initScrollReveal() {
    var targets = qsa(
      '.work-item, .work-minor, .timeline__entry, .achievement-entry, .about__para, ' +
      '.research__fact, .focus-list__item, .philosophy__para, .code__row, .highlights-row__item'
    );
    if (!targets.length) return;

    targets.forEach(function (el) { el.classList.add('will-reveal'); });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* -----------------------------------------------------------
     5. SMOOTH SCROLL with masthead-height offset
  ----------------------------------------------------------- */
  function initSmoothScroll() {
    var links = qsa('a[href^="#"]');
    var masthead = document.getElementById('masthead');

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        if (!hash || hash === '#') return;
        var target = qs(hash);
        if (!target) return;

        e.preventDefault();
        var offset = masthead ? masthead.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - offset - 8;

        window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

        var menu = document.getElementById('mobileMenu');
        var btn = document.getElementById('menuBtn');
        if (menu && menu.classList.contains('is-open')) {
          menu.classList.remove('is-open');
          if (btn) btn.classList.remove('is-active');
          document.body.style.overflow = '';
        }
      });
    });
  }

  /* -----------------------------------------------------------
     IMAGE FALLBACK — if an asset hasn't been uploaded yet, show
     a quiet placeholder instead of a broken-image glyph.
  ----------------------------------------------------------- */
  function initImageFallback() {
    var imgs = qsa(
      '.portrait-frame__img, .work-item__media img, .work-minor__media img, .achievement-entry__cert img'
    );
    imgs.forEach(function (img) {
      img.addEventListener('error', function () {
        var wrapper = img.closest('.portrait-frame, .work-item__media, .work-minor__media, .achievement-entry__cert');
        if (!wrapper) return;
        wrapper.classList.add('media-missing');
        wrapper.setAttribute('data-missing-label', 'Image pending');
        var trigger = wrapper.querySelector('.media-trigger');
        if (trigger) trigger.setAttribute('data-missing', 'true');
      });
    });
  }

  /* -----------------------------------------------------------
     LIGHTBOX — click a project/certificate image to enlarge it.
     Lightweight, no dependencies, closes on ESC / backdrop /
     close button, traps focus, restores focus on close.
  ----------------------------------------------------------- */
  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var img = document.getElementById('lightboxImg');
    var caption = document.getElementById('lightboxCaption');
    var closeBtn = document.getElementById('lightboxClose');
    var triggers = qsa('.media-trigger');
    if (!lightbox || !img || !closeBtn || !triggers.length) return;

    var lastFocused = null;

    function open(src, alt, captionText) {
      lastFocused = document.activeElement;
      img.src = src;
      img.alt = alt || '';
      caption.textContent = captionText || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      closeBtn.focus();
      document.addEventListener('keydown', onKeydown);
    }

    function close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      document.removeEventListener('keydown', onKeydown);
      img.src = '';
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    function onKeydown(e) {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key === 'Tab') {
        // Single focusable element inside the dialog — keep focus trapped on it.
        e.preventDefault();
        closeBtn.focus();
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        if (trigger.getAttribute('data-missing') === 'true') return;
        var src = trigger.getAttribute('data-lightbox-src');
        var captionText = trigger.getAttribute('data-lightbox-caption');
        var innerImg = trigger.querySelector('img');
        var alt = innerImg ? innerImg.getAttribute('alt') : '';
        if (src) open(src, alt, captionText);
      });
    });

    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });
  }

  /* -----------------------------------------------------------
     ACTIVE NAV STATE — highlights the nav link for the section
     currently in view.
  ----------------------------------------------------------- */
  function initActiveNav() {
    var navLinks = qsa('.masthead__nav a[href^="#"]');
    if (!navLinks.length || !('IntersectionObserver' in window)) return;

    var sections = navLinks
      .map(function (link) { return document.querySelector(link.getAttribute('href')); })
      .filter(Boolean);
    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === id);
        });
      });
    }, { threshold: 0, rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* -----------------------------------------------------------
     6. FOOTER YEAR
  ----------------------------------------------------------- */
  function initFooterYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* -----------------------------------------------------------
     INIT
  ----------------------------------------------------------- */
  function init() {
    initScrollProgress();
    initMasthead();
    initMobileMenu();
    initScrollReveal();
    initSmoothScroll();
    initImageFallback();
    initLightbox();
    initActiveNav();
    initFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
