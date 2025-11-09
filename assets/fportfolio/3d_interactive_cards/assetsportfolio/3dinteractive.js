/* ======================= 
   cardanimated.js – Static Live Playground (no Source toggle)
   ======================= */
(() => {
  'use strict';

  /* ---------- Per-project storage key ---------- */
  // CHANGED: storage namespace
  const STORAGE_NS = '3d_interactivecards_v1';

  const PROJECT_NAME =
    (document.body && document.body.dataset.project) ||
    // CHANGED: query param key now 'cards'
    new URLSearchParams(location.search).get('cards') ||
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
<script type="module">
${js || ''}
/* Tip: static imports must remain top-level (no try/catch wrappers) */
</script>
</body></html>`;
  }

  /* ======================
     Preview Enhancements (fit + cursor relay)
     ====================== */
  let ro = null;
  let fitHandler = null;

  function enhancePreview(iframe) {
    let doc;
    try {
      doc = iframe.contentDocument || iframe.contentWindow?.document;
    } catch {
      // Cross-origin: skip enhancing to avoid console errors
      return;
    }
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
      // PREFILL with your 3D Interactive Cards (only on first load with no saved state)
      if (els.html) els.html.value = `
<div class="card-grid">

  <!-- Card 1 -->
  <div class="card">
    <div class="card-inner">
      <div class="card-face card-front one">
        <div>
          <h2>Quantum UI</h2>
          <p>Next-gen UI framework designed for speed, interactivity, and effortless scalability.</p>
        </div>
        <p>Tap or click to flip</p>
      </div>
      <div class="card-face card-back">
        <div>
          <h3>Features</h3>
          <ul class="features">
            <li>Lightning-fast rendering</li>
            <li>Modular component system</li>
            <li>Seamless API integration</li>
            <li>AI-powered UI suggestions</li>
          </ul>
        </div>
        <div class="cta-buttons">
          <a href="#" class="primary">Get Started</a>
          <a href="#" class="secondary">Learn More</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Card 2 -->
  <div class="card">
    <div class="card-inner">
      <div class="card-face card-front two">
        <div>
          <h2>Neon Cloud</h2>
          <p>Cloud-native infrastructure that scales dynamically and keeps latency near zero.</p>
        </div>
        <p>Tap or click to flip</p>
      </div>
      <div class="card-face card-back">
        <div>
          <h3>Advantages</h3>
          <ul class="features">
            <li>Auto-scaling engine</li>
            <li>low-latency network</li>
            <li>Zero-downtime</li>
            <li>Built-in analytics</li>
          </ul>
        </div>
        <div class="cta-buttons">
          <a href="#" class="primary">Deploy Now</a>
          <a href="#" class="secondary">Docs</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Card 3 -->
  <div class="card">
    <div class="card-inner">
      <div class="card-face card-front three">
        <div>
          <h2>Nova AI</h2>
          <p>Advanced AI toolkit to build, train, and deploy models directly in the browser.</p>
        </div>
        <p>Tap or click to flip</p>
      </div>
      <div class="card-face card-back">
        <div>
          <h3>What's Inside</h3>
          <ul class="features">
            <li>In-browser training engine</li>
            <li>Model visualization tools</li>
            <li>Secure model hosting</li>
            <li>Dataset builder</li>
          </ul>
        </div>
        <div class="cta-buttons">
          <a href="#" class="primary">Try Nova</a>
          <a href="#" class="secondary">Explore API</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Card 4 -->
  <div class="card">
    <div class="card-inner">
      <div class="card-face card-front four">
        <div>
          <h2>Pulse Metrics</h2>
          <p>Real-time monitoring platform with predictive analytics and anomaly detection.</p>
        </div>
        <p>Tap or click to flip</p>
      </div>
      <div class="card-face card-back">
        <div>
          <h3>Highlights</h3>
          <ul class="features">
            <li>Live dashboards</li>
            <li>Predictive forecasting</li>
            <li>Custom alerts & triggers</li>
            <li>AI-based anomaly tracking</li>
          </ul>
        </div>
        <div class="cta-buttons">
          <a href="#" class="primary">Start Free</a>
          <a href="#" class="secondary">View Demo</a>
        </div>
      </div>
    </div>
  </div>

</div>
`.trim();

      if (els.css) els.css.value = `
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@400;600&display=swap");

:root {
  --bg: #0a0c10;
  --card-bg: rgba(20, 25, 35, 0.9);
  --accent: #00f5ff;
  --text: #fafbfd;
  --text-dim: #c6c7cc;
  --radius: 20px;
  --shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: "Inter", sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1200px;
}

.card { perspective: 1000px; cursor: pointer; position: relative; transform-style: preserve-3d; }

.card-inner {
  position: relative;
  width: 100%;
  min-height: 360px;
  transform-style: preserve-3d;
  border-radius: var(--radius);
  transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
}

.card.flipped .card-inner { transform: rotateY(180deg); }

.card-face {
  position: absolute; inset: 0; border-radius: var(--radius);
  background: var(--card-bg); box-shadow: var(--shadow); padding: 24px;
  display: flex; flex-direction: column; justify-content: space-between;
  backface-visibility: hidden; transform-style: preserve-3d;
  transition: box-shadow 0.3s, filter 0.3s;
}

.card-face::before {
  content: ""; position: absolute; inset: 0; border-radius: var(--radius);
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.25), 0 0 25px rgba(0, 255, 255, 0.15) inset;
  opacity: 0; transition: opacity 0.4s;
}

.card:hover .card-face::before,
.card.flipped .card-face::before {
  opacity: 1; animation: pulse 2s infinite alternate;
}

@keyframes pulse {
  0% { box-shadow: 0 0 12px rgba(0, 255, 255, 0.25), 0 0 25px rgba(0, 255, 255, 0.15) inset; }
  50% { box-shadow: 0 0 22px rgba(0, 255, 255, 0.4), 0 0 35px rgba(0, 255, 255, 0.25) inset; }
  100% { box-shadow: 0 0 12px rgba(0, 255, 255, 0.25), 0 0 25px rgba(0, 255, 255, 0.15) inset; }
}

.card-front h2 {
  font-family: "Orbitron", sans-serif; font-size: 1.6rem; color: var(--accent); margin-bottom: 0.5rem;
}
.card-front p { font-size: 1rem; color: var(--text-dim); line-height: 1.5; }

.one   { background: url("https://iili.io/KSTN6ps.png") center/cover no-repeat; }
.two   { background: url("https://iili.io/KSTNsjf.png") center/cover no-repeat; }
.three { background: url("https://iili.io/KSTNLQ4.png") center/cover no-repeat; }
.four  { background: url("https://iili.io/KST8L1R.png") center/cover no-repeat; }

.card-back { transform: rotateY(180deg); display: flex; flex-direction: column; justify-content: space-between; }

.card-back h3 {
  font-family: "Orbitron", sans-serif; font-size: 1.4rem; color: var(--accent); margin-bottom: 1rem;
}

ul.features { list-style: none; padding: 0; margin: 0; }
ul.features li {
  margin-bottom: 0.6rem; padding-left: 1.4rem; position: relative; color: var(--text-dim); font-size: 0.95rem;
}
ul.features li::before { content: "⚡"; position: absolute; left: 0; color: var(--accent); }

.cta-buttons { display: flex; gap: 12px; margin-top: 1.5rem; }
.cta-buttons a {
  flex: 1; text-align: center; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-weight: 600; transition: all 0.3s;
}
.cta-buttons a.primary { background: var(--accent); color: #000; }
.cta-buttons a.primary:hover { background: #00ffff; }
.cta-buttons a.secondary { border: 1px solid var(--accent); color: var(--accent); }
.cta-buttons a.secondary:hover { background: rgba(0, 255, 255, 0.1); }

@media (max-width: 768px) {
  body { padding: 20px; }
  .card-inner { min-height: 300px; }
  .card-face { padding: 18px; }
  .card-front h2 { font-size: 1.3rem; }
  .card-back h3 { font-size: 1.2rem; }
  ul.features li { font-size: 0.9rem; }
}
`.trim();

      if (els.js) els.js.value = `const isTouch = "ontouchstart" in window;

document.querySelectorAll(".card").forEach((card) => {
  const inner = card.querySelector(".card-inner");

  // Tap/click flip with subtle scale-bounce
  card.addEventListener("click", () => {
    const baseRotate = card.classList.contains("flipped") ? 0 : 180;

    inner.style.transition = "transform 0.15s ease-out";
    inner.style.transform = \`rotateY(\${baseRotate}deg) scale(1.05)\`;

    setTimeout(() => {
      inner.style.transition = "transform 0.7s cubic-bezier(.4,.2,.2,1)";
      inner.style.transform = \`rotateY(\${baseRotate}deg) scale(1)\`;
      card.classList.toggle("flipped");
    }, 150);
  });

  if (!isTouch) {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      const baseRotate = card.classList.contains("flipped") ? 180 : 0;
      inner.style.transform =
        \`rotateY(\${baseRotate}deg) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg) scale(1)\`;
    });

    card.addEventListener("mouseleave", () => {
      const baseRotate = card.classList.contains("flipped") ? 180 : 0;
      inner.style.transform = \`rotateY(\${baseRotate}deg) rotateX(0deg) rotateY(0deg) scale(1)\`;
    });
  }
});
`;
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
    if (els.html) els.html.value = `<!-- 🧱 Write your HTML here -->\n`;
    if (els.css) els.css.value = `/* 🎨 Write your CSS here */\n`;
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

  /* ===========================================================
     HAMBURGER MENU FOR MOBILE
     =========================================================== */
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

/* ======================
   HTML box overlay tokenizer hook (kept)
   ====================== */
const ta = document.getElementById('htmlBox');
const hl = document.getElementById('htmlBoxHL');

function paint() { hl.innerHTML = tokenize(ta.value); } // your tokenizer here
ta?.addEventListener('input', paint);
ta?.addEventListener('scroll', () => { hl.parentElement.style.transform = `translateY(${-ta.scrollTop}px)`; });
if (ta && hl) paint();
