(function () {
    const topbar = document.getElementById('topbar');
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const DESK = 921;

    if (!topbar || !toggle || !menu) return;

    function closeMenu() {
        topbar.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        menu.style.maxHeight = '0px';
    }
    function openMenu() {
        topbar.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        menu.style.maxHeight = Math.min(menu.scrollHeight, 320) + 'px';
    }

    toggle.addEventListener('click', () => {
        topbar.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    document.addEventListener('click', (e) => {
        if (!topbar.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= DESK) {
            topbar.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            menu.style.maxHeight = '';
        } else if (topbar.classList.contains('is-open')) {
            menu.style.maxHeight = Math.min(menu.scrollHeight, 320) + 'px';
        }
    }, { passive: true });
})();
