/* Animated Intro Loader — plays once per session, swap details while loading */
(() => {
    const $intro = document.getElementById('intro-loader');
    if (!$intro) return;

    const params = new URLSearchParams(location.search);
    const force = params.get('intro') === '1';
    const KEY = 'intro_seen';

    if (sessionStorage.getItem(KEY) && !force) {
        $intro.remove();
        return;
    }

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    const $fill = $intro.querySelector('.intro__bar-fill');
    const $pct = $intro.querySelector('.intro__pct');
    const $status = document.getElementById('intro-status');
    const $cmd = document.getElementById('intro-cmd');
    const $tree = document.getElementById('intro-tree');
    const $chips = document.getElementById('intro-chips');

    const setTree = (lines) => {
        $tree.innerHTML = lines.map(l => `<div>${l}</div>`).join('');
    };
    const setChips = (arr) => {
        $chips.innerHTML = arr.map(t => `<span class="chip">${t}</span>`).join('');
    };

    const stages = [
        {
            target: 15,
            label: 'Installing dependencies…',
            cmd: '$ npm install _',
            tree: ['portfolio/', '├─ index.html', '└─ package.json'],
            chips: ["const developer = 'BAMBY';"]
        },
        {
            target: 35,
            label: 'Building…',
            cmd: '$ npm run build _',
            tree: ['build/', '├─ assets/', '└─ chunks/'],
            chips: ["function createPortfolio(){}", "export default App;"]
        },
        {
            target: 55,
            label: 'Optimizing bundles…',
            cmd: '$ vite optimize _',
            tree: ['dist/', '├─ index.html ✓', '└─ style.css ✓'],
            chips: ["return &lt;Portfolio /&gt;"]
        },
        {
            target: 75,
            label: 'Tree-shaking modules…',
            cmd: '$ rollup -c _',
            tree: ['dist/', '├─ app.js ✓', '└─ vendor.js ✓'],
            chips: ["function createPortfolio(){}", "return &lt;Portfolio /&gt;"]
        },
        {
            target: 100,
            label: 'Minifying…',
            cmd: '$ terser app.js _',
            tree: ['✓ Compiled successfully'],
            chips: ["const developer = 'BAMBY';", "export default App;"]
        }
    ];

    let pct = 0;
    let i = 0;

    const applyStage = (s) => {
        if (s.cmd) $cmd.textContent = s.cmd;
        if (s.label) $status.textContent = s.label;
        if (s.tree) setTree(s.tree);
        if (s.chips) setChips(s.chips);
    };
    applyStage(stages[0]);

    function tick() {
        const stage = stages[i] || stages[stages.length - 1];
        const inc = Math.max(1, Math.round((stage.target - pct) * 0.22));
        pct = Math.min(stage.target, pct + inc);

        $fill.style.width = pct + '%';
        $pct.textContent = pct + '%';

        if (pct >= stage.target && i < stages.length - 1) {
            i++;
            applyStage(stages[i]);
        }

        if (pct >= 100) {
            sessionStorage.setItem(KEY, '1');
            setTimeout(() => {
                $intro.classList.add('exit');
                setTimeout(() => {
                    document.documentElement.style.overflow = prevOverflow || '';
                    $intro.remove();
                }, 520);
            }, 300);
        } else {
            setTimeout(tick, 55 + Math.random() * 120);
        }
    }

    requestAnimationFrame(() => setTimeout(tick, 240));
})();
