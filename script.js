/* ===================================================================
   TANJIM MAHBUB — PORTFOLIO SCRIPT (v2)
   Vanilla JS, no dependencies. Handles: scroll progress, masthead
   state, mobile menu, scroll reveals, smooth scroll offset, footer year.
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
    initFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
