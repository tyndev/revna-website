// Revna — main.js
// Hamburger nav toggle + scroll reveal + basic analytics hooks

(function () {
  'use strict';

  function isDebugMode() {
    try {
      return new URLSearchParams(window.location.search).get('debug') === '1';
    } catch (err) {
      return false;
    }
  }

  var debugMode = isDebugMode();

  function debugLog(message, payload) {
    if (!debugMode || typeof console === 'undefined') {
      return;
    }
    if (typeof payload === 'undefined') {
      console.log('[revna-debug]', message);
    } else {
      console.log('[revna-debug]', message, payload);
    }
  }

  function trackEvent(name, props) {
    debugLog('trackEvent', { name: name, props: props || null });
    if (typeof window.plausible === 'function') {
      window.plausible(name, props ? { props: props } : undefined);
    } else {
      debugLog('plausible-not-ready');
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
        debugLog('booked-redirect-detected');
        var banner = document.getElementById('booking-confirmation');
        if (banner) {
          banner.hidden = false;
          debugLog('booking-banner-shown');
        }
        trackEvent('booking_redirect_return', { path: window.location.pathname });

        // Remove the booked flag from the URL so refreshes do not re-fire the event.
        if (window.history && window.history.replaceState) {
          var url = new URL(window.location.href);
          url.searchParams.delete('booked');
          var next =
            url.pathname +
            (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') +
            url.hash;
          window.history.replaceState({}, document.title, next);
          debugLog('booked-param-removed', { nextUrl: next });
        }
      }
    } catch (err) {
      // Ignore URL parsing issues in unsupported browsers.
      debugLog('booked-redirect-parse-error', { error: String(err) });
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

  debugLog('debug-mode-enabled');
  wireClickTracking();
  trackBookedRedirect();
})();
