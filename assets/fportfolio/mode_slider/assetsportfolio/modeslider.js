

/* =======================
   liquid.js – Static Live Playground (module-friendly)
   ======================= */
(() => {
  'use strict';

  const STORAGE_NS = 'liquid_animated_playground_v1';
  const PROJECT_NAME =
    (document.body && document.body.dataset.project2) ||
    new URLSearchParams(location.search).get('project2') ||
    (location.pathname.split('/').pop() || '').replace(/\.[a-z0-9]+$/i, '') ||
    'default';
  const STORAGE_KEY = `${STORAGE_NS}:${PROJECT_NAME}`;

  // Elements
  const els = {
    html: document.getElementById('html'),
    css: document.getElementById('css'),
    js: document.getElementById('js'),
    frame: document.getElementById('preview'),
    live: document.getElementById('liveToggle'),
    fills: document.querySelectorAll('[data-fill]'),
    grid: document.getElementById('playground'),
    gutter: document.querySelector('.gutter'),
    navToggle: document.getElementById('navToggle'),
    siteTabs: document.getElementById('siteTabs'),
    resetBlank: document.getElementById('resetBlank')
  };

  /* ======================
     Build iframe document
     Note: NO try/catch around module JS so `import` stays top-level.
     ====================== */
  function buildDoc(html, css, js) {
    return `<!doctype html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{margin:0;height:100%}
  ${css || ''}
</style>
</head><body>
${html || ''}
<script type="module">
${js || ''}
// Optional console relay to parent (visible in your main page devtools)
const relay = (type, args) => {
  try { parent && parent.console && parent.console[type](...args); } catch(_) {}
};
['log','warn','error'].forEach(t=>{
  const orig = console[t].bind(console);
  console[t] = (...a)=>{ relay(t,a); orig(...a); };
});
</script>
</body></html>`;
  }

  /* ======================
     Preview fit + cursor relay
     ====================== */
  let ro = null;
  let fitHandler = null;

  function enhancePreview(iframe) {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc || !doc.body) return;

    // --- NEW: allow disabling all auto-fit behavior ---
    if (FIT_MODE === 'none') {
      // Lock the preview; no transform/scale, no observers, fixed height.
      try { ro && ro.disconnect(); } catch (_) { }
      ro = null;
      if (fitHandler) {
        window.removeEventListener('resize', fitHandler);
        fitHandler = null;
      }
      iframe.style.height = '100%';           // keep iframe steady
      doc.documentElement.style.overflowX = ''; // normal overflow
      doc.body.style.overflowX = '';
      doc.body.style.transform = '';          // no scaling
      doc.body.style.transformOrigin = '';
      return;                                 // <— important
    }
    // --- existing fit-to-width code continues below ---
    const fit = () => {
      const naturalWidth = Math.max(
        doc.documentElement.scrollWidth,
        doc.body.scrollWidth,
        doc.documentElement.clientWidth
      );
      const boxWidth = iframe.clientWidth || 1;
      const scale = Math.min(1, boxWidth / (naturalWidth || boxWidth));
      const body = doc.body;
      body.style.transformOrigin = 'top left';
      body.style.transform = `scale(${scale})`;
      doc.documentElement.style.overflowX = 'hidden';
      body.style.overflowX = 'hidden';

      const naturalHeight = Math.max(
        doc.documentElement.scrollHeight,
        body.scrollHeight
      ) || 0;
      iframe.style.height = (naturalHeight * scale) + 'px';
    };

    try { ro && ro.disconnect(); } catch (_) { }
    ro = new ResizeObserver(fit);
    ro.observe(doc.documentElement);
    ro.observe(doc.body);

    fitHandler = fit;
    window.addEventListener('resize', fitHandler);
    fit();
  }


  /* ======================
     Render & Persist
     ====================== */
  function isLive() {
    if (!els.live) return true;
    return els.live.getAttribute('aria-pressed') === 'true';
  }
  function setLive(on) {
    if (!els.live) return;
    els.live.setAttribute('aria-pressed', on ? 'true' : 'false');
    els.live.textContent = `Live: ${on ? 'ON' : 'OFF'}`;
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

  function render() {
    const html = els.html?.value || '';
    const css = els.css?.value || '';
    const js = els.js?.value || '';
    els.frame.srcdoc = buildDoc(html, css, js);
    els.frame.addEventListener('load', () => enhancePreview(els.frame), { once: true });
    persist();
  }

  // Save even when Live OFF; Ctrl/Cmd+Enter to force run
  let timer = null;
  function scheduleRender() {
    clearTimeout(timer);
    timer = setTimeout(isLive() ? render : persist, 160);
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
      // Blank, ready for your own code
      if (els.html) els.html.value = `<<div id="app">
  <canvas id="canvas"></canvas>
</div>
\n`;
      if (els.css) els.css.value = `/* 🎨 Write your CSS here */\n\n`;
      if (els.js) els.js.value = `body, html, #app {
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

#canvas {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
}
;\n`;
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
     Draggable split
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
  const endDrag = () => { if (dragging) { dragging = false; document.body.style.cursor = ''; } };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('mouseleave', endDrag);

  // Collapse on small screens
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
     Optional reset button
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
    const text = (typeof src.value === 'string') ? src.value : (src.innerText ?? src.textContent ?? '');
    const flash = (ok) => {
      const prev = btn.textContent;
      btn.textContent = ok ? '✓ Copied' : '⚠️ Failed';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 900);
    };
    try { await navigator.clipboard.writeText(text); flash(true); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); flash(true); }
      catch { flash(false); }
      finally { document.body.removeChild(ta); }
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
