
(() => {
    'use strict';

    /* ---------- Per-project storage key ---------- */
    const STORAGE_NS = 'parallaxcarousel_v1';  // ← changed
    const PROJECT_NAME =
        (document.body && document.body.dataset.project) ||
        new URLSearchParams(location.search).get('parallax') || // ← changed
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
            /* ---------- Default first-load content = your Parallax Carousel ---------- */
            if (els.html) els.html.value = `
        <div class="mzaCarousel" id="mzaCarousel" aria-roledescription="carousel" aria-label="Featured cards">
            <div class="mzaCarousel-viewport" tabindex="0">
                <div class="mzaCarousel-track">
                    <article class="mzaCarousel-slide" role="group" aria-roledescription="slide" aria-label="1 of 5">
                        <div class="mzaCard" style="--mzaCard-bg:url('https://picsum.photos/id/1015/1600/1000');">
                            <header class="mzaCard-head mzaPar-1">
                                <h2 class="mzaCard-title">Edge Visuals</h2>
                                <p class="mzaCard-kicker">Design systems that breathe</p>
                            </header>
                            <p class="mzaCard-text mzaPar-2">Build adaptive UI foundations with tokens, motion, and accessible color ramps. Ship faster without sameness.</p>
                            <footer class="mzaCard-actions mzaPar-3"><button class="mzaBtn">See case study</button></footer>
                        </div>
                    </article>

                    <article class="mzaCarousel-slide" role="group" aria-roledescription="slide" aria-label="2 of 5">
                        <div class="mzaCard" style="--mzaCard-bg:url('https://picsum.photos/id/1011/1600/1000');">
                            <header class="mzaCard-head mzaPar-1">
                                <h2 class="mzaCard-title">Realtime Dashboards</h2>
                                <p class="mzaCard-kicker">Signal over noise</p>
                            </header>
                            <p class="mzaCard-text mzaPar-2">Stream metrics, smooth spikes, and highlight deltas. Clarity first, chrome last.</p>
                            <footer class="mzaCard-actions mzaPar-3"><button class="mzaBtn">View live demo</button></footer>
                        </div>
                    </article>

                    <article class="mzaCarousel-slide" role="group" aria-roledescription="slide" aria-label="3 of 5">
                        <div class="mzaCard" style="--mzaCard-bg:url('https://picsum.photos/id/1018/1600/1000');">
                            <header class="mzaCard-head mzaPar-1">
                                <h2 class="mzaCard-title">Brand Motion</h2>
                                <p class="mzaCard-kicker">Identity in motion</p>
                            </header>
                            <p class="mzaCard-text mzaPar-2">Translate marks into kinetic systems. Timing, easing, and restraint create memory.</p>
                            <footer class="mzaCard-actions mzaPar-3"><button class="mzaBtn">Explore reels</button></footer>
                        </div>
                    </article>

                    <article class="mzaCarousel-slide" role="group" aria-roledescription="slide" aria-label="4 of 5">
                        <div class="mzaCard" style="--mzaCard-bg:url('https://picsum.photos/id/1021/1600/1000');">
                            <header class="mzaCard-head mzaPar-1">
                                <h2 class="mzaCard-title">E-commerce UX</h2>
                                <p class="mzaCard-kicker">Frictionless paths</p>
                            </header>
                            <p class="mzaCard-text mzaPar-2">Model intent, compress choice, and keep the dopamine loop honest. Checkout in one breath.</p>
                            <footer class="mzaCard-actions mzaPar-3"><button class="mzaBtn">See patterns</button></footer>
                        </div>
                    </article>

                    <article class="mzaCarousel-slide" role="group" aria-roledescription="slide" aria-label="5 of 5">
                        <div class="mzaCard" style="--mzaCard-bg:url('https://picsum.photos/id/1005/1600/1000');">
                            <header class="mzaCard-head mzaPar-1">
                                <h2 class="mzaCard-title">Content Engines</h2>
                                <p class="mzaCard-kicker">Scale without sludge</p>
                            </header>
                            <p class="mzaCard-text mzaPar-2">Structured content, image policy, and smart defaults. Publish daily, stay sharp.</p>
                            <footer class="mzaCard-actions mzaPar-3"><button class="mzaBtn">Read playbook</button></footer>
                        </div>
                    </article>
                </div>
            </div>

            <div class="mzaCarousel-controls" aria-label="Controls">
                <button class="mzaCarousel-prev" aria-label="Previous slide" type="button">‹</button>
                <button class="mzaCarousel-next" aria-label="Next slide" type="button">›</button>
            </div>

            <div class="mzaCarousel-pagination" role="tablist" aria-label="Slide navigation"></div>
            <div class="mzaCarousel-progress" aria-hidden="true"><span class="mzaCarousel-progressBar"></span></div>
        </div>`.trim();

            if (els.css) els.css.value = `
        * {box - sizing: border-box; }
        :root {
            --mzaC - fg: #e7ecf2;
        --mzaC-accent: #9ef7d2;
        --mzaC-accent2: #82a0ff;
        --mzaC-glass: rgba(255, 255, 255, 0.06);
        --mzaC-glow: rgba(130, 160, 255, 0.75);
        --mzaC-slideW: min(880px, 90vw);
        --mzaC-peek: 0.15;
        --mzaPagH: 64px;
        --mzaCardH: clamp(360px, 62vh, 600px);
}
        html, body {height: 100%; margin: 0; overflow: hidden; }
        body {
            background: radial-gradient(1200px 600px at 10% -10%, #1a2140 0%, transparent 40%),
        radial-gradient(900px 600px at 110% 10%, #0e3d3f 0%, transparent 40%),
        linear-gradient(180deg, #0a0d12 0%, #0c1117 100%);
        color: var(--mzaC-fg);
        font: 16px/1.4 system-ui, Segoe UI, Roboto, Ubuntu, "Helvetica Neue", Arial;
}
        .mzaCarousel {
            position: relative; height: 100vh; max-width: 100vw; margin: 0 auto; padding: 0 18px;
        overflow: hidden; contain: layout paint; touch-action: none;
}
        .mzaCarousel-viewport {position: relative; outline: none; overflow: hidden; height: 100%; }
        .mzaCarousel-track {
            position: relative; height: calc(100% - var(--mzaPagH) - max(env(safe-area-inset-bottom), 12px));
        transform-style: preserve-3d; perspective: 1200px; overflow: hidden;
}
        .mzaCarousel-slide {
            position: absolute; top: calc(50% + 5px); left: 50%;
        width: var(--mzaC-slideW); height: min(var(--mzaCardH), calc(100% - 50px));
        transform-style: preserve-3d; display: grid; place-items: center;
        border-radius: 22px; overflow: hidden; will-change: transform, filter;
}
        .mzaCard {
            position: relative; width: 100%; height: 100%; border-radius: inherit; overflow: hidden;
        background: var(--mzaC-glass); box-shadow: 0 20px 50px rgba(0,0,0,.45);
        backdrop-filter: saturate(120%) blur(4px); transform: translateZ(0); cursor: grab;
}
        .mzaCard::before{
            content:""; position:absolute; inset:-2%;
        background-image: var(--mzaCard-bg); background-size: cover; background-position: center;
        filter: contrast(1.02) saturate(1.08) brightness(0.9);
        transform: translateZ(-60px) scale(1.18) translate3d(var(--mzaParBgX,0px), var(--mzaParBgY,0px), 0);
        transition: transform 800ms cubic-bezier(0.2, 0.7, 0, 1), filter 800ms cubic-bezier(0.2, 0.7, 0, 1);
}
        .mzaCard::after {
            content:""; position:absolute; inset:0;
        background: linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.45) 45%, rgba(0,0,0,.25) 100%);
}
        .mzaCard-head{position:absolute; inset:20px auto auto 20px; z-index:2; }
        .mzaCard-title{
            margin:0; font-weight:800; letter-spacing:.2px; font-size: clamp(22px, 3.1vw, 38px);
        text-shadow: 2px 2px 15px rgba(0,0,0,.6); line-height:110%; cursor:text;
}
        .mzaCard-kicker{
            margin:.5rem 0; color:var(--mzaC-accent); font-size:clamp(12px,1.7vw,14px);
        font-weight:600; text-shadow: 1px 1px 10px rgba(0,0,0,.6); cursor:text;
}
        .mzaCard-text{
            display:-webkit-box; line-clamp:3; -webkit-line-clamp:3; -webkit-box-orient:vertical;
        overflow:hidden; position:absolute; inset:auto 20px 85px 20px; z-index:2; max-width:60ch;
        background-color: rgba(0,0,0,.4); padding:20px; backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px); border-radius:10px; text-wrap:balance; cursor:text; color:#ddd;
}
        .mzaCard-actions{position:absolute; inset:auto auto 18px 18px; z-index:2; }
        .mzaBtn{
            appearance:none; border:1px solid #9ef7d2; border-radius:14px; padding:15px 20px;
        font-weight:700; color:#0b0e13;
        background-image: linear-gradient(180deg,#9ef7d2,#97ebc8,#8fe0be,#88d5b5,#81c9ab,#7abea2,#73b398,#6ca88f,#659d86,#5e937d,#588874,#517e6b);
        box-shadow:0 3px 15px var(--mzaC-glow); cursor:pointer; transition: transform .2s ease, box-shadow .2s ease;
}
        .mzaBtn:active{transform: translateY(1px); box-shadow:0 3px 10px rgba(130,160,255,.25); }

        .mzaCarousel-controls{
            position:absolute; inset:0; display:flex; align-items:center; justify-content:space-between; pointer-events:none;
}
        .mzaCarousel-prev,.mzaCarousel-next{
            pointer - events:auto; position:relative; width:44px; height:44px; border-radius:50%; border:0;
        background: rgba(255,255,255,.08); backdrop-filter: blur(6px); color: var(--mzaC-fg);
        font-size:22px; display:grid; place-items:center; cursor:pointer; transition: background .2s ease, transform .2s ease;
}
        .mzaCarousel-prev{margin - left:6px; }
        .mzaCarousel-next{margin - right:6px; }
        .mzaCarousel-prev:hover,.mzaCarousel-next:hover{background: rgba(255,255,255,.14); }
        .mzaCarousel-prev:active,.mzaCarousel-next:active{transform: scale(.98); }

        .mzaCarousel-pagination{
            position:absolute; left:0; right:0; bottom:max(27px, env(safe-area-inset-bottom));
        display:flex; gap:10px; justify-content:center; align-items:center; pointer-events:auto;
}
        .mzaCarousel-dot{width:12px; height:12px; border-radius:999px; background: rgba(255,255,255,.25); border:0; cursor:pointer; transition: transform .2s ease, background .2s ease; }
        .mzaCarousel-dot[aria-selected="true"]{background: linear-gradient(180deg, var(--mzaC-accent2), var(--mzaC-accent)); transform: scale(1.35); }

        .mzaCarousel-progress{position:fixed; left:0; right:0; bottom:0; height:4px; background: rgba(255,255,255,.08); z-index:9999; overflow:hidden; }
        .mzaCarousel-progressBar{display:block; height:100%; width:100vw; transform-origin:left; transform: scaleX(0); will-change: transform; background: linear-gradient(90deg, var(--mzaC-accent), var(--mzaC-accent2)); }

        .mzaCarousel-slide[data-state="active"] .mzaCard::before{filter: contrast(1.06) saturate(1.12) brightness(1.02); }
        .mzaCarousel-slide[data-state="active"] .mzaCard{
            box - shadow: 0 30px 70px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.04) inset;
}

        /* parallax layers */
        .mzaPar-1,.mzaPar-2,.mzaPar-3{will - change: transform; transition: transform 500ms cubic-bezier(0.2, 0.7, 0, 1); }
        .mzaPar-1{transform: translate3d(calc(var(--mzaParX,0px) * .35), calc(var(--mzaParY,0px) * .35), 0); }
        .mzaPar-2{transform: translate3d(calc(var(--mzaParX,0px) * .25), calc(var(--mzaParY,0px) * .25), 0); }
        .mzaPar-3{transform: translate3d(calc(var(--mzaParX,0px) * .18), calc(var(--mzaParY,0px) * .18), 0); }

        /* responsive */
        @media (max-width: 1000px){
  :root {--mzaC - slideW: min(92vw, 620px); }
        .mzaCard-head{inset:16px auto auto 16px; }
        .mzaCard-title{font - size: clamp(20px, 5.4vw, 30px); }
        .mzaCard-kicker{font - size: clamp(12px, 3.6vw, 13px); }
        .mzaCard-text{inset:auto 16px 62px 16px; }
}
        @media (max-width: 768px){
  :root {--mzaC - slideW: min(94vw, 560px); }
        .mzaCard-text,.mzaCard-title,.mzaCard-kicker{max - width:45%; }
        .mzaCard-text::after{
            position:absolute; width:100%; height:100%; inset:0;
        background-image: linear-gradient(0deg, rgba(0,0,0,1) 2%, rgba(0,0,0,0) 25%);
        content:""; z-index:1;
  }
}
        @media (max-width: 560px){ :root {--mzaC - slideW: min(96vw, 520px); } }
        @media (max-height: 400px){ .mzaCard - text{display:none; } }
        @media (max-height: 280px){ .mzaCard - kicker{display:none; } }
        @media (max-height: 240px){ .mzaBtn{display:none; } }
        `.trim();

            if (els.js) els.js.value = `
        class MzaCarousel {
            constructor(root, opts = {}) {
            this.root = root;
        this.viewport = root.querySelector(".mzaCarousel-viewport");
        this.track = root.querySelector(".mzaCarousel-track");
        this.slides = Array.from(root.querySelectorAll(".mzaCarousel-slide"));
        this.prevBtn = root.querySelector(".mzaCarousel-prev");
        this.nextBtn = root.querySelector(".mzaCarousel-next");
        this.pagination = root.querySelector(".mzaCarousel-pagination");
        this.progressBar = root.querySelector(".mzaCarousel-progressBar");
        this.isFF = typeof InstallTrigger !== "undefined";
        this.n = this.slides.length;
        this.state = {
            index: 0, pos: 0, width: 0, height: 0, gap: 28, dragging: false,
        pointerId: null, x0: 0, v: 0, t0: 0, animating: false, hovering: false,
        startTime: 0, pausedAt: 0, rafId: 0
    };
        this.opts = Object.assign({
            gap: 28, peek: 0.15, rotateY: 34, zDepth: 150, scaleDrop: 0.09, blurMax: 2.0,
        activeLeftBias: 0.12, interval: 4500, transitionMs: 900, keyboard: true,
        breakpoints: [
        {mq: "(max-width: 1200px)", gap: 24, peek: 0.12, rotateY: 28, zDepth: 120, scaleDrop: 0.08, activeLeftBias: 0.1 },
        {mq: "(max-width: 1000px)", gap: 18, peek: 0.09, rotateY: 22, zDepth: 90, scaleDrop: 0.07, activeLeftBias: 0.09 },
        {mq: "(max-width: 768px)",  gap: 14, peek: 0.06, rotateY: 16, zDepth: 70, scaleDrop: 0.06, activeLeftBias: 0.08 },
        {mq: "(max-width: 560px)",  gap: 12, peek: 0.05, rotateY: 12, zDepth: 60, scaleDrop: 0.05, activeLeftBias: 0.07 }
        ]
      }, opts
        );
        if (this.isFF) {this.opts.rotateY = 10; this.opts.zDepth = 0; this.opts.blurMax = 0; }
        this._init();
  }
        _init() {
            this._setupDots();
        this._bind();
        this._preloadImages();
        this._measure();
        this.goTo(0, false);
        this._startCycle();
        this._loop();
  }
        _preloadImages() {
            this.slides.forEach((sl) => {
                const card = sl.querySelector(".mzaCard");
                const bg = getComputedStyle(card).getPropertyValue("--mzaCard-bg");
                const m = /url\\((?:'|")?([^'")]+)(?:'|")?\\)/.exec(bg);
                if (m && m[1]) { const img = new Image(); img.src = m[1]; }
            });
  }
        _setupDots() {
            this.pagination.innerHTML = "";
    this.dots = this.slides.map((_, i) => {
      const b = document.createElement("button");
        b.type = "button";
        b.className = "mzaCarousel-dot";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", \`Go to slide \${i + 1}\`);
      b.addEventListener("click", () => {this.goTo(i); });
        this.pagination.appendChild(b);
        return b;
    });
  }
        _bind() {
            this.prevBtn.addEventListener("click", () => { this.prev(); });
    this.nextBtn.addEventListener("click", () => {this.next(); });
        if (this.opts.keyboard) {
            this.root.addEventListener("keydown", (e) => {
                if (e.key === "ArrowLeft") this.prev();
                if (e.key === "ArrowRight") this.next();
            });
    }
        const pe = this.viewport;
    pe.addEventListener("pointerdown", (e) => this._onDragStart(e));
    pe.addEventListener("pointermove", (e) => this._onDragMove(e));
    pe.addEventListener("pointerup", (e) => this._onDragEnd(e));
    pe.addEventListener("pointercancel", (e) => this._onDragEnd(e));
    this.root.addEventListener("mouseenter", () => {
            this.state.hovering = true;
        this.state.pausedAt = performance.now();
    });
    this.root.addEventListener("mouseleave", () => {
      if (this.state.pausedAt) {
            this.state.startTime += performance.now() - this.state.pausedAt;
        this.state.pausedAt = 0;
      }
        this.state.hovering = false;
    });
    this.ro = new ResizeObserver(() => this._measure());
        this.ro.observe(this.viewport);
    this.opts.breakpoints.forEach((bp) => {
      const m = window.matchMedia(bp.mq);
      const apply = () => {
            Object.keys(bp).forEach((k) => { if (k !== "mq") this.opts[k] = bp[k]; });
        this._measure(); this._render();
      };
        if (m.addEventListener) m.addEventListener("change", apply);
        else m.addListener(apply);
        if (m.matches) apply();
    });
    this.viewport.addEventListener("pointermove", (e) => this._onTilt(e));
    window.addEventListener("orientationchange", () => setTimeout(() => this._measure(), 250));
  }
        _measure() {
    const viewRect = this.viewport.getBoundingClientRect();
        const rootRect = this.root.getBoundingClientRect();
        const pagRect = this.pagination.getBoundingClientRect();
        const bottomGap = Math.max(12, Math.round(rootRect.bottom - pagRect.bottom));
        const pagSpace = pagRect.height + bottomGap;
        const availH = viewRect.height - pagSpace;
        const cardH = Math.max(320, Math.min(640, Math.round(availH)));
        this.state.width = viewRect.width;
        this.state.height = viewRect.height;
        this.state.gap = this.opts.gap;
        this.slideW = Math.min(880, this.state.width * (1 - this.opts.peek * 2));
        this.root.style.setProperty("--mzaPagH", \`\${pagSpace}px\`);
        this.root.style.setProperty("--mzaCardH", \`\${cardH}px\`);
  }
        _onTilt(e) {
    const r = this.viewport.getBoundingClientRect();
        const mx = (e.clientX - r.left) / r.width - 0.5;
        const my = (e.clientY - r.top) / r.height - 0.5;
        this.root.style.setProperty("--mzaTiltX", (my * -6).toFixed(3));
        this.root.style.setProperty("--mzaTiltY", (mx * 6).toFixed(3));
  }
        _onDragStart(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault();
        this.state.dragging = true;
        this.state.pointerId = e.pointerId;
        this.viewport.setPointerCapture(e.pointerId);
        this.state.x0 = e.clientX;
        this.state.t0 = performance.now();
        this.state.v = 0;
        this.state.pausedAt = performance.now();
  }
        _onDragMove(e) {
    if (!this.state.dragging || e.pointerId !== this.state.pointerId) return;
        const dx = e.clientX - this.state.x0;
        const dt = Math.max(16, performance.now() - this.state.t0);
        this.state.v = dx / dt;
        const slideSpan = this.slideW + this.state.gap;
        this.state.pos = this._mod(this.state.index - dx / slideSpan, this.n);
        this._render();
  }
        _onDragEnd(e) {
    if (!this.state.dragging || (e && e.pointerId !== this.state.pointerId)) return;
        this.state.dragging = false;
        try { if (this.state.pointerId != null) this.viewport.releasePointerCapture(this.state.pointerId); } catch { }
        this.state.pointerId = null;
        if (this.state.pausedAt) {
            this.state.startTime += performance.now() - this.state.pausedAt;
        this.state.pausedAt = 0;
    }
        const v = this.state.v;
        const threshold = 0.18;
    let target = Math.round(this.state.pos - Math.sign(v) * (Math.abs(v) > threshold ? 0.5 : 0));
        this.goTo(this._mod(target, this.n));
  }
        _startCycle() {
            this.state.startTime = performance.now();
        this._renderProgress(0);
  }
        _loop() {
    const step = (t) => {
      if (!this.state.dragging && !this.state.hovering && !this.state.animating) {
        const elapsed = t - this.state.startTime;
        const p = Math.min(1, elapsed / this.opts.interval);
        this._renderProgress(p);
        if (elapsed >= this.opts.interval) this.next();
      }
        this.state.rafId = requestAnimationFrame(step);
    };
        this.state.rafId = requestAnimationFrame(step);
  }
        _renderProgress(p) {this.progressBar.style.transform = \`scaleX(\${p})\`; }
        prev() {this.goTo(this._mod(this.state.index - 1, this.n)); }
        next() {this.goTo(this._mod(this.state.index + 1, this.n)); }
        goTo(i, animate = true) {
    const start = this.state.pos || this.state.index;
        const end = this._nearest(start, i);
        const dur = animate ? this.opts.transitionMs : 0;
        const t0 = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 4);
        this.state.animating = true;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
        const p = dur ? ease(t) : 1;
        this.state.pos = start + (end - start) * p;
        this._render();
        if (t < 1) requestAnimationFrame(step);
        else this._afterSnap(i);
    };
        requestAnimationFrame(step);
  }
        _afterSnap(i) {
            this.state.index = this._mod(Math.round(this.state.pos), this.n);
        this.state.pos = this.state.index;
        this.state.animating = false;
        this._render(true);
        this._startCycle();
  }
        _nearest(from, target) {
            let d = target - Math.round(from);
    if (d > this.n / 2) d -= this.n;
        if (d < -this.n / 2) d += this.n;
        return Math.round(from) + d;
  }
        _mod(i, n) { return ((i % n) + n) % n; }
        _render(markActive = false) {
    const span = this.slideW + this.state.gap;
        const tiltX = parseFloat(this.root.style.getPropertyValue("--mzaTiltX") || 0);
        const tiltY = parseFloat(this.root.style.getPropertyValue("--mzaTiltY") || 0);
        for (let i = 0; i < this.n; i++) {
            let d = i - this.state.pos;
      if (d > this.n / 2) d -= this.n;
        if (d < -this.n / 2) d += this.n;
        const weight = Math.max(0, 1 - Math.abs(d) * 2);
        const biasActive = -this.slideW * this.opts.activeLeftBias * weight;
        const tx = d * span + biasActive;
        const depth = -Math.abs(d) * this.opts.zDepth;
        const rot = -d * this.opts.rotateY;
        const scale = 1 - Math.min(Math.abs(d) * this.opts.scaleDrop, 0.42);
        const blur = Math.min(Math.abs(d) * this.opts.blurMax, this.opts.blurMax);
        const z = Math.round(1000 - Math.abs(d) * 10);
        const s = this.slides[i];
        if (this.isFF) {s.style.transform = \`translate(\${tx}px,-50%) scale(\${scale})\`; s.style.filter = "none"; }
        else {s.style.transform = \`translate3d(\${tx}px,-50%,\${depth}px) rotateY(\${rot}deg) scale(\${scale})\`; s.style.filter = \`blur(\${blur}px)\`; }
        s.style.zIndex = z;
        if (markActive) s.dataset.state = Math.round(this.state.index) === i ? "active" : "rest";
        const card = s.querySelector(".mzaCard");
        const parBase = Math.max(-1, Math.min(1, -d));
        const parX = parBase * 48 + tiltY * 2.0;
        const parY = tiltX * -1.5;
        const bgX = parBase * -64 + tiltY * -2.4;
        card.style.setProperty("--mzaParX", \`\${parX.toFixed(2)}px\`);
        card.style.setProperty("--mzaParY", \`\${parY.toFixed(2)}px\`);
        card.style.setProperty("--mzaParBgX", \`\${bgX.toFixed(2)}px\`);
        card.style.setProperty("--mzaParBgY", \`\${(parY * 0.35).toFixed(2)}px\`);
    }
        const active = this._mod(Math.round(this.state.pos), this.n);
    this.dots.forEach((d, i) => d.setAttribute("aria-selected", i === active ? "true" : "false"));
  }
}
        const mza = new MzaCarousel(document.getElementById("mzaCarousel"), {transitionMs: 900 });
        `.trim();

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
        if (t === 'css' && els.css) els.css.value = 'h1{color:#ff6b6b}body{font - family:system-ui}';
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


    // after you query prev/next in _bind()
    [this.prevBtn, this.nextBtn, this.pagination].forEach(el => {
        el.addEventListener('pointerdown', e => e.stopPropagation(), { passive: true });
    });


})();

