// Revna — main.js
// Hamburger nav toggle + scroll reveal + basic analytics hooks

(function () {
  'use strict';

  function trackEvent(name, props) {
    if (typeof window.plausible === 'function') {
      window.plausible(name, props ? { props: props } : undefined);
    }
  }

  function wireClickTracking() {
    document.querySelectorAll('[data-track-event]').forEach(function (el) {
      el.addEventListener('click', function () {
        var eventName = el.getAttribute('data-track-event');
        var context = el.getAttribute('data-track-context') || 'unknown';
        if (eventName) {
          trackEvent(eventName, { context: context });
        }
      });
    });
  }

  function trackBookedRedirect() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('booked') === '1') {
        trackEvent('booking_redirect_return', { path: window.location.pathname });
      }
    } catch (err) {
      // Ignore URL parsing issues in unsupported browsers.
    }
  }

  // --- Hamburger Navigation ---
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click (mobile)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Scroll Reveal ---
  var reveals = document.querySelectorAll('.reveal');

  if (reveals.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    reveals.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  wireClickTracking();
  trackBookedRedirect();
})();
