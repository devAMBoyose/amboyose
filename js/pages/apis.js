// Reveal on scroll (unchanged)
(() => {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !items.length) {
        items.forEach(el => el.classList.add('is-visible'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                io.unobserve(e.target);
            }
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    items.forEach(el => io.observe(el));
})();

// Chip filters (All/Client/Server/Fullstack)
(() => {
    const chips = document.querySelectorAll('.chips .chip');
    const cards = document.querySelectorAll('.project-card');
    const empty = document.getElementById('apis-empty');

    if (!chips.length || !cards.length) return;

    // Map filters to accepted data-types
    const FILTERS = {
        all: ['client', 'server', 'fullstack'],
        client: ['client'],
        server: ['server', 'fullstack'],  // <-- server shows server OR fullstack
        fullstack: ['fullstack']
    };

    const applyFilter = (key) => {
        const allow = FILTERS[key] || FILTERS.all;
        let visibleCount = 0;

        cards.forEach(card => {
            const type = (card.getAttribute('data-type') || '').toLowerCase();
            const show = allow.includes(type);
            card.style.display = show ? '' : 'none';
            if (show) visibleCount++;
        });

        if (empty) empty.hidden = visibleCount !== 0;
    };

    chips.forEach(btn => {
        btn.addEventListener('click', () => {
            chips.forEach(c => { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
            btn.classList.add('is-active'); btn.setAttribute('aria-pressed', 'true');
            applyFilter(btn.dataset.filter || 'all');
        });
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
        });
    });

    // Initialize to currently active chip (or "all")
    const active = document.querySelector('.chips .chip.is-active');
    applyFilter(active?.dataset.filter || 'all');
})();
