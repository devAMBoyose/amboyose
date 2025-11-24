/* ======================= 
   cardanimated.js – Static Live Playground (no Source toggle)
   ======================= */
(() => {
  'use strict';

  /* ---------- Per-project storage key ---------- */
  // CHANGED: storage namespace
  const STORAGE_NS = '2_ElectricCards';

  const PROJECT_NAME =
    (document.body && document.body.dataset.project) ||
    // CHANGED: query param key now 'cards'
    new URLSearchParams(location.search).get('2_cards') ||
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
      iframe.style.height = naturalHeight * scale + 'px';
    };

    if (ro) {
      try {
        ro.disconnect();
      } catch (_) { }
      ro = null;
    }
    if (fitHandler) {
      window.removeEventListener('resize', fitHandler);
      fitHandler = null;
    }

    ro = new ResizeObserver(fit);
    ro.observe(doc.documentElement);
    ro.observe(doc.body);

    fitHandler = fit;
    window.addEventListener('resize', fitHandler);

    fit();

    // Cursor relay (glow follows inside iframe)
    try {
      const root = document.documentElement;
      doc.addEventListener(
        'pointermove',
        (e) => {
          const rect = iframe.getBoundingClientRect();
          const clientX = rect.left + e.clientX;
          const clientY = rect.top + e.clientY;
          root.style.setProperty(
            '--cx',
            (clientX / window.innerWidth) * 100 + '%'
          );
          root.style.setProperty(
            '--cy',
            (clientY / window.innerHeight) * 100 + '%'
          );
        },
        { passive: true }
      );

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
    els.frame.addEventListener('load', () => enhancePreview(els.frame), {
      once: true
    });

    persist();
  }

  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          html: els.html?.value || '',
          css: els.css?.value || '',
          js: els.js?.value || '',
          left: getComputedStyle(els.grid)
            .getPropertyValue('--left')
            .trim(),
          liveOn: isLive()
        })
      );
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
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '');
      } catch (_) {
        return null;
      }
    })();

    if (saved) {
      if (els.html) els.html.value = saved.html ?? '';
      if (els.css) els.css.value = saved.css ?? '';
      if (els.js) els.js.value = saved.js ?? '';
      if (saved.left && els.grid)
        els.grid.style.setProperty('--left', saved.left);
      setLive(saved.liveOn !== false);
    } else {
      // PREFILL with your 3D Interactive Cards (only on first load with no saved state)
      if (els.html)
        els.html.value = `
<svg class="svg-container">
    <defs>
      <filter id="🌀↖️" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="1" />
        <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
          <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
        </feOffset>

        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="1" />
        <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
          <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
        </feOffset>

        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="2" />
        <feOffset in="noise1" dx="0" dy="0" result="offsetNoise3">
          <animate attributeName="dx" values="490; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
        </feOffset>

        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="2" />
        <feOffset in="noise2" dx="0" dy="0" result="offsetNoise4">
          <animate attributeName="dx" values="0; -490" dur="6s" repeatCount="indefinite" calcMode="linear" />
        </feOffset>

        <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
        <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
        <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />

        <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="30" xChannelSelector="R" yChannelSelector="B" />
      </filter>
      <filter id="🌀🎨" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="7" />
        <feColorMatrix type="hueRotate" result="pt1" >
          <animate attributeName="values" values="0;360;" dur=".6s" repeatCount="indefinite" calcMode="paced" />
        </feColorMatrix>
        <feComposite />
        <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="7" seed="5" />
        <feColorMatrix type="hueRotate" result="pt2">
          <animate attributeName="values" values="0; 333; 199; 286; 64; 168; 256; 157; 360;" dur="5s" repeatCount="indefinite" calcMode="paced" />
        </feColorMatrix>
        <feBlend in="pt1" in2="pt2" mode="normal" result="combinedNoise" />



        <feDisplacementMap in="SourceGraphic" scale="30" xChannelSelector="R" yChannelSelector="B" />
      </filter>
    </defs>
  </svg>
<main class="main-container">
  <div ↖️ class="card-container">
    <div class="inner-container">
      <div class="border-outer">
        <div ↖️ class="main-card"></div>
      </div>
      <div class="glow-layer-1"></div>
      <div class="glow-layer-2"></div>
    </div>

    <div class="overlay-1"></div>
    <div class="overlay-2"></div>
    <div class="background-glow"></div>

    <div class="content-container">
      <div class="content-top">
        <div class="scrollbar-glass">
          Dramatic
        </div>
        <p class="title">Original</p>
      </div>

      <hr class="divider" />

      <div class="content-bottom">
        <p class="description">In case you'd like to emphasize something very dramatically.</p>
      </div>
    </div>
  </div>

  <div 🎨 class="card-container">
    <div class="inner-container">
      <div class="border-outer">
        <div class="main-card"></div>
      </div>
      <div class="glow-layer-1"></div>
      <div class="glow-layer-2"></div>
    </div>

    <div class="overlay-1"></div>
    <div class="overlay-2"></div>
    <div class="background-glow"></div>

    <div class="content-container">
      <div class="content-top">
        <div class="scrollbar-glass">
          Dramatic
        </div>
        <p class="title">Hue</p>
      </div>

      <hr class="divider" />

      <div class="content-bottom">
        <p class="description">In case you'd like to emphasize something very dramatically.</p>
      </div>
    </div>
  </div>
</main>
`.trim();

      if (els.css)
        els.css.value = `
/* Reset and base styles */

/* CSS Variables */
:root {
  --color-neutral-900: oklch(0.185 0 0);

  color-scheme: light dark;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: oklch(0.145 0 0);
  color: oklch(0.985 0 0);
  height: 100vh;
  overflow: hidden;
}

/* Main container */
.main-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  gap: 1em;
  flex-wrap: wrap;
  overflow: auto;
  padding: 2em;
}

/* SVG positioning */
.svg-container {
  position: absolute;
}

/* Card container */
.card-container {
  padding: 2px;
  border-radius: 1.5em;
  position: relative;
  background: linear-gradient(
      -30deg,
      var(--gradient-color),
      transparent,
      var(--gradient-color)
    ),
    linear-gradient(
      to bottom,
      var(--color-neutral-900),
      var(--color-neutral-900)
    );

  &[↖️] {
    --f: url(#🌀↖️);
    --electric-border-color: #dd8448;
    --electric-light-color: oklch(from var(--electric-border-color) l c h);
    --gradient-color: oklch(
      from var(--electric-border-color) 0.3 calc(c / 2) h / 0.4
    );
  }
  &[🎨] {
    --f: url(#🌀🎨);
    --electric-border-color: DodgerBlue;
    --electric-light-color: oklch(from var(--electric-border-color) l c h);
    --gradient-color: oklch(
      from var(--electric-border-color) 0.3 calc(c / 2) h / 0.4
    );
  }
  &[💡] {
    --f: url(#🌀💡);
    --electric-border-color: DodgerBlue;
    --electric-light-color: oklch(from var(--electric-border-color) l c h);
    --gradient-color: oklch(
      from var(--electric-border-color) 0.3 calc(c / 2) h / 0.4
    );
    order: -1;
  }
}

/* Inner container */
.inner-container {
  position: relative;
}

/* Border layers */
.border-outer {
  border: 2px solid oklch(from var(--electric-border-color) l c h / 0.5);
  border-radius: 1.5em;
  padding-right: .15em;
  padding-bottom: .15em;
}


.main-card {
  width: 22rem;
  aspect-ratio: 7 / 10;
  border-radius: 1.5em;
  border: 2px solid var(--electric-border-color);
  margin-top: -4px;
  margin-left: -4px;
  filter: var(--f);
}

/* Glow effects */
.glow-layer-1 {
  border: 2px solid oklch(from var(--electric-border-color) l c h / 0.6);
  border-radius: 24px;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  filter: blur(1px);
}

.glow-layer-2 {
  border: 2px solid var(--electric-light-color);
  border-radius: 24px;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  filter: blur(4px);
}

/* Overlay effects */
.overlay-1 {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  opacity: 1;
  mix-blend-mode: overlay;
  transform: scale(1.1);
  filter: blur(16px);
  background: linear-gradient(
    -30deg,
    white,
    transparent 30%,
    transparent 70%,
    white
  );
}

.overlay-2 {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  opacity: 0.5;
  mix-blend-mode: overlay;
  transform: scale(1.1);
  filter: blur(16px);
  background: linear-gradient(
    -30deg,
    white,
    transparent 30%,
    transparent 70%,
    white
  );
}

/* Background glow */
.background-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  filter: blur(32px);
  transform: scale(1.1);
  opacity: 0.3;
  z-index: -1;
  background: linear-gradient(
    -30deg,
    var(--electric-light-color),
    transparent,
    var(--electric-border-color)
  );
}

/* Content container */
.content-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Content sections */
.content-top {
  display: flex;
  flex-direction: column;
  padding: 48px;
  padding-bottom: 16px;
  height: 100%;
}

.content-bottom {
  display: flex;
  flex-direction: column;
  padding: 48px;
  padding-top: 16px;
}

/* Scrollbar glass component */
.scrollbar-glass {
  background: radial-gradient(
      47.2% 50% at 50.39% 88.37%,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0) 100%
    ),
    rgba(255, 255, 255, 0.04);
  position: relative;
  transition: background 0.3s ease;
  border-radius: 14px;
  width: fit-content;
  height: fit-content;
  padding: .5em 1em;
  text-transform: uppercase;
  font-weight: bold;
  font-size: .85em;
  color: rgba(255, 255, 255, 0.8);
}

.scrollbar-glass:hover {
  background: radial-gradient(
      47.2% 50% at 50.39% 88.37%,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0) 100%
    ),
    rgba(255, 255, 255, 0.08);
}

.scrollbar-glass::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1px;
  background: linear-gradient(
    150deg,
    rgba(255, 255, 255, 0.48) 16.73%,
    rgba(255, 255, 255, 0.08) 30.2%,
    rgba(255, 255, 255, 0.08) 68.2%,
    rgba(255, 255, 255, 0.6) 81.89%
  );
  border-radius: inherit;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask-composite: xor;
  pointer-events: none;
}

/* Typography */
.title {
  font-size: 2.25em;
  font-weight: 500;
  margin-top: auto;
}

.description {
  opacity: 0.5;
}

/* Divider */
.divider {
  margin-top: auto;
  border: none;
  height: 1px;
  background-color: currentColor;
  opacity: 0.1;
  mask-image: linear-gradient(to right, transparent, black, transparent);
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black,
    transparent
  );
}

`.trim();

      if (els.js)
        els.js.value = `//
`;
      setLive(true);
    }

    render();
  })();

  /* ======================
     Editor listeners
     ====================== */
  ['input', 'change', 'paste'].forEach((evt) => {
    els.html?.addEventListener(evt, scheduleRender);
    els.css?.addEventListener(evt, scheduleRender);
    els.js?.addEventListener(evt, scheduleRender);
  });

  /* ======================
     Quick fillers (optional)
     ====================== */
  els.fills?.forEach((b) =>
    b.addEventListener('click', () => {
      const t = b.dataset.fill;
      if (t === 'html' && els.html)
        els.html.value = '<h1>Live HTML</h1><p>Type anything…</p>';
      if (t === 'css' && els.css)
        els.css.value = 'h1{color:#ff6b6b}body{font-family:system-ui}';
      if (t === 'js' && els.js)
        els.js.value = 'console.log("Hello from the preview!")';
      render();
    })
  );

  /* ======================
     Draggable split (kept) + MOBILE FIX
     ====================== */
  let dragging = false;

  function setLeft(px) {
    if (!els.grid) return;
    const rect = els.grid.getBoundingClientRect();
    const min = 260,
      max = rect.width - 300;
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

  // Collapse to single column on small screens (IMPROVED FOR MOBILE)
  const mql = window.matchMedia('(max-width: 980px)');
  function handleMedia() {
    if (!els.grid) return;

    const editorCol = document.querySelector('.editor-col');
    const previewCol = document.querySelector('.preview-col');

    if (mql.matches) {
      // MOBILE / TABLET
      els.grid.style.removeProperty('--left');
      els.grid.style.display = 'block';

      if (editorCol) {
        editorCol.style.width = '100%';
        editorCol.style.maxWidth = '100%';
      }
      if (previewCol) {
        previewCol.style.width = '100%';
        previewCol.style.maxWidth = '100%';
      }
      if (els.gutter) {
        els.gutter.style.display = 'none';
      }
    } else {
      // DESKTOP
      els.grid.style.display = '';
      if (editorCol) {
        editorCol.style.width = '';
        editorCol.style.maxWidth = '';
      }
      if (previewCol) {
        previewCol.style.width = '';
        previewCol.style.maxWidth = '';
      }
      if (els.gutter) {
        els.gutter.style.display = '';
      }
    }
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
    window.addEventListener(
      'pointermove',
      (e) => update(e.clientX, e.clientY),
      { passive: true }
    );

    const boost = (on) =>
      document.body.classList.toggle('cursor-boost', on);
    window.addEventListener('pointerdown', () => boost(true), {
      passive: true
    });
    window.addEventListener('pointerup', () => boost(false), {
      passive: true
    });
    window.addEventListener('pointercancel', () => boost(false), {
      passive: true
    });

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

    const text =
      typeof src.value === 'string'
        ? src.value
        : src.innerText ?? src.textContent ?? '';

    const flash = (ok) => {
      const prev = btn.textContent;
      btn.textContent = ok ? '✓ Copied' : '⚠️ Failed';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = prev;
        btn.disabled = false;
      }, 900);
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

function paint() {
  hl.innerHTML = tokenize(ta.value); // your tokenizer here
}
ta?.addEventListener('input', paint);
ta?.addEventListener('scroll', () => {
  hl.parentElement.style.transform = `translateY(${-ta.scrollTop}px)`;
});
if (ta && hl) paint();
