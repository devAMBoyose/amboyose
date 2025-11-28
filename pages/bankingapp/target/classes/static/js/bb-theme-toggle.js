// bb-theme-toggle.js
// Standalone theme toggle for BamBanking dashboard

(function () {
    const THEME_KEY = "bambanking-theme";
    const root = document.body;
    const toggle = document.getElementById("bbThemeToggle");

    if (!toggle) return; // safety

    const buttons = toggle.querySelectorAll("button");

    function applyTheme(theme) {
        // remove both classes first
        root.classList.remove("bb-theme-light", "bb-theme-dark");

        if (theme === "light") {
            root.classList.add("bb-theme-light");
        } else {
            root.classList.add("bb-theme-dark");
        }

        // active state on buttons
        buttons.forEach((btn) => {
            btn.classList.toggle("is-active", btn.dataset.theme === theme);
        });

        // remember choice
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (_) {
            // ignore if storage is blocked
        }
    }

    // Load saved theme or default to "dark"
    let initial = "dark";
    try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === "light" || saved === "dark") {
            initial = saved;
        }
    } catch (_) { }

    applyTheme(initial);

    // Click handlers
    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const theme = btn.dataset.theme;
            applyTheme(theme === "light" ? "light" : "dark");
        });
    });
})();
