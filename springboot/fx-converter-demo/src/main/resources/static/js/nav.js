
(() => {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const subToggle = document.querySelector('.submenu-toggle');
    const submenu = document.getElementById('portfolioSubmenu');
    const arrowIcon = subToggle ? subToggle.querySelector('i') : null;

    const setArrow = (isOpen) => {
        if (!arrowIcon) return;
        arrowIcon.classList.toggle('fa-angle-right', !isOpen);
        arrowIcon.classList.toggle('fa-angle-down', isOpen);
    };

    // Open/close main menu (mobile)
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const open = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            const inTitleBar = e.target.closest('.title-bar');
            if (!inTitleBar && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                if (submenu?.classList.contains('open')) {
                    submenu.classList.remove('open');
                    subToggle?.setAttribute('aria-expanded', 'false');
                    setArrow(false);
                }
            }
        });

        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
            if (submenu?.classList.contains('open')) {
                submenu.classList.remove('open');
                subToggle?.setAttribute('aria-expanded', 'false');
                setArrow(false);
            }
        });
    }

    // Portfolio accordion on mobile (click)
    if (subToggle && submenu) {
        subToggle.addEventListener('click', (e) => {
            if (window.matchMedia('(max-width: 900px)').matches) {
                e.preventDefault();
                const expanded = subToggle.getAttribute('aria-expanded') === 'true';
                subToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                submenu.classList.toggle('open', !expanded);
                setArrow(!expanded);
            }
        });

        // Desktop: show down arrow while hovered, back to right when leaving
        const parentItem = subToggle.closest('.has-submenu');
        if (parentItem) {
            parentItem.addEventListener('mouseenter', () => {
                if (window.matchMedia('(min-width: 901px)').matches) setArrow(true);
            });
            parentItem.addEventListener('mouseleave', () => {
                if (window.matchMedia('(min-width: 901px)').matches) setArrow(false);
            });
        }
    }
})();

