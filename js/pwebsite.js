// ===== Projects Grid (scoped) =====
(() => {
    const root = document.getElementById('projects');
    if (!root) return;

    // Reveal on scroll
    const revealEls = root.querySelectorAll('.pg-reveal');
    const revIO = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { threshold: 0.2 });
    revealEls.forEach(el => revIO.observe(el));

    // Counter animation per project section
    function animateCount(el) {
        const target = parseFloat(el.dataset.target);
        const dec = parseInt(el.dataset.decimals || 0, 10);
        const dur = 1400;
        const startT = performance.now();
        const ease = t => 1 - Math.pow(1 - t, 3); // cubic out

        function tick(now) {
            const p = Math.min(1, (now - startT) / dur);
            el.textContent = (target * ease(p)).toFixed(dec);
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    root.querySelectorAll('.pg-project').forEach(section => {
        const nums = section.querySelectorAll('.pg-stat__num');
        if (!nums.length) return;
        let started = false;
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting && !started) {
                    started = true;
                    nums.forEach(animateCount);
                }
            });
        }, { threshold: 0.35 });
        io.observe(nums[0].closest('.pg-stats'));
    });

    // Minimal gallery slider (autoplay, hover pause, swipe)
    root.querySelectorAll('.pg-gallery').forEach(g => {
        const slides = [...g.querySelectorAll('.pg-mock__slide')];
        const dotsWrap = g.querySelector('.pg-mock__dots');
        const prev = g.querySelector('.pg-mock__ctrl.prev');
        const next = g.querySelector('.pg-mock__ctrl.next');
        const ms = parseInt(g.dataset.autoplay || '4000', 10);
        const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const dots = slides.map((_, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'is-active';
            b.classList.toggle('is-active', i === 0);
            b.addEventListener('click', () => { go(i); restart(); });
            return b;
        });
        dots.forEach(d => dotsWrap.appendChild(d));

        let i = 0, timer = null, hover = false;
        const setActive = n => {
            slides.forEach((s, idx) => s.classList.toggle('is-active', idx === n));
            dots.forEach((d, idx) => d.classList.toggle('is-active', idx === n));
        };
        const go = n => { i = (n + slides.length) % slides.length; setActive(i); };
        const nextFn = () => go(i + 1), prevFn = () => go(i - 1);

        function start() {
            stop();
            if (prefersReduce) return;
            timer = setInterval(() => {
                if (!hover && document.visibilityState === 'visible') nextFn();
            }, ms);
        }
        function stop() { if (timer) clearInterval(timer); }
        function restart() { stop(); start(); }

        if (next) next.addEventListener('click', () => { nextFn(); restart(); });
        if (prev) prev.addEventListener('click', () => { prevFn(); restart(); });

        g.addEventListener('mouseenter', () => hover = true);
        g.addEventListener('mouseleave', () => hover = false);

        // Touch swipe
        let x0 = null;
        g.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
        g.addEventListener('touchend', e => {
            if (x0 == null) return;
            const dx = e.changedTouches[0].clientX - x0;
            if (Math.abs(dx) > 40) (dx < 0 ? nextFn() : prevFn());
            x0 = null;
        }, { passive: true });

        setActive(0);
        start();
    });
})();
