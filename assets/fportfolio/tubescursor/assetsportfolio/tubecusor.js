/* =======================
   cardanimated.js – Static Live Playground (no Source toggle)
   ======================= */
(() => {
  'use strict';

  /* ---------- Per-project storage key ---------- */
  const STORAGE_NS = 'tubes_cursor_v1';

  const PROJECT_NAME =
    (document.body && document.body.dataset.project) ||
    new URLSearchParams(location.search).get('tubes') ||
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
      if (els.html) els.html.value = `<div id="app">
  <canvas id="canvas"></canvas>
  <div class="hero">
    <h1>Tubes</h1>
    <h2>Cursor</h2>
    <a target="_blank" href="https://www.framer.com/marketplace/components/tubes-cursor/">Framer Component</a>
  </div>
</div>
`;
      if (els.css) els.css.value = `body, html, #app {
  margin: 0;
  width: 100%;
  height: 100%;
}

body {
  touch-action: none;
}

#app {
  height: 100%;
  font-family: "Montserrat", serif;
}

#app a {
  text-decoration: none;
  color: #fff;
}

.hero {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

h1, h2, p {
  margin: 0;
  padding: 0;
  color: white;
  text-shadow: 0 0 20px rgba(0, 0, 0, 1);
  line-height: 100%;
  user-select: none;
}

h1 {
  font-size: 80px;
  font-weight: 700;
  text-transform: uppercase;
}

h2 {
  font-size: 60px;
  font-weight: 500;
  text-transform: uppercase;
}

#canvas {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
}
`;
      if (els.js) els.js.value = `import TubesCursor from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"

const app = TubesCursor(document.getElementById('canvas'), {
  tubes: {
    colors: ["#f967fb", "#53bc28", "#6958d5"],
    lights: {
      intensity: 200,
      colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"]
    }
  }
})

document.body.addEventListener('click', () => {
  const colors = randomColors(3)
  const lightsColors = randomColors(4)
  console.log(colors, lightsColors)
  app.tubes.setColors(colors)
  app.tubes.setLightsColors(lightsColors)
})

function randomColors (count) {
    return new Array(count)
        .fill(0)
        .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'))
}`;
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
