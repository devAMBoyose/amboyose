// =========================================================
// BAMWORLDBANK FRONTEND JS
// Safe on both LOGIN and DASHBOARD pages
// =========================================================

// ---------------- THEME + SETTINGS ----------------
(function () {
    const root = document.documentElement;
    const THEME_KEY = "bamworldbank-theme";

    // Optional controls – only exist on some pages
    const themeToggleBtn = document.getElementById("themeToggle");  // e.g. on auth page
    const darkToggle = document.getElementById("darkModeToggle");   // e.g. on dashboard
    const notifToggle = document.getElementById("notifToggle");
    const saveSettings = document.getElementById("saveSettings");
    const statusEl = document.getElementById("settingsStatus");

    const setTheme = (mode) => {
        if (mode === "light") {
            root.style.setProperty("--bg", "#e5e7eb");
            root.style.setProperty("--bg-soft", "rgba(243, 244, 246, 0.9)");
            root.style.setProperty("--glass", "rgba(255,255,255,0.9)");
            root.style.setProperty("--text-main", "#020617");
        } else {
            // Dark = reset to CSS defaults
            root.style.removeProperty("--bg");
            root.style.removeProperty("--bg-soft");
            root.style.removeProperty("--glass");
            root.style.removeProperty("--text-main");
        }
        localStorage.setItem(THEME_KEY, mode);
    };

    // Initialize theme from saved preference
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light") {
        setTheme("light");
        if (darkToggle) darkToggle.checked = false;
    } else if (saved === "dark") {
        setTheme("dark");
        if (darkToggle) darkToggle.checked = true;
    }

    // Click toggle (e.g. sun/moon icon)
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const current = localStorage.getItem(THEME_KEY) || "dark";
            const next = current === "light" ? "dark" : "light";
            setTheme(next);
            if (darkToggle) darkToggle.checked = next === "dark";
        });
    }

    // Dashboard switch (checkbox style – if you later make it a switch)
    if (darkToggle) {
        darkToggle.addEventListener("change", () => {
            setTheme(darkToggle.checked ? "dark" : "light");
        });
    }

    // Demo settings save (optional panel)
    if (saveSettings && statusEl) {
        saveSettings.addEventListener("click", async () => {
            try {
                const payload = {
                    darkMode: darkToggle ? !!darkToggle.checked : false,
                    notifications: notifToggle ? !!notifToggle.checked : false,
                };

                const res = await fetch("/api/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    statusEl.textContent = "Settings saved (demo only).";
                } else {
                    statusEl.textContent = "Unable to save settings.";
                }
            } catch (e) {
                statusEl.textContent = "Error saving settings.";
            }
        });
    }
})();

// ---------------- E-WALLET MODAL ----------------
(function () {
    const btn = document.getElementById("ewalletBtn");
    const overlay = document.getElementById("ewalletSheet");
    const closeBtn = document.getElementById("ewalletCloseBtn");
    const listEl = document.getElementById("ewalletList");
    const searchInput = document.getElementById("ewalletSearch");

    // Only run on dashboard where elements exist
    if (!btn || !overlay || !listEl) return;

    // Ensure overlay starts hidden
    overlay.style.display = "none";

    const EWALLETS = [
        { name: "ShopeePay", sub: "SHOPEEPAY", logo: "/img/ewallet/shopeepay.png" },
        { name: "G-XChange / GCash", sub: "GCASH", logo: "/img/ewallet/gcash.png" },
        { name: "GrabPay", sub: "GRABPAY", logo: "/img/ewallet/grabpay.png" },
        { name: "DCPay / COINS.PH", sub: "COINSPH", logo: "/img/ewallet/coins.png" },
        { name: "SpeedyPay / eMango Pay", sub: "EMANGO", logo: "" },
        { name: "Alipay / Lazada Wallet", sub: "ALIPAY_LAZADA", logo: "/img/ewallet/lazada.png" },
        { name: "CIS Bayad Center / Bayad", sub: "BAYAD", logo: "/img/ewallet/bayad.png" },
        {
            name: "I-Remit / iCASH",
            sub: "IREMIT",
            logo: "",
            status: "Maintenance",
            disabled: true,
        },
    ];

    function render(list) {
        listEl.innerHTML = "";
        list.forEach((w) => {
            const li = document.createElement("li");
            li.className = "ewallet-item" + (w.disabled ? " is-disabled" : "");
            li.innerHTML = `
                <div class="ewallet-main">
                    <span class="ewallet-logo">
                        ${w.logo
                    ? `<img src="${w.logo}" alt="${w.name} logo">`
                    : (w.name[0] || "?")
                }
                    </span>
                    <div>
                        <div class="ewallet-name">${w.name}</div>
                        <div class="ewallet-sub">${w.sub}</div>
                    </div>
                </div>
                ${w.status
                    ? `<span class="ewallet-chip">${w.status}</span>`
                    : ""
                }
            `;
            listEl.appendChild(li);
        });
    }

    function openSheet() {
        overlay.style.display = "flex";
        overlay.removeAttribute("hidden");
        document.body.classList.add("modal-open");
        requestAnimationFrame(() => {
            overlay.classList.add("is-open");
        });
    }

    function closeSheet() {
        overlay.classList.remove("is-open");
        document.body.classList.remove("modal-open");
        setTimeout(() => {
            overlay.style.display = "none";
            overlay.setAttribute("hidden", "");
        }, 200);
    }

    btn.addEventListener("click", openSheet);
    if (closeBtn) closeBtn.addEventListener("click", closeSheet);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeSheet();
    });

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const q = searchInput.value.toLowerCase().trim();
            const filtered = EWALLETS.filter((w) =>
                (w.name + " " + w.sub).toLowerCase().includes(q)
            );
            render(filtered);
        });
    }

    // Initial list
    render(EWALLETS);
})();

// ---------------- PROFILE MODAL ----------------
(function () {
    const btn = document.getElementById("profileBtn");
    const overlay = document.getElementById("profileSheet");
    const closeBtn = document.getElementById("profileCloseBtn");

    // Only on dashboard
    if (!btn || !overlay) return;

    // Ensure overlay starts hidden
    overlay.style.display = "none";

    function openProfile() {
        overlay.style.display = "flex";
        overlay.removeAttribute("hidden");
        document.body.classList.add("modal-open");
        requestAnimationFrame(() => {
            overlay.classList.add("is-open");
        });
    }

    function closeProfile() {
        overlay.classList.remove("is-open");
        document.body.classList.remove("modal-open");
        setTimeout(() => {
            overlay.style.display = "none";
            overlay.setAttribute("hidden", "");
        }, 200);
    }

    btn.addEventListener("click", openProfile);
    if (closeBtn) closeBtn.addEventListener("click", closeProfile);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeProfile();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.style.display !== "none") {
            closeProfile();
        }
    });
})();

// -------------- CARD NUMBER + BALANCE TOGGLE --------------
(function () {
    const numberEl = document.getElementById("cardNumber");
    const numberToggle = document.getElementById("cardNumberToggle");

    // either id="balanceToggle" or class="js-balance-toggle" will work
    const balanceEl = document.getElementById("cardBalance");
    const balanceToggle =
        document.getElementById("balanceToggle") ||
        document.querySelector(".js-balance-toggle");

    // ----- CARD NUMBER -----
    if (numberEl && numberToggle) {
        const maskedNumber = numberEl.dataset.masked || numberEl.textContent.trim();
        const fullNumber =
            numberEl.dataset.full && numberEl.dataset.full.trim().length > 0
                ? numberEl.dataset.full.trim()
                : maskedNumber;

        let showNumber = false;

        function updateNumber() {
            showNumber = !showNumber;
            numberEl.textContent = showNumber ? fullNumber : maskedNumber;
            numberToggle.innerHTML = showNumber
                ? '<i class="fa-regular fa-eye-slash"></i>'
                : '<i class="fa-regular fa-eye"></i>';
        }

        numberToggle.addEventListener("click", updateNumber);
    }

    // ----- BALANCE -----
    if (balanceEl && balanceToggle) {
        const maskedBalance = balanceEl.dataset.masked || "••••••";
        const fullBalance =
            balanceEl.dataset.full && balanceEl.dataset.full.trim().length > 0
                ? balanceEl.dataset.full.trim()
                : balanceEl.textContent.trim();

        let showBalance = true; // starts visible

        function updateBalance() {
            showBalance = !showBalance;
            balanceEl.textContent = showBalance ? fullBalance : maskedBalance;
            balanceToggle.innerHTML = showBalance
                ? '<i class="fa-regular fa-eye-slash"></i>'
                : '<i class="fa-regular fa-eye"></i>';
        }

        // initial icon state (showing balance)
        balanceToggle.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';

        balanceToggle.addEventListener("click", updateBalance);
    }
})();



// ---------------- AUTH FLIP TABS (LOGIN PAGE) ----------------
(function () {
    const tabs = document.querySelectorAll(".auth-tabs__btn");
    const card = document.getElementById("authCard");

    // Only on login/auth page
    if (!tabs.length || !card) return;

    tabs.forEach((btn) => {
        btn.addEventListener("click", () => {
            // Set active tab style
            tabs.forEach((t) => t.classList.remove("is-active"));
            btn.classList.add("is-active");

            // Flip auth card
            if (btn.dataset.view === "signup") {
                card.classList.add("is-flipped");
            } else {
                card.classList.remove("is-flipped");
            }
        });
    });
})();
