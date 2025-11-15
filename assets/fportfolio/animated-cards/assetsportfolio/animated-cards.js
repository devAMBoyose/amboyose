/* =======================
  animated  – Static Live Playground (no Source toggle)
   ======================= */
(() => {
  'use strict';

  /* ---------- Per-project storage key ---------- */
  const STORAGE_NS = 'card_animated_playground_v1';

  const PROJECT_NAME =
    (document.body && document.body.dataset.project) ||
    new URLSearchParams(location.search).get('project') ||
    (location.pathname.split('/').pop() || '').replace(/\.[a-z0-9]+$/i, '') ||
    'default';
  const STORAGE_KEY = `${STORAGE_NS}:${PROJECT_NAME}`;

  // --- Elements ---
  const els = {
    html: document.getElementById('html'),
    css: document.getElementById('css'),
    js: document.getElementById('js'),
    frame: document.getElementById('preview'),
    live: document.getElementById('liveToggle'), // not present on this page
    fills: document.querySelectorAll('[data-fill]'),
    grid: document.getElementById('playground'),
    gutter: document.querySelector('.gutter'),
    navToggle: document.getElementById('navToggle'),
    siteTabs: document.getElementById('siteTabs'),
    resetBlank: document.getElementById('resetBlank') // optional
  };

  /* ======================
     Build HTML Document (module so imports work)
     ====================== */
  function buildDoc(html, css, js) {
    return `<!doctype html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${css || ''}</style></head><body>
${html || ''}
<script type="module">try{${js || ''}}catch(e){console.error(e)}</script>
</body></html>`;
  }

  /* ======================
     Preview Enhancements (fit + cursor relay)
     ====================== */
  let ro = null;
  let fitHandler = null;

  function enhancePreview(iframe) {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc || !doc.body) return;

    const fit = () => {
      const naturalWidth = Math.max(
        doc.documentElement.scrollWidth,
        doc.body.scrollWidth,
        doc.documentElement.clientWidth
      );
      const boxWidth = iframe.clientWidth;
      if (!naturalWidth || !boxWidth) return;

      const scale = Math.min(1, boxWidth / naturalWidth);
      const body = doc.body;
      body.style.transformOrigin = 'top left';
      body.style.transform = `scale(${scale})`;
      doc.documentElement.style.overflowX = 'hidden';
      body.style.overflowX = 'hidden';

      const naturalHeight = Math.max(
        doc.documentElement.scrollHeight,
        body.scrollHeight
      );
      iframe.style.height = (naturalHeight * scale) + 'px';
    };

    if (ro) { try { ro.disconnect(); } catch (_) { } ro = null; }
    if (fitHandler) { window.removeEventListener('resize', fitHandler); fitHandler = null; }

    ro = new ResizeObserver(fit);
    ro.observe(doc.documentElement);
    ro.observe(doc.body);

    fitHandler = fit;
    window.addEventListener('resize', fitHandler);

    fit();

    // Cursor relay (glow follows inside iframe)
    try {
      const root = document.documentElement;
      doc.addEventListener('pointermove', (e) => {
        const rect = iframe.getBoundingClientRect();
        const clientX = rect.left + e.clientX;
        const clientY = rect.top + e.clientY;
        root.style.setProperty('--cx', (clientX / window.innerWidth) * 100 + '%');
        root.style.setProperty('--cy', (clientY / window.innerHeight) * 100 + '%');
      }, { passive: true });

      const boostOn = () => document.body.classList.add('cursor-boost');
      const boostOff = () => document.body.classList.remove('cursor-boost');
      doc.addEventListener('pointerdown', boostOn, { passive: true });
      doc.addEventListener('pointerup', boostOff, { passive: true });
      doc.addEventListener('pointercancel', boostOff, { passive: true });
    } catch (_) { }
  }

  /* ======================
     Render & Persist
     ====================== */
  function render() {
    const html = els.html?.value || '';
    const css = els.css?.value || '';
    const js = els.js?.value || '';

    els.frame.srcdoc = buildDoc(html, css, js);
    els.frame.addEventListener('load', () => enhancePreview(els.frame), { once: true });

    persist();
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        html: els.html?.value || '',
        css: els.css?.value || '',
        js: els.js?.value || '',
        left: getComputedStyle(els.grid).getPropertyValue('--left').trim(),
        liveOn: isLive()
      }));
    } catch (_) { }
  }

  /* ======================
     Live toggle (default ON if no button)
     ====================== */
  function isLive() {
    if (!els.live) return true; // always live when there's no button
    return els.live.getAttribute('aria-pressed') === 'true';
  }
  function setLive(on) {
    if (!els.live) return;
    els.live.setAttribute('aria-pressed', on ? 'true' : 'false');
    els.live.textContent = `Live: ${on ? 'ON' : 'OFF'}`;
  }
  if (els.live) {
    els.live.addEventListener('click', () => {
      setLive(!isLive());
      if (isLive()) render();
    });
  }

  // Save even when Live is OFF; Run with Ctrl/Cmd+Enter
  let timer = null;
  function scheduleRender() {
    clearTimeout(timer);
    const liveOn = isLive();
    timer = setTimeout(liveOn ? render : persist, 160);
  }
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') render();
  });

  /* ======================
     Boot / Prefill
     ====================== */
  (function boot() {
    const saved = (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || ''); } catch (_) { return null; }
    })();

    if (saved) {
      if (els.html) els.html.value = saved.html ?? '';
      if (els.css) els.css.value = saved.css ?? '';
      if (els.js) els.js.value = saved.js ?? '';
      if (saved.left && els.grid) els.grid.style.setProperty('--left', saved.left);
      setLive(saved.liveOn !== false);
    } else {
      if (els.html) els.html.value = `<body>
  <div class="controls">
    <button class="control-btn" onclick="toggleAnimation()">⏸️ Pause</button>
    <button class="control-btn" onclick="resetPosition()">🔄 Reset</button>
    <button class="control-btn" onclick="changeDirection()">
      ↔️ Direction
    </button>
  </div>

  <div class="speed-indicator">
    Speed: <span id="speedValue">120</span> px/s
  </div>

  <div class="container">
    <canvas id="particleCanvas"></canvas>
    <canvas id="scannerCanvas"></canvas>

    <div class="scanner"></div>

    <div class="card-stream" id="cardStream">
      <div class="card-line" id="cardLine"></div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="script.js"></script>

  <div class="inspiration-credit">
    Inspired by
    <a href="https://evervault.com/" target="_blank">@evervault.com</a>
  </div>
</body>
`;
      if (els.css) els.css.value = `@import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #000000;
  min-height: 100vh;
  overflow: hidden;
  font-family: "Arial", sans-serif;
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 100;
}

.control-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  font-size: 14px;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.speed-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 16px;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  z-index: 100;
}

.info {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.3);
  padding: 15px 25px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  z-index: 100;
  line-height: 1.4;
}

.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-stream {
  position: absolute;
  width: 100vw;
  height: 180px;
  display: flex;
  align-items: center;
  overflow: visible;
}

.card-line {
  display: flex;
  align-items: center;
  gap: 60px;
  white-space: nowrap;
  cursor: grab;
  user-select: none;
  will-change: transform;
}

.card-line:active {
  cursor: grabbing;
}

.card-line.dragging {
  cursor: grabbing;
}

.card-line.css-animated {
  animation: scrollCards 40s linear infinite;
}

@keyframes scrollCards {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100vw);
  }
}

.card-wrapper {
  position: relative;
  width: 400px;
  height: 250px;
  flex-shrink: 0;
}

.card {
  position: absolute;
  top: 0;
  left: 0;
  width: 400px;
  height: 250px;
  border-radius: 15px;
  overflow: hidden;
}

.card-normal {
  background: transparent;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
  color: white;
  z-index: 2;
  position: relative;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15px;
  transition: all 0.3s ease;
  filter: brightness(1.1) contrast(1.1);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
}

.card-image:hover {
  filter: brightness(1.2) contrast(1.2);
}

.card-ascii {
  background: transparent;
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 400px;
  height: 250px;
  border-radius: 15px;
  overflow: hidden;
}

.card-chip {
  width: 40px;
  height: 30px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  border-radius: 5px;
  position: relative;
  margin-bottom: 20px;
}

.card-chip::before {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  background: linear-gradient(45deg, #e6c200, #f4d03f);
  border-radius: 2px;
}

.contactless {
  position: absolute;
  top: 60px;
  left: 20px;
  width: 25px;
  height: 25px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
}

.contactless::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 15px;
  height: 15px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
}

.card-number {
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 3px;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.card-holder {
  color: white;
  font-size: 14px;
  text-transform: uppercase;
}

.card-expiry {
  color: white;
  font-size: 14px;
}

.card-logo {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.ascii-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: rgba(220, 210, 255, 0.6);
  font-family: "Courier New", monospace;
  font-size: 11px;
  line-height: 13px;
  overflow: hidden;
  white-space: pre;
  clip-path: inset(0 calc(100% - var(--clip-left, 0%)) 0 0);
  animation: glitch 0.1s infinite linear alternate-reverse;
  margin: 0;
  padding: 0;
  text-align: left;
  vertical-align: top;
  box-sizing: border-box;
  -webkit-mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.8) 30%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.4) 80%,
    rgba(0, 0, 0, 0.2) 100%
  );
  mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.8) 30%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.4) 80%,
    rgba(0, 0, 0, 0.2) 100%
  );
}

@keyframes glitch {
  0% {
    opacity: 1;
  }
  15% {
    opacity: 0.9;
  }
  16% {
    opacity: 1;
  }
  49% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  99% {
    opacity: 0.9;
  }
  100% {
    opacity: 1;
  }
}

.scanner {
  display: none;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 300px;
  border-radius: 30px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(0, 255, 255, 0.8),
    rgba(0, 255, 255, 1),
    rgba(0, 255, 255, 0.8),
    transparent
  );
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4);
  animation: scanPulse 2s ease-in-out infinite alternate;
  z-index: 10;
}

@keyframes scanPulse {
  0% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scaleY(1);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scaleY(1.1);
  }
}

.scanner-label {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(0, 255, 255, 0.9);
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.card-normal {
  clip-path: inset(0 0 0 var(--clip-right, 0%));
}

.card-ascii {
  clip-path: inset(0 calc(100% - var(--clip-left, 0%)) 0 0);
}

.scan-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 255, 255, 0.4),
    transparent
  );
  animation: scanEffect 0.6s ease-out;
  pointer-events: none;
  z-index: 5;
}

@keyframes scanEffect {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.instructions {
  position: absolute;
  top: 50%;
  right: 30px;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  max-width: 200px;
  text-align: right;
  z-index: 5;
}

#particleCanvas {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100vw;
  height: 250px;
  z-index: 0;
  pointer-events: none;
}

#scannerCanvas {
  position: absolute;
  top: 50%;
  left: -3px;
  transform: translateY(-50%);
  width: 100vw;
  height: 300px;
  z-index: 15;
  pointer-events: none;
}

.inspiration-credit {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: "Roboto Mono", monospace;
  font-size: 12px;
  font-weight: 900;
  color: #ff9a9c;
  z-index: 1000;
  text-align: center;
}

.inspiration-credit a {
  color: #ff9a9c;
  text-decoration: none;
  transition: color 0.3s ease;
}

.inspiration-credit a:hover {
  color: #ff7a7c;
}
\n\n`;
      if (els.js) els.js.value = `// ⚙️ Write your JavaScript here\n// console.log('Live preview ready!');\n`;
      setLive(true);
    }

    render();
  })();

  /* ======================
     Editor listeners
     ====================== */
  ['input', 'change', 'paste'].forEach(evt => {
    els.html?.addEventListener(evt, scheduleRender);
    els.css?.addEventListener(evt, scheduleRender);
    els.js?.addEventListener(evt, scheduleRender);
  });

  /* ======================
     Quick fillers (optional)
     ====================== */
  els.fills?.forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.fill;
    if (t === 'html' && els.html) els.html.value = '<h1>Live HTML</h1><p>Type anything…</p>';
    if (t === 'css' && els.css) els.css.value = 'h1{color:#ff6b6b}body{font-family:system-ui}';
    if (t === 'js' && els.js) els.js.value = 'console.log("Hello from the preview!")';
    render();
  }));

  /* ======================
     Draggable split (kept)
     ====================== */
  let dragging = false;

  function setLeft(px) {
    if (!els.grid) return;
    const rect = els.grid.getBoundingClientRect();
    const min = 260, max = rect.width - 300;
    const clamped = Math.min(max, Math.max(min, px));
    els.grid.style.setProperty('--left', `${clamped}px`);
    persist();
  }

  if (els.gutter) {
    els.gutter.style.touchAction = 'none';
    els.gutter.setAttribute('tabindex', '-1');
    els.gutter.addEventListener('pointerdown', (e) => {
      dragging = true;
      els.gutter.setPointerCapture?.(e.pointerId);
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });
  }

  const onMove = (e) => {
    if (!dragging || !els.grid) return;
    const r = els.grid.getBoundingClientRect();
    setLeft(e.clientX - r.left);
  };
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.cursor = '';
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('mouseleave', endDrag);

  // Collapse to single column on small screens (kept)
  const mql = window.matchMedia('(max-width: 980px)');
  function handleMedia() {
    if (mql.matches && els.grid) els.grid.style.removeProperty('--left');
  }
  mql.addEventListener('change', handleMedia);
  handleMedia();

  /* ======================
     Cursor-follow glow (parent doc)
     ====================== */
  (function cursorGlow() {
    const root = document.documentElement;
    let raf = null;
    const update = (x, y) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        root.style.setProperty('--cx', (x / window.innerWidth) * 100 + '%');
        root.style.setProperty('--cy', (y / window.innerHeight) * 100 + '%');
      });
    };
    window.addEventListener('pointermove', (e) => update(e.clientX, e.clientY), { passive: true });

    const boost = (on) => document.body.classList.toggle('cursor-boost', on);
    window.addEventListener('pointerdown', () => boost(true), { passive: true });
    window.addEventListener('pointerup', () => boost(false), { passive: true });
    window.addEventListener('pointercancel', () => boost(false), { passive: true });

    update(window.innerWidth * 0.5, window.innerHeight * 0.5);
  })();

  /* ======================
     Optional reset to blank (if you add #resetBlank)
     ====================== */
  function resetToBlank() {
    if (els.html) els.html.value = `<body>
  <div class="controls">
    <button class="control-btn" onclick="toggleAnimation()">⏸️ Pause</button>
    <button class="control-btn" onclick="resetPosition()">🔄 Reset</button>
    <button class="control-btn" onclick="changeDirection()">
      ↔️ Direction
    </button>
  </div>

  <div class="speed-indicator">
    Speed: <span id="speedValue">120</span> px/s
  </div>

  <div class="container">
    <canvas id="particleCanvas"></canvas>
    <canvas id="scannerCanvas"></canvas>

    <div class="scanner"></div>

    <div class="card-stream" id="cardStream">
      <div class="card-line" id="cardLine"></div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="script.js"></script>

  <div class="inspiration-credit">
    Inspired by
    <a href="https://evervault.com/" target="_blank">@evervault.com</a>
  </div>
</body>
\n`;
    if (els.css) els.css.value = `@import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #000000;
  min-height: 100vh;
  overflow: hidden;
  font-family: "Arial", sans-serif;
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 100;
}

.control-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  font-size: 14px;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.speed-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 16px;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  z-index: 100;
}

.info {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.3);
  padding: 15px 25px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  z-index: 100;
  line-height: 1.4;
}

.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-stream {
  position: absolute;
  width: 100vw;
  height: 180px;
  display: flex;
  align-items: center;
  overflow: visible;
}

.card-line {
  display: flex;
  align-items: center;
  gap: 60px;
  white-space: nowrap;
  cursor: grab;
  user-select: none;
  will-change: transform;
}

.card-line:active {
  cursor: grabbing;
}

.card-line.dragging {
  cursor: grabbing;
}

.card-line.css-animated {
  animation: scrollCards 40s linear infinite;
}

@keyframes scrollCards {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100vw);
  }
}

.card-wrapper {
  position: relative;
  width: 400px;
  height: 250px;
  flex-shrink: 0;
}

.card {
  position: absolute;
  top: 0;
  left: 0;
  width: 400px;
  height: 250px;
  border-radius: 15px;
  overflow: hidden;
}

.card-normal {
  background: transparent;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
  color: white;
  z-index: 2;
  position: relative;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15px;
  transition: all 0.3s ease;
  filter: brightness(1.1) contrast(1.1);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
}

.card-image:hover {
  filter: brightness(1.2) contrast(1.2);
}

.card-ascii {
  background: transparent;
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 400px;
  height: 250px;
  border-radius: 15px;
  overflow: hidden;
}

.card-chip {
  width: 40px;
  height: 30px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  border-radius: 5px;
  position: relative;
  margin-bottom: 20px;
}

.card-chip::before {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  background: linear-gradient(45deg, #e6c200, #f4d03f);
  border-radius: 2px;
}

.contactless {
  position: absolute;
  top: 60px;
  left: 20px;
  width: 25px;
  height: 25px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
}

.contactless::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 15px;
  height: 15px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
}

.card-number {
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 3px;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.card-holder {
  color: white;
  font-size: 14px;
  text-transform: uppercase;
}

.card-expiry {
  color: white;
  font-size: 14px;
}

.card-logo {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.ascii-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: rgba(220, 210, 255, 0.6);
  font-family: "Courier New", monospace;
  font-size: 11px;
  line-height: 13px;
  overflow: hidden;
  white-space: pre;
  clip-path: inset(0 calc(100% - var(--clip-left, 0%)) 0 0);
  animation: glitch 0.1s infinite linear alternate-reverse;
  margin: 0;
  padding: 0;
  text-align: left;
  vertical-align: top;
  box-sizing: border-box;
  -webkit-mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.8) 30%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.4) 80%,
    rgba(0, 0, 0, 0.2) 100%
  );
  mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.8) 30%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.4) 80%,
    rgba(0, 0, 0, 0.2) 100%
  );
}

@keyframes glitch {
  0% {
    opacity: 1;
  }
  15% {
    opacity: 0.9;
  }
  16% {
    opacity: 1;
  }
  49% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  99% {
    opacity: 0.9;
  }
  100% {
    opacity: 1;
  }
}

.scanner {
  display: none;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 300px;
  border-radius: 30px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(0, 255, 255, 0.8),
    rgba(0, 255, 255, 1),
    rgba(0, 255, 255, 0.8),
    transparent
  );
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4);
  animation: scanPulse 2s ease-in-out infinite alternate;
  z-index: 10;
}

@keyframes scanPulse {
  0% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scaleY(1);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scaleY(1.1);
  }
}

.scanner-label {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(0, 255, 255, 0.9);
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.card-normal {
  clip-path: inset(0 0 0 var(--clip-right, 0%));
}

.card-ascii {
  clip-path: inset(0 calc(100% - var(--clip-left, 0%)) 0 0);
}

.scan-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 255, 255, 0.4),
    transparent
  );
  animation: scanEffect 0.6s ease-out;
  pointer-events: none;
  z-index: 5;
}

@keyframes scanEffect {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.instructions {
  position: absolute;
  top: 50%;
  right: 30px;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  max-width: 200px;
  text-align: right;
  z-index: 5;
}

#particleCanvas {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100vw;
  height: 250px;
  z-index: 0;
  pointer-events: none;
}

#scannerCanvas {
  position: absolute;
  top: 50%;
  left: -3px;
  transform: translateY(-50%);
  width: 100vw;
  height: 300px;
  z-index: 15;
  pointer-events: none;
}

.inspiration-credit {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: "Roboto Mono", monospace;
  font-size: 12px;
  font-weight: 900;
  color: #ff9a9c;
  z-index: 1000;
  text-align: center;
}

.inspiration-credit a {
  color: #ff9a9c;
  text-decoration: none;
  transition: color 0.3s ease;
}

.inspiration-credit a:hover {
  color: #ff7a7c;
}
\n`;
    if (els.js) els.js.value = `// ⚙️ Write your JavaScript here\n`;
    persist();
    render();
  }
  els.resetBlank?.addEventListener('click', resetToBlank);

})();

/* ======================
   Copy buttons (html/css/js)
   ====================== */
(() => {
  const sources = { html: '#html', css: '#css', js: '#js' };

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-btn[data-copy]');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const key = btn.dataset.copy;
    const src = document.querySelector(sources[key]);
    if (!src) return;

    const text = (typeof src.value === 'string') ? src.value
      : (src.innerText ?? src.textContent ?? '');

    const flash = (ok) => {
      const prev = btn.textContent;
      btn.textContent = ok ? '✓ Copied' : '⚠️ Failed';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 900);
    };

    try {
      await navigator.clipboard.writeText(text);
      flash(true);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        flash(true);
      } catch {
        flash(false);
      } finally {
        document.body.removeChild(ta);
      }
    }
  });

  /* ===========================================================HAMBURGER MENU FOR MOBILE =========================================================== */
  // Hamburger toggle
  (() => {
    const btn = document.getElementById('navToggle');
    const tabs = document.getElementById('siteTabs');
    if (!btn || !tabs) return;

    function toggle() {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      document.documentElement.classList.toggle('nav-open', !open);
    }

    btn.addEventListener('click', toggle);

    // Close when clicking outside (mobile)
    document.addEventListener('click', (e) => {
      const open = document.documentElement.classList.contains('nav-open');
      if (!open) return;
      if (!tabs.contains(e.target) && !btn.contains(e.target)) {
        btn.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('nav-open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        btn.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('nav-open');
      }
    });
  })();

})();


const ta = document.getElementById('htmlBox');
const hl = document.getElementById('htmlBoxHL');

function paint() { hl.innerHTML = tokenize(ta.value); } // your tokenizer here
ta.addEventListener('input', paint);
ta.addEventListener('scroll', () => { hl.parentElement.style.transform = `translateY(${-ta.scrollTop}px)`; });
paint();

