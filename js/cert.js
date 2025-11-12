// Achievements filter + accessibility + small UX polish

(function () {
    const STORAGE_KEY = "ac_filter_v1";
    const chips = Array.from(document.querySelectorAll(".ac-chip"));
    const cards = Array.from(document.querySelectorAll(".ac-card"));

    if (!chips.length || !cards.length) return;

    // Make chips act like proper tabs
    chips.forEach((chip, i) => {
        chip.setAttribute("tabindex", chip.classList.contains("is-active") ? "0" : "-1");
        chip.setAttribute("role", "tab");
        if (!chip.hasAttribute("aria-selected")) {
            chip.setAttribute("aria-selected", chip.classList.contains("is-active") ? "true" : "false");
        }

        chip.addEventListener("click", () => selectChip(chip));
        chip.addEventListener("keydown", (e) => {
            // Arrow navigation
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const dir = e.key === "ArrowRight" ? 1 : -1;
                const next = chips[(i + dir + chips.length) % chips.length];
                next.focus();
                selectChip(next);
            }
            if (e.key === "Home") { e.preventDefault(); chips[0].focus(); selectChip(chips[0]); }
            if (e.key === "End") { e.preventDefault(); chips[chips.length - 1].focus(); selectChip(chips[chips.length - 1]); }
        });
    });

    // Restore persisted filter
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved ? chips.find(c => c.dataset.acFilter === saved) : document.querySelector(".ac-chip.is-active");
    if (initial) selectChip(initial, { skipFocus: true });

    function selectChip(chip, opts = {}) {
        chips.forEach(c => {
            c.classList.toggle("is-active", c === chip);
            c.setAttribute("aria-selected", c === chip ? "true" : "false");
            c.setAttribute("tabindex", c === chip ? "0" : "-1");
        });

        const type = chip.getAttribute("data-ac-filter");
        localStorage.setItem(STORAGE_KEY, type);

        // Filter cards
        cards.forEach(card => {
            const show = (type === "all") || (card.getAttribute("data-ac-type") === type);
            card.style.display = show ? "" : "none";
            if (show) card.removeAttribute("aria-hidden");
            else card.setAttribute("aria-hidden", "true");
        });

        if (!opts.skipFocus) chip.focus();
        updateCountAnnounce();
    }

    // Announce visible count (improves SR experience)
    let live = document.getElementById("ac-live");
    if (!live) {
        live = document.createElement("div");
        live.id = "ac-live";
        live.setAttribute("aria-live", "polite");
        live.setAttribute("class", "sr-only");
        // visually hidden styles without touching your CSS files
        live.style.position = "absolute";
        live.style.width = "1px";
        live.style.height = "1px";
        live.style.margin = "-1px";
        live.style.overflow = "hidden";
        live.style.clip = "rect(0 0 0 0)";
        live.style.clipPath = "inset(50%)";
        live.style.border = 0;
        document.body.appendChild(live);
    }

    function updateCountAnnounce() {
        const visible = cards.filter(c => c.style.display !== "none").length;
        const label = (document.querySelector(".ac-chip.is-active")?.textContent || "All").trim();
        live.textContent = `${visible} item${visible === 1 ? "" : "s"} visible for ${label}.`;
    }

    // Subtle reveal on scroll (respects reduced motion)
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.animate(
                        [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }],
                        { duration: 220, easing: "cubic-bezier(.2,.6,.2,1)", fill: "both" }
                    );
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.2 });

        cards.forEach(card => io.observe(card));
    }

    // Initial announce
    updateCountAnnounce();
})();
