/* ======================= 
   library Carousel playground
   ======================= */
(() => {
  'use strict';

  /* ---------- Per-project storage key ---------- */
  const STORAGE_NS = 'librarycarousel_v1';

  const PROJECT_NAME =
    (document.body && document.body.dataset.project) ||
    new URLSearchParams(location.search).get('carousel') ||
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

  /* =================================================================
     PRESET: librarycarousel_v1 (auto-prefill when requested and no save)
     ================================================================= */
  function shouldUseLibraryCarouselPreset() {
    const viaBody = (document.body?.dataset?.project || '').trim() === 'librarycarousel_v1';
    const viaQS = (new URLSearchParams(location.search).get('carousel') || '').trim() === 'librarycarousel_v1';
    return viaBody || viaQS;
  }

  const LIBCAR_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Team Carousel</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="main-container">
    <div class="carousel-section">
      <div class="carousel-container">
        <button class="nav-arrow up">
  <!-- use the same icons CDN as the others -->
          <img src="https://ik.imagekit.io/gopichakradhar/icons/top.png?updatedAt=1754290522765" alt="Up">
        </button>

        <button class="nav-arrow down">
          <img src="https://ik.imagekit.io/gopichakradhar/icons/down.png?updatedAt=1754290523249" alt="Down">
        </button>
        <div class="carousel-track">
          <div class="card" data-index="0">
            <img src="https://ik.imagekit.io/gopichakradhar/luffy/o1.jpeg?updatedAt=1754289569411" alt="Team Member 1">
          </div>
          <div class="card" data-index="1">
            <img src="https://ik.imagekit.io/gopichakradhar/luffy/o2.jpeg?updatedAt=1754289569307" alt="Team Member 2">
          </div>
          <div class="card" data-index="2">
            <img src="https://ik.imagekit.io/gopichakradhar/luffy/o4.jpeg?updatedAt=1754289569398" alt="Team Member 3">
          </div>
          <div class="card" data-index="3">
            <img src="https://ik.imagekit.io/gopichakradhar/luffy/o3.jpeg?updatedAt=1754289569422" alt="Team Member 4">
          </div>
          <div class="card" data-index="4">
            <img src="https://ik.imagekit.io/gopichakradhar/luffy/o5.jpeg?updatedAt=1754289569406" alt="Team Member 5">
          </div>
          <div class="card" data-index="5">
            <img src="https://ik.imagekit.io/gopichakradhar/luffy/o6.jpeg?updatedAt=1754289569438" alt="Team Member 6">
          </div>
        </div>
        <button class="nav-arrow down">
          <img src="https://ik.imagekit.io/gopichakradhar/icons/down.png?updatedAt=1754290523249" alt="Down">
        </button>
      </div>
    </div>

    <div class="controls-section">
      <div class="nav-controls">
        <button class="nav-arrow up">
          <img src="https://ik.imagekit.io/gopichakradhar/icons/top.png?updatedAt=1754290522765" alt="Up">
        </button>
        <button class="nav-arrow down">
          <img src="https://ik.imagekit.io/gopichakradhar/icons/down.png?updatedAt=1754290523249" alt="Down">
        </button>
      </div>

      <div class="member-info">
        <h2 class="member-name">Emily Kim</h2>
        <p class="member-role">Founder</p>
      </div>

      <div class="dots">
        <div class="dot active" data-index="0"></div>
        <div class="dot" data-index="1"></div>
        <div class="dot" data-index="2"></div>
        <div class="dot" data-index="3"></div>
        <div class="dot" data-index="4"></div>
        <div class="dot" data-index="5"></div>
      </div>
    </div>
  </div>

  <script src="scripts.js"></script>
</body>
</html>`;

  const LIBCAR_CSS = `*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}
#super-btn{position:fixed;right:32px;bottom:32px;z-index:1000;display:inline-block;border-radius:18px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.18);width:56px;height:56px;background:#fff;transition:box-shadow .2s,transform .2s}
#super-btn:hover{box-shadow:0 4px 24px rgba(0,0,0,.28);transform:scale(1.07)}
#super-btn img{width:100%;height:100%;object-fit:cover;border-radius:16px;display:block}
body{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background-color:#f5f5f5;overflow:hidden;scroll-behavior:smooth;margin:0;padding:20px 0}
.main-container{display:flex;width:100%;max-width:1200px;height:80vh;gap:60px;align-items:center;justify-content:center}
.carousel-section{flex:1;display:flex;justify-content:center;align-items:center}
.controls-section{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:40px;padding-left:40px}
.carousel-container{width:100%;max-width:500px;height:70vh;position:relative;perspective:1000px;display:flex;flex-direction:column;align-items:center}
.carousel-container .nav-arrow{display:none}
.carousel-track{width:450px;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative;transform-style:preserve-3d;transition:transform .8s cubic-bezier(.25,.46,.45,.94)}
.card{position:absolute;width:400px;height:225px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,.15);transition:all .8s cubic-bezier(.25,.46,.45,.94);cursor:pointer}
.card img{width:100%;height:100%;object-fit:cover;transition:all .8s cubic-bezier(.25,.46,.45,.94)}
.card.center{z-index:10;transform:scale(1.1) translateZ(0)}
.card.up-2{z-index:1;transform:translateY(-300px) scale(.8) translateZ(-300px);opacity:.7}
.card.up-1{z-index:5;transform:translateY(-150px) scale(.9) translateZ(-100px);opacity:.9}
.card.down-1{z-index:5;transform:translateY(150px) scale(.9) translateZ(-100px);opacity:.9}
.card.down-2{z-index:1;transform:translateY(300px) scale(.8) translateZ(-300px);opacity:.7}
.card.hidden{opacity:0;pointer-events:none}
.member-info{text-align:center;margin-top:20px;transition:all .5s ease-out}
.member-name{color:rgb(8,42,123);font-size:2rem;font-weight:700;margin-bottom:8px;position:relative;display:inline-block}
.member-name::before,.member-name::after{content:"";position:absolute;top:100%;width:80px;height:2px;background:rgb(8,42,123)}
.member-name::before{left:-100px}.member-name::after{right:-100px}
.member-role{color:#848696;font-size:1.2rem;font-weight:500;opacity:.8;text-transform:uppercase;letter-spacing:.1em;padding:5px 0;margin-top:-10px;position:relative}
.dots{display:flex;justify-content:center;gap:10px;margin-top:30px}
.dot{width:12px;height:12px;border-radius:50%;background:rgba(8,42,123,.2);cursor:pointer;transition:all .3s ease}
.dot.active{background:rgb(8,42,123);transform:scale(1.2)}
.nav-arrow{position:relative;background:transparent;color:#fff;width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:20;transition:all .3s ease;font-size:1.5rem;border:none;outline:none;margin:0;padding:0;overflow:visible;box-shadow:none}
.nav-arrow:hover{background:transparent;transform:scale(1.2);box-shadow:none;border-color:transparent}
.nav-arrow img{width:60px;height:60px;object-fit:contain;filter:none;transition:all .3s ease}
.nav-controls{display:flex;flex-direction:row;gap:30px;align-items:center;justify-content:center}
.scroll-indicator{position:fixed;bottom:30px;right:30px;background:rgba(8,42,123,.8);color:#fff;padding:8px 16px;border-radius:20px;font-size:.8rem;text-align:center;z-index:1000;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2);animation:scrollFadeOut 5s ease-in-out forwards;font-weight:500;line-height:1}
.scroll-indicator span{font-size:.75rem;opacity:.9;display:block;margin-top:2px}
@keyframes scrollFadeOut{0%{opacity:0;transform:scale(.8)}10%{opacity:1;transform:scale(1)}90%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8);visibility:hidden}}
@media (max-width:768px){
  body{padding:10px 0}
  .main-container{flex-direction:column;height:auto;gap:20px;max-width:100%}
  .controls-section{flex:none;width:100%;padding-left:0;gap:20px}
  .carousel-container{height:60vh;max-width:350px}
  .carousel-container .nav-arrow{display:flex;position:absolute;left:50%;transform:translateX(-50%);width:70px;height:70px;margin:0;background:transparent;border:none;box-shadow:none}
  .carousel-container .nav-arrow.up{top:20px}
  .carousel-container .nav-arrow.down{bottom:20px}
  .card{width:320px;height:180px}
  .carousel-track{width:350px}
  .card.up-2{transform:translateY(-160px) scale(.8) translateZ(-300px)}
  .card.up-1{transform:translateY(-80px) scale(.9) translateZ(-100px)}
  .card.down-1{transform:translateY(80px) scale(.9) translateZ(-100px)}
  .card.down-2{transform:translateY(160px) scale(.8) translateZ(-300px)}
  .member-name{font-size:1.8rem}
  .member-role{font-size:1rem}
  .member-name::before,.member-name::after{width:40px}
  .member-name::before{left:-60px}
  .member-name::after{right:-60px}
  .scroll-indicator{bottom:20px;right:20px;padding:6px 12px;font-size:.7rem}
  .scroll-indicator span{font-size:.7rem}
}`;

  const LIBCAR_JS = `const teamMembers=[
  {name:"Luffy",role:"Founder"},
  {name:"Monkey D. Luffy",role:"Creative Director"},
  {name:"Luffy chan",role:"Lead Developer"},
  {name:"Lucy",role:"UX Designer"},
  {name:"Luffy kun",role:"Marketing Manager"},
  {name:"Monkey chan",role:"Product Manager"}
];
const cards=document.querySelectorAll(".card");
const dots=document.querySelectorAll(".dot");
const memberName=document.querySelector(".member-name");
const memberRole=document.querySelector(".member-role");
const upArrows=document.querySelectorAll(".nav-arrow.up");
const downArrows=document.querySelectorAll(".nav-arrow.down");
let currentIndex=0,isAnimating=false;

function updateCarousel(newIndex){
  if(isAnimating) return;
  isAnimating=true;
  currentIndex=(newIndex+cards.length)%cards.length;

  cards.forEach((card,i)=>{
    const offset=(i-currentIndex+cards.length)%cards.length;
    card.classList.remove("center","up-1","up-2","down-1","down-2","hidden");
    if(offset===0) card.classList.add("center");
    else if(offset===1) card.classList.add("down-1");
    else if(offset===2) card.classList.add("down-2");
    else if(offset===cards.length-1) card.classList.add("up-1");
    else if(offset===cards.length-2) card.classList.add("up-2");
    else card.classList.add("hidden");
  });

  dots.forEach((dot,i)=>dot.classList.toggle("active",i===currentIndex));
  memberName.style.opacity="0"; memberRole.style.opacity="0";
  setTimeout(()=>{
    memberName.textContent=teamMembers[currentIndex].name;
    memberRole.textContent=teamMembers[currentIndex].role;
    memberName.style.opacity="1"; memberRole.style.opacity="1";
  },300);
  setTimeout(()=>{isAnimating=false;},800);
}

upArrows.forEach(a=>a.addEventListener("click",()=>updateCarousel(currentIndex-1)));
downArrows.forEach(a=>a.addEventListener("click",()=>updateCarousel(currentIndex+1)));
dots.forEach((dot,i)=>dot.addEventListener("click",()=>updateCarousel(i)));
cards.forEach((card,i)=>card.addEventListener("click",()=>updateCarousel(i)));
document.addEventListener("keydown",(e)=>{
  if(e.key==="ArrowUp") updateCarousel(currentIndex-1);
  else if(e.key==="ArrowDown") updateCarousel(currentIndex+1);
});

let touchStartY=0,touchEndY=0;
function createScrollIndicator(){
  const indicator=document.createElement('div');
  indicator.className='scroll-indicator';
  indicator.innerHTML='scroll';
  document.body.appendChild(indicator);
}
createScrollIndicator();

document.addEventListener("touchstart",e=>{touchStartY=e.changedTouches[0].screenY;});
document.addEventListener("touchend",e=>{touchEndY=e.changedTouches[0].screenY;handleSwipe();});
function handleSwipe(){
  const swipeThreshold=50;
  const diff=touchStartY-touchEndY;
  if(Math.abs(diff)>swipeThreshold){
    if(diff>0) updateCarousel(currentIndex+1);
    else updateCarousel(currentIndex-1);
  }
}
updateCarousel(0);`;

  function applyLibraryCarouselPresetIfNeeded() {
    if (!shouldUseLibraryCarouselPreset()) return false;
    if (!els.html || !els.css || !els.js) return false;
    els.html.value = LIBCAR_HTML;
    els.css.value = LIBCAR_CSS;
    els.js.value = LIBCAR_JS;
    return true;
  }

  /* ======================
     Boot / Prefill
     ====================== */
  (function boot() {
    const saved = (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || ''); } catch (_) { return null; }
    })();

    // If no saved data yet, preload the library carousel when requested
    const usedPreset = !saved && applyLibraryCarouselPresetIfNeeded();

    if (saved) {
      if (els.html) els.html.value = saved.html ?? '';
      if (els.css) els.css.value = saved.css ?? '';
      if (els.js) els.js.value = saved.js ?? '';
      if (saved.left && els.grid) els.grid.style.setProperty('--left', saved.left);
      setLive(saved.liveOn !== false);
    } else if (!usedPreset) {
      if (els.html) els.html.value = `<!-- 🧱 Write your HTML here -->\n`;
      if (els.css) els.css.value = `/* 🎨 Write your CSS here */\n\n`;
      if (els.js) els.js.value = `// ⚙️ Write your JavaScript here (ES modules supported)\n`;
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
