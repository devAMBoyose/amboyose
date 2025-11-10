/* =======================
   usercard.js – Static Live Playground (no Source toggle)
   ======================= */
(() => {
  'use strict';

  /* ---------- Per-project storage key ---------- */
  const STORAGE_NS = 'UserCard_v1';
  const PROJECT_NAME =
    (document.body && document.body.dataset.project) ||
    new URLSearchParams(location.search).get('usercard') ||
    (location.pathname.split('/').pop() || '').replace(/\.[a-z0-9]+$/i, '') ||
    'default';
  const STORAGE_KEY = `${STORAGE_NS}:${PROJECT_NAME}`;

  // --- Elements ---
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

  /* =====================================================
     UserCard_v1 default content (only if no saved state)
     ===================================================== */
  const USER_HTML = `<!-- Fonts + Icons -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />

<div class="cards-wrap">
  <div class="card" tabindex="0">
    <img class="card-img" src="https://assets.codepen.io/1506195/paul-atreides.jpg" alt="Paul Atreides">
    <section>
      <h2>Paul Atreides</h2>
      <p>Duke of House Atreides. Kwisatz Haderach. Lisan al-Gaib. Padishah Emperor.</p>
      <div>
        <div class="tag" aria-label="15M followers"><i class="fa-solid fa-user"></i> 15M</div>
        <button class="follow-btn">Follow</button>
      </div>
    </section>
  </div>

  <div class="card dark" tabindex="0">
    <img class="card-img" src="https://assets.codepen.io/1506195/paul-atreides.jpg" alt="Paul Atreides">
    <section>
      <h2>Paul Atreides</h2>
      <p>Duke of House Atreides. Kwisatz Haderach. Lisan al-Gaib. Padishah Emperor.</p>
      <div>
        <div class="tag" aria-label="15M followers"><i class="fa-solid fa-user"></i> 15M</div>
        <button class="follow-btn">Follow</button>
      </div>
    </section>
  </div>
</div>`;

  /*  IMPORTANT:
      These styles include high-specificity selectors + !important
      so your site CSS cannot override the image sizing/positioning.
      The image stays portrait (2/3), no square switch on hover,
      and the iframe scales to fit the preview column. */
  const USER_CSS = `@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Montserrat:wght@400;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

:root {
  --card-w: min(44vw, 21rem);
  --card-h: clamp(22rem, 58vh, 28rem);
}

html, body { height: 100%; }
body {
  margin: 0;
  font-family: Lato, Montserrat, Helvetica, Arial, sans-serif;
  background: linear-gradient(#eee, #ddd);
  color: #111;
  /* allow scroll inside iframe so nothing gets clipped */
  overflow: auto !important;
}

.cards-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2rem 2rem 3rem;
  align-items: center;
  justify-content: center;
}

/* Card */
.cards-wrap .card {
  --bg: #fff;
  --title-color: #fff;
  --title-color-hover: #000;
  --text-color: #666;
  --button-color: #eee;
  --button-color-hover: #ddd;

  background: var(--bg);
  border-radius: 1.75rem;
  padding: 0.5rem;
  width: var(--card-w);
  height: var(--card-h);
  overflow: clip;
  position: relative;
  outline: none;
  box-shadow: 0 2px 0 #e8e8e8 inset, 0 10px 20px rgba(0,0,0,.09);
}
.cards-wrap .card.dark {
  --bg: #222;
  --title-color: #fff;
  --title-color-hover: #fff;
  --text-color: #ccc;
  --button-color: #555;
  --button-color-hover: #444;
}

/* blur glass at bottom */
.cards-wrap .card::before {
  content:"";
  position:absolute;
  left:0.5rem; right:0.5rem; bottom:0.5rem;
  height:24%;
  -webkit-mask: linear-gradient(#0000, #000f 80%);
  mask: linear-gradient(#0000, #000f 80%);
  backdrop-filter: blur(1rem);
  border-radius: 0 0 1.25rem 1.25rem;
  translate: 0 0;
  transition: translate .25s;
}

/* IMAGE — hard overrides to stop global CSS from changing it */
.cards-wrap .card > img.card-img{
  display:block !important;
  width:100% !important;
  height:auto !important;
  max-width:100% !important;
  aspect-ratio: 2/3 !important;
  object-fit: cover !important;      /* stays portrait fill */
  object-position: 50% 12% !important;
  border-radius:1.25rem !important;
  transition: transform .25s, object-position .25s !important;
  background:#222;
}

/* never switch to square on hover (keep portrait) */
.cards-wrap .card:hover > img.card-img,
.cards-wrap .card:focus-within > img.card-img{
  transform: scale(1.04) !important;
  object-position: 50% 12% !important;
}

/* content */
.cards-wrap .card > section{
  margin:1rem;
  height: calc(33.333% - 1rem);
  display:flex; flex-direction:column;
}
.cards-wrap .card > section h2{
  margin:0 0 .9rem 0; font-size:1.45rem;
  color:var(--title-color);
  translate:0 -200%; opacity:1;
  transition: color .5s, margin-block-end .25s, opacity 1s, translate .25s;
}
.cards-wrap .card > section p{
  font-size:.95rem; line-height:1.3; color:var(--text-color);
  opacity:0; margin:0; translate:0 100%;
  transition: margin-block-end .25s, opacity 1s .2s, translate .25s .2s;
}
.cards-wrap .card > section > div{
  flex:1; display:flex; align-items:flex-end; justify-content:space-between;
  opacity:0; translate:0 100%; transition: translate .25s .2s, opacity 1s;
}
.cards-wrap .card > section > div .tag{ align-self:center; color:var(--title-color-hover); }

/* button */
.cards-wrap .card > section > div button{
  border:1px solid #0000; border-radius:1.1rem 1.1rem 1.25rem 1.1rem;
  font-size:1rem; padding:.9rem 1.25rem .9rem 2.6rem;
  translate:.75rem; background:var(--button-color); transition: background .33s;
  outline-offset:2px; position:relative; color:var(--title-color-hover);
  width:7.8rem; text-align:right;
}
.cards-wrap .card > section > div button::before,
.cards-wrap .card > section > div button::after{
  content:""; width:.85rem; height:.1rem; background:currentColor; position:absolute;
  top:50%; left:1.25rem; border-radius:1rem;
}
.cards-wrap .card > section > div button::after{ rotate:90deg; transition: rotate .15s; }
.cards-wrap .card > section > div button.following::after{ rotate:0deg; }
.cards-wrap .card > section > div button:hover{ background:var(--button-color-hover); }
.cards-wrap .card > section > div button:focus{ outline:2px solid var(--text-color); }

/* reveal */
.cards-wrap .card:hover::before,
.cards-wrap .card:focus-within::before{ translate:0 100%; }
.cards-wrap .card:hover > section h2,
.cards-wrap .card:focus-within > section h2,
.cards-wrap .card:hover > section p,
.cards-wrap .card:focus-within > section p{
  translate:0 0; margin-block-end:.5rem; opacity:1;
}
.cards-wrap .card:hover > section h2,
.cards-wrap .card:focus-within > section h2{ color:var(--title-color-hover); }
.cards-wrap .card:hover > section > div,
.cards-wrap .card:focus-within > section > div{
  translate:0 0; opacity:1; transition: translate .25s .25s, opacity .5s .25s;
}

/* responsive */
@media (max-width:1100px){ :root{ --card-w:min(42vw,20rem); } }
@media (max-width:820px){
  :root{ --card-w:min(92vw,22rem); --card-h: clamp(22rem,54vh,27rem); }
  .cards-wrap{ gap:1rem; padding:1rem; }
  .cards-wrap .card > section h2{ font-size:1.35rem; }
  .cards-wrap .card > section p{ font-size:.9rem; }
}`;

  const USER_APP_JS = `// Follow toggle
document.querySelectorAll('.follow-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    btn.classList.toggle('following');
    btn.textContent = btn.classList.contains('following') ? 'Unfollow' : 'Follow';
  });
});
setTimeout(()=>document.querySelector('.follow-btn')?.focus(), 400);`;

  /* ======================
     Build HTML Document
     ====================== */
  function buildDoc(html, css, js) {
    return `<!doctype html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${css || ''}</style></head><body>
${html || ''}
<script type="module">
${js || ''}
/* static imports must remain top-level */
</script>
</body></html>`;
  }

  /* ======================
     Preview Enhancements (contain-fit to both width & height)
     ====================== */
  let ro = null;
  let fitHandler = null;

  function enhancePreview(iframe) {
    let doc;
    try { doc = iframe.contentDocument || iframe.contentWindow?.document; } catch { return; }
    if (!doc || !doc.body) return;

    const fit = () => {
      const docEl = doc.documentElement;
      const body = doc.body;

      const naturalW = Math.max(docEl.scrollWidth, body.scrollWidth, docEl.clientWidth);
      const naturalH = Math.max(docEl.scrollHeight, body.scrollHeight, docEl.clientHeight);

      const boxW = iframe.clientWidth;
      const boxParent = iframe.parentElement;
      const boxH = (boxParent?.clientHeight || 0) || iframe.getBoundingClientRect().height || Math.round(window.innerHeight * 0.7);
      if (!naturalW || !boxW || !boxH) return;

      const scale = Math.min(1, boxW / naturalW, boxH / naturalH);

      body.style.transformOrigin = 'top left';
      body.style.transform = `scale(${scale})`;
      docEl.style.overflow = 'hidden';
      body.style.overflow = 'auto';

      iframe.style.height = boxH + 'px';
    };

    if (ro) { try { ro.disconnect(); } catch (_) { } ro = null; }
    if (fitHandler) { window.removeEventListener('resize', fitHandler); fitHandler = null; }

    ro = new ResizeObserver(fit);
    ro.observe(doc.documentElement);
    ro.observe(doc.body);

    fitHandler = fit;
    window.addEventListener('resize', fitHandler);
    fit();

    // cursor relay (for your glow)
    try {
      const root = document.documentElement;
      doc.addEventListener('pointermove', (e) => {
        const r = iframe.getBoundingClientRect();
        root.style.setProperty('--cx', ((r.left + e.clientX) / window.innerWidth) * 100 + '%');
        root.style.setProperty('--cy', ((r.top + e.clientY) / window.innerHeight) * 100 + '%');
      }, { passive: true });
    } catch { }
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
    } catch { }
  }

  /* ======================
     Live toggle (default ON if no button)
     ====================== */
  function isLive() { if (!els.live) return true; return els.live.getAttribute('aria-pressed') === 'true'; }
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

  // Save even when Live is OFF; Ctrl/Cmd+Enter = run
  let timer = null;
  function scheduleRender() {
    clearTimeout(timer);
    const liveOn = isLive();
    timer = setTimeout(liveOn ? render : persist, 160);
  }
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') render();
  });

  /* ======================
     Boot / Prefill
     ====================== */
  (function boot() {
    const saved = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || ''); } catch { return null; } })();

    if (saved) {
      if (els.html) els.html.value = saved.html ?? '';
      if (els.css) els.css.value = saved.css ?? '';
      if (els.js) els.js.value = saved.js ?? '';
      if (saved.left && els.grid) els.grid.style.setProperty('--left', saved.left);
      setLive(saved.liveOn !== false);
    } else {
      if (els.html) els.html.value = USER_HTML;
      if (els.css) els.css.value = USER_CSS;
      if (els.js) els.js.value = USER_APP_JS;
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
    if (t === 'html' && els.html) els.html.value = USER_HTML;
    if (t === 'css' && els.css) els.css.value = USER_CSS;
    if (t === 'js' && els.js) els.js.value = USER_APP_JS;
    render();
  }));

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
    els.gutter.addEventListener('pointerdown', e => {
      dragging = true;
      els.gutter.setPointerCapture?.(e.pointerId);
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });
  }
  const onMove = e => { if (!dragging || !els.grid) return; const r = els.grid.getBoundingClientRect(); setLeft(e.clientX - r.left); };
  const endDrag = () => { if (!dragging) return; dragging = false; document.body.style.cursor = ''; };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('mouseleave', endDrag);

  const mql = window.matchMedia('(max-width: 980px)');
  function handleMedia() { if (mql.matches && els.grid) els.grid.style.removeProperty('--left'); }
  mql.addEventListener('change', handleMedia);
  handleMedia();

  /* ======================
     Optional reset
     ====================== */
  function resetToBlank() {
    if (els.html) els.html.value = `<!-- 🧱 Write your HTML here -->\n`;
    if (els.css) els.css.value = `/* 🎨 Write your CSS here */\n`;
    if (els.js) els.js.value = `// ⚙️ Write your JavaScript here\n`;
    persist(); render();
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
    e.preventDefault(); e.stopPropagation();
    const key = btn.dataset.copy;
    const src = document.querySelector(sources[key]);
    if (!src) return;
    const text = (typeof src.value === 'string') ? src.value : (src.innerText ?? src.textContent ?? '');
    const flash = ok => {
      const prev = btn.textContent;
      btn.textContent = ok ? '✓ Copied' : '⚠️ Failed';
      btn.disabled = true; setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 900);
    };
    try { await navigator.clipboard.writeText(text); flash(true); }
    catch {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); flash(true); } catch { flash(false); } finally { document.body.removeChild(ta); }
    }
  });

  // mobile nav (kept)
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
    document.addEventListener('click', (e) => {
      const open = document.documentElement.classList.contains('nav-open');
      if (!open) return;
      if (!tabs.contains(e.target) && !btn.contains(e.target)) {
        btn.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('nav-open');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        btn.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('nav-open');
      }
    });
  })();
})();
