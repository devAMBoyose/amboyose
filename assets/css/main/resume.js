/* Resume page scripts */
(function () {
    // Mark "Resume" nav link active
    const link = document.querySelector('a[data-current="resume"]');
    if (link) link.classList.add('is-active');

    // Ensure verify buttons open safely in new tab
    document.querySelectorAll('.verify-btn').forEach(btn => {
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener noreferrer');
    });

    // Scroll-in animations (IntersectionObserver)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = Array.from(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    if (reduceMotion) {
        items.forEach(el => el.classList.add('is-visible'));
        return;
    }

    // Stagger helper for groups
    const setStagger = (parent) => {
        const children = parent ? Array.from(parent.querySelectorAll(':scope > .reveal')) : [];
        children.forEach((el, i) => el.style.setProperty('--d', `${i * 70}ms`));
    };
    document.querySelectorAll('.pills, #certificates').forEach(setStagger);

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (!entry.target.style.getPropertyValue('--d')) {
                    const jitter = Math.round(Math.random() * 80);
                    entry.target.style.setProperty('--d', `${jitter}ms`);
                }
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

    items.forEach(el => io.observe(el));
})();
