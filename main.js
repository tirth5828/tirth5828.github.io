/* tirth5828.github.io — theme toggle + scroll reveal. Nothing else. */
(function () {
  'use strict';

  /* ---------- theme ---------- */
  var root = document.documentElement;
  var btn = document.getElementById('themeBtn');
  var KEY = 'tj-theme';

  function systemDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function isDark() {
    var set = root.getAttribute('data-theme');
    return set ? set === 'dark' : systemDark();
  }

  function label() {
    if (!btn) return;
    btn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
  }

  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  } catch (e) { /* private mode; fall back to system */ }

  label();

  if (btn) {
    btn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      label();
    });
  }

  /* ---------- scroll reveal ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.band > *, .work, .role, .pub');

  if (reduce || !('IntersectionObserver' in window)) return;

  Array.prototype.forEach.call(targets, function (el) { el.classList.add('rv'); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('rv-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
})();
