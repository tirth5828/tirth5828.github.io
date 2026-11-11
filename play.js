/* Off the clock: Morse signal light + tone, an archery target, a Spanish flip card, the book. */
(function () {
  'use strict';

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function reduce() { return mqReduce.matches; }

  /* ================= Ham radio ================= */
  var CODE = { K: '-.-', E: '.', '2': '..---', I: '..', B: '-...', P: '.--.' };
  var radio = document.getElementById('radio');
  if (radio) {
    var call = radio.querySelector('.call').textContent.trim();
    var holder = radio.querySelector('.morse');
    var lamp = document.createElement('span');
    lamp.className = 'lamp'; lamp.setAttribute('aria-hidden', 'true');
    radio.appendChild(lamp);

    // timeline of [element or null, duration units, on?]
    var steps = [];
    call.split('').forEach(function (ch, ci) {
      var g = document.createElement('span'); g.className = 'mc';
      (CODE[ch] || '').split('').forEach(function (sym, si) {
        var el = document.createElement('i'); el.className = sym === '.' ? 'dot' : 'dash';
        g.appendChild(el);
        if (si) steps.push([null, 1, false]);
        steps.push([el, sym === '.' ? 1 : 3, true]);
      });
      holder.appendChild(g);
      if (ci < call.length - 1) steps.push([null, 3, false]);
    });
    steps.push([null, 7, false]);   // word gap before it repeats

    var UNIT = 0.085;               // seconds per Morse unit (about 14 wpm)
    var blinkTimer = 0, blinkIdx = 0, blinking = false;

    function lightOff() {
      lamp.classList.remove('on');
      Array.prototype.forEach.call(holder.querySelectorAll('i.on'), function (e) { e.classList.remove('on'); });
    }
    function blinkStep() {
      lightOff();
      if (!blinking) return;
      var st = steps[blinkIdx];
      if (st[2]) { st[0].classList.add('on'); lamp.classList.add('on'); }
      blinkIdx = (blinkIdx + 1) % steps.length;
      blinkTimer = setTimeout(blinkStep, st[1] * UNIT * 1000);
    }
    function startBlink() {
      if (blinking || reduce()) return;
      blinking = true; blinkIdx = 0; blinkStep();
    }
    function stopBlink() {
      if (playing) return;            // the sound keeps its light in step
      blinking = false; clearTimeout(blinkTimer); lightOff();
    }
    radio.addEventListener('mouseenter', startBlink);
    radio.addEventListener('mouseleave', stopBlink);
    radio.addEventListener('focusin', startBlink);
    radio.addEventListener('focusout', stopBlink);

    // sound: only on click, click again to stop. Never autoplay.
    var btn = document.getElementById('radioBtn');
    var actx = null, osc = null, gain = null, playing = false, loopTimer = 0;
    function schedule() {
      var t0 = actx.currentTime + 0.05, t = t0;
      steps.forEach(function (st) {
        var d = st[1] * UNIT;
        if (st[2]) {
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.18, t + 0.006);
          gain.gain.setValueAtTime(0.18, t + d - 0.006);
          gain.gain.linearRampToValueAtTime(0, t + d);
        }
        t += d;
      });
      // the light follows the sound
      clearTimeout(blinkTimer); blinking = !reduce(); blinkIdx = 0;
      if (blinking) blinkTimer = setTimeout(blinkStep, 50);
      loopTimer = setTimeout(function () { if (playing) schedule(); }, (t - t0) * 1000);
    }
    function stopSound() {
      playing = false; clearTimeout(loopTimer);
      if (gain) { gain.gain.cancelScheduledValues(actx.currentTime); gain.gain.setValueAtTime(0, actx.currentTime); }
      btn.setAttribute('aria-pressed', 'false'); btn.textContent = 'Play it in Morse';
      if (!radio.matches(':hover') && !radio.contains(document.activeElement)) { blinking = false; clearTimeout(blinkTimer); lightOff(); }
    }
    btn.addEventListener('click', function () {
      if (playing) { stopSound(); return; }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!actx) {
        actx = new AC();
        osc = actx.createOscillator(); gain = actx.createGain();
        osc.type = 'sine'; osc.frequency.value = 640; gain.gain.value = 0;
        osc.connect(gain); gain.connect(actx.destination); osc.start();
      }
      if (actx.state === 'suspended') actx.resume();
      playing = true;
      btn.setAttribute('aria-pressed', 'true'); btn.textContent = 'Stop';
      schedule();
    });
  }

  /* ================= Archery ================= */
  var target = document.getElementById('target');
  if (target) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = target.querySelector('svg');
    var rings = svg.querySelector('.rings'), hits = svg.querySelector('.hits');
    var RAD = 92, total = 0, shots = 0;
    var scoreEl = document.getElementById('score');
    for (var r = 10; r >= 1; r--) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', (RAD * r / 10).toFixed(1));
      c.setAttribute('class', r <= 2 ? 'ring ring-gold' : 'ring');
      c.setAttribute('stroke-width', r % 2 ? '0.8' : '1.4');
      rings.appendChild(c);
    }
    function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    function shoot(ax, ay) {
      // a little wobble on release
      var x = ax + gauss() * 7, y = ay + gauss() * 7;
      var dist = Math.sqrt(x * x + y * y);
      var pts = dist <= RAD ? Math.max(1, 10 - Math.floor(dist / (RAD / 10))) : 0;
      shots++; total += pts;
      Array.prototype.forEach.call(hits.querySelectorAll('.last'), function (e) { e.classList.remove('last'); });
      var g = document.createElementNS(NS, 'g');
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', x.toFixed(1)); dot.setAttribute('cy', y.toFixed(1)); dot.setAttribute('r', '3.2');
      dot.setAttribute('class', 'hit last');
      if (!reduce()) {
        // the arrow flies in from below, wobbling, then leaves its mark
        var ar = document.createElementNS(NS, 'line');
        ar.setAttribute('class', 'arrow');
        g.appendChild(ar);
        var t0 = performance.now(), D = 260;
        (function fly(now) {
          var p = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - p, 3);
          var sx = x * 0.3, sy = 160;
          var cx = sx + (x - sx) * e + Math.sin(p * 18) * 4 * (1 - p), cy = sy + (y - sy) * e;
          var len = 22 * (1 - p * 0.6);
          ar.setAttribute('x1', cx.toFixed(1)); ar.setAttribute('y1', cy.toFixed(1));
          ar.setAttribute('x2', (cx + (sx - x) * 0.08).toFixed(1)); ar.setAttribute('y2', (cy + len).toFixed(1));
          if (p < 1) requestAnimationFrame(fly);
          else { g.removeChild(ar); g.appendChild(dot); }
        })(t0);
      } else g.appendChild(dot);
      hits.appendChild(g);
      while (hits.childNodes.length > 12) hits.removeChild(hits.firstChild);
      scoreEl.textContent = (pts ? pts + (pts === 1 ? ' point' : ' points') : 'Miss') + '. Total ' + total + ' from ' + shots + (shots === 1 ? ' arrow.' : ' arrows.');
    }
    target.addEventListener('click', function (e) {
      if (e.detail === 0) return;   // keyboard "click" is handled below
      var b = svg.getBoundingClientRect();
      shoot((e.clientX - b.left) / b.width * 200 - 100, (e.clientY - b.top) / b.height * 200 - 100);
    });
    target.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shoot(0, 0); }
    });
    document.getElementById('resetBtn').addEventListener('click', function () {
      total = 0; shots = 0; while (hits.firstChild) hits.removeChild(hits.firstChild);
      scoreEl.textContent = 'Click the target to shoot.';
    });
  }

  /* ================= Spanish ================= */
  var PHRASES = [
    ['Nice to meet you', 'Mucho gusto'],
    ['I am learning Spanish', 'Estoy aprendiendo español'],
    ['See you tomorrow', 'Hasta mañana']
  ];
  var flip = document.getElementById('flipBtn');
  if (flip) {
    var en = flip.querySelector('.flip-en'), es = flip.querySelector('.flip-es'), pi = 0;
    function next() {
      pi = (pi + 1) % PHRASES.length;
      en.textContent = PHRASES[pi][0]; es.textContent = PHRASES[pi][1];
    }
    // a new phrase each time the card comes back to English
    flip.addEventListener('mouseleave', function () { setTimeout(next, reduce() ? 0 : 460); });
    flip.addEventListener('blur', function () { flip.classList.remove('on'); setTimeout(next, reduce() ? 0 : 460); });
    flip.addEventListener('click', function (e) {
      if (e.detail === 0 || window.matchMedia('(hover: none)').matches) {
        // keyboard and touch: toggle, and step to the next phrase when it flips back
        if (flip.classList.toggle('on')) return;
        setTimeout(next, reduce() ? 0 : 460);
      }
    });
  }

  /* ================= Books ================= */
  var book = document.getElementById('book');
  if (book) {
    var take = book.querySelector('.book-take');
    if (take && take.textContent.trim()) book.setAttribute('tabindex', '0');
  }
})();
