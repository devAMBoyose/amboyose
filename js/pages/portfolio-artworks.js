// Graphics filters + FLIP animation (single version)

// DOM refs
const filters = document.querySelectorAll('.apw-filter');
const cards = document.querySelectorAll('.apw-card');
const grids = Array.from(document.querySelectorAll('.apw-grid'));
const topGrid = grids[0];
const section = document.querySelector('.apw-works');

// snapshot original layout (grid + index) so "ALL" restores precisely
const snapshot = Array.from(cards).map(el => ({
    el,
    parent: el.parentElement,
    index: Array.from(el.parentElement.children).indexOf(el),
    gridIdx: grids.indexOf(el.parentElement)
}));

function restoreAll() {
    grids.forEach(g => g.innerHTML = '');
    snapshot
        .sort((a, b) => a.gridIdx - b.gridIdx || a.index - b.index)
        .forEach(s => s.parent.appendChild(s.el));
}

function markEmptyGrids() {
    grids.forEach(g => {
        const anyVisible = Array.from(g.children).some(ch => !ch.classList.contains('-hide'));
        g.dataset.empty = anyVisible ? '0' : '1';
    });
}

function scrollToTop() {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- FLIP helpers ---------- */
function measureRects(els) {
    const map = new Map();
    els.forEach(el => {
        if (!el.classList.contains('-hide')) map.set(el, el.getBoundingClientRect());
    });
    return map;
}

function flipAnimate(els, firstRects, duration = 360) {
    els.forEach(el => {
        if (el.classList.contains('-hide')) return;
        const last = el.getBoundingClientRect();
        const first = firstRects.get(el);
        if (!first) return;
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        el.animate(
            [
                { transform: `translate(${dx}px, ${dy}px)`, opacity: 0.92 },
                { transform: 'translate(0,0)', opacity: 1 }
            ],
            { duration, easing: 'cubic-bezier(.2,.8,.2,1)' }
        );
    });
}

/* ---------- Main handler ---------- */
filters.forEach((btn) => {
    btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.dataset.filter;

        // FIRST: measure before layout changes
        const firstRects = measureRects(cards);

        if (filter === 'all') {
            restoreAll();
            cards.forEach(c => { c.classList.remove('is-fading-out'); c.classList.remove('-hide'); });
            markEmptyGrids();
            requestAnimationFrame(() => { flipAnimate(cards, firstRects); scrollToTop(); });
            return;
        }

        // reset to original structure each click
        restoreAll();

        const matches = Array.from(cards).filter(c => c.dataset.cat === filter);
        const nonMatches = Array.from(cards).filter(c => c.dataset.cat !== filter);

        matches.forEach(m => m.classList.remove('-hide')); // make them measurable

        // fade out non-matches, then collapse
        nonMatches.forEach(n => {
            n.classList.add('is-fading-out');
            setTimeout(() => { n.classList.remove('is-fading-out'); n.classList.add('-hide'); }, 220);
        });

        // promote matches to the first grid
        const frag = document.createDocumentFragment();
        matches.forEach(m => frag.appendChild(m));
        topGrid.appendChild(frag);

        markEmptyGrids();

        requestAnimationFrame(() => { flipAnimate(matches, firstRects); scrollToTop(); });
    });
});

// initial state
markEmptyGrids();
