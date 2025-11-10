/* About Pro – animated + accessible */
(() => {
    'use strict';

    // Reveal only section wrappers
    const sections = document.querySelectorAll('.about-pro .ap');
    sections.forEach(el => el.classList.add('ap-reveal'));

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('is-in');

            if (e.target.classList.contains('ap-stats') && !io._countersStarted) {
                io._countersStarted = true;
                runCounters();
            }
            io.unobserve(e.target);
        });
    }, { threshold: 0.15 });

    sections.forEach(el => io.observe(el));

    // Count-up numbers
    function runCounters() {
        const nums = document.querySelectorAll('.about-pro .ap-card__num[data-count]');
        nums.forEach(el => {
            const end = parseInt(el.dataset.count, 10) || 0;
            const startVal = parseInt(el.textContent.replace(/[^\d]/g, ''), 10) || 0;
            const t0 = performance.now();
            const dur = 1400 + Math.random() * 600;

            const tick = (t) => {
                const p = Math.min(1, (t - t0) / dur);
                const eased = 1 - Math.pow(1 - p, 3);
                const val = Math.round(startVal + (end - startVal) * eased);
                el.textContent = val.toLocaleString();
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    }

    // Parallax lights + chip ripple pointer position
    const root = document.querySelector('.about-pro');
    const setPos = (e) => {
        const r = root.getBoundingClientRect();
        const mx = (e.clientX - r.left) / r.width * 100;
        const my = (e.clientY - r.top) / r.height * 100;
        root.style.setProperty('--orb-x', `${(mx - 50) / 20}rem`);
        root.style.setProperty('--orb-y', `${(my - 50) / 20}rem`);
        root.querySelectorAll('.ap-chip').forEach(c => {
            c.style.setProperty('--mx', `${mx}%`);
        });
    };
    root.addEventListener('pointermove', setPos, { passive: true });
})();



/* ===== cursor-following glow engine (shared) ===== */
(function cursorGlow() {
    const root = document.documentElement;
    let targetX = 0.5, targetY = 0.5;
    let curX = targetX, curY = targetY;
    const ease = 0.12;
    let rafId = null;

    function onMove(e) {
        const vw = window.innerWidth, vh = window.innerHeight;
        let x = 0.5, y = 0.5;
        if (e.touches && e.touches[0]) {
            x = e.touches[0].clientX / vw;
            y = e.touches[0].clientY / vh;
        } else if (typeof e.clientX === "number") {
            x = e.clientX / vw;
            y = e.clientY / vh;
        }
        targetX = Math.max(0, Math.min(1, x));
        targetY = Math.max(0, Math.min(1, y));
        if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function tick() {
        curX += (targetX - curX) * ease;
        curY += (targetY - curY) * ease;
        root.style.setProperty("--cx", (curX * 100).toFixed(2) + "%");
        root.style.setProperty("--cy", (curY * 100).toFixed(2) + "%");
        if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
            rafId = requestAnimationFrame(tick);
        } else {
            rafId = null;
        }
    }

    root.style.setProperty("--cx", "50%");
    root.style.setProperty("--cy", "50%");
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
})();

