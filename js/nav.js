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

    // ============ MAIN MENU TOGGLE (MOBILE) ============
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

    // ============ PORTFOLIO SUBMENU (MOBILE ACCORDION) ============
    if (subToggle && submenu) {
        subToggle.addEventListener('click', (e) => {
            // Only act like accordion on mobile
            if (window.matchMedia('(max-width: 900px)').matches) {
                e.preventDefault();
                const expanded = subToggle.getAttribute('aria-expanded') === 'true';
                subToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                submenu.classList.toggle('open', !expanded);
                setArrow(!expanded);
            }
        });

        // Desktop: arrow down on hover, right on leave
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

    // ============ ACTIVE LINK HIGHLIGHT (CURRENT PAGE) ============
    const highlightActiveLink = () => {
        const currentPath = window.location.pathname.replace(/\/+$/, ""); // remove trailing slash
        const links = document.querySelectorAll(".tb-menu a");
        let activeLink = null;

        links.forEach(link => {
            let href = link.getAttribute("href");
            if (!href) return;

            // ignore pure #anchors
            if (href.startsWith("#")) return;

            // make comparable to pathname
            href = href.replace(window.location.origin, "").replace(/\/+$/, "");

            // match full path or end of path (e.g. /pages/projects.html)
            if (currentPath === href || currentPath.endsWith(href)) {
                activeLink = link;
            }
        });

        if (activeLink) {
            // add red active style (CSS: .tb-menu a.is-active)
            activeLink.classList.add("is-active");

            // if it's inside the Portfolio submenu, also light up the main chip
            const submenuEl = activeLink.closest(".submenu");
            if (submenuEl) {
                const parentToggle = submenuEl.parentElement.querySelector(".submenu-toggle");
                if (parentToggle) {
                    parentToggle.classList.add("is-active");
                }
            }
        }
    };

    // Run immediately (script should be loaded after HTML)
    highlightActiveLink();

})();
