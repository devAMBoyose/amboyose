// /js/cursor-bg.js
(function () {
    const el = document.getElementById('cursor-bg');
    if (!el) return;

    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;

    window.addEventListener('mousemove', (e) => {
        x = e.clientX; y = e.clientY;
        if (!raf) raf = requestAnimationFrame(tick);
    });

    function tick() {
        // ease toward the cursor (0.15 = smoother trail; raise for snappier)
        tx += (x - tx) * 0.15;
        ty += (y - ty) * 0.15;
        el.style.transform = `translate(${tx}px, ${ty}px)`;
        raf = requestAnimationFrame(tick);
    }
})();
