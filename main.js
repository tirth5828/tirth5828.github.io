/* tirth5828.github.io: theme toggle, hover-card dismissal, BibTeX copy. Shared by every page. */
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
    if (btn) btn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
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

  /* ---------- hover cards: Escape hides the open one (WCAG 1.4.13) ---------- */
  var fx = document.querySelectorAll('.fx');
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    Array.prototype.forEach.call(fx, function (el) {
      if (el.matches(':hover') || el.contains(document.activeElement)) el.classList.add('tip-off');
    });
  });
  Array.prototype.forEach.call(fx, function (el) {
    function on() { el.classList.remove('tip-off'); }
    el.addEventListener('mouseleave', on);
    el.addEventListener('focusout', on);
  });

  /* ---------- copy buttons (BibTeX) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (b) {
    var src = document.getElementById(b.getAttribute('data-copy'));
    if (!src || !navigator.clipboard) { b.hidden = true; return; }
    b.addEventListener('click', function () {
      navigator.clipboard.writeText(src.textContent.trim()).then(function () {
        var was = b.textContent; b.textContent = 'Copied';
        setTimeout(function () { b.textContent = was; }, 1600);
      });
    });
  });
})();
