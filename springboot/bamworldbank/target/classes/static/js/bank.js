// ---------------- THEME + SETTINGS ----------------
(function () {
    const root = document.documentElement;
    const THEME_KEY = "bamworldbank-theme";

    const toggleBtn = document.getElementById("themeToggle"); // optional, for auth page
    const darkToggle = document.getElementById("darkModeToggle");
    const notifToggle = document.getElementById("notifToggle");
    const saveSettings = document.getElementById("saveSettings");
    const statusEl = document.getElementById("settingsStatus");

    const setTheme = (mode) => {
        if (mode === "light") {
            root.style.setProperty("--bg", "#e5e7eb");
            root.style.setProperty("--bg-soft", "rgba(243, 244, 246, 0.9)");
            root.style.setProperty("--glass", "rgba(255,255,255,0.9)");
            root.style.setProperty("--text", "#020617");
        } else {
            root.style.removeProperty("--bg");
            root.style.removeProperty("--bg-soft");
            root.style.removeProperty("--glass");
            root.style.removeProperty("--text");
        }
        localStorage.setItem(THEME_KEY, mode);
    };

    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light") {
        setTheme("light");
        if (darkToggle) darkToggle.checked = false;
    } else if (saved === "dark") {
        setTheme("dark");
        if (darkToggle) darkToggle.checked = true;
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const next =
                localStorage.getItem(THEME_KEY) === "light" ? "dark" : "light";
            setTheme(next);
            if (darkToggle) darkToggle.checked = next === "dark";
        });
    }

    if (darkToggle) {
        darkToggle.addEventListener("change", () => {
            setTheme(darkToggle.checked ? "dark" : "light");
        });
    }

    if (saveSettings && statusEl) {
        saveSettings.addEventListener("click", async () => {
            try {
                const payload = {
                    darkMode: darkToggle ? darkToggle.checked : false,
                    notifications: notifToggle ? notifToggle.checked : false,
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

    if (!btn || !overlay || !listEl) return;

    const EWALLETS = [
        { name: "ShopeePay", sub: "SHOPEEPAY", logo: "/img/ewallet/shopeepay.png" },
        { name: "G-XChange / GCash", sub: "GCASH", logo: "/img/ewallet/gcash.png" },
        { name: "GrabPay", sub: "GRABPAY", logo: "/img/ewallet/grabpay.png" },
        { name: "DCPay / COINS.PH", sub: "COINSPH", logo: "/img/ewallet/coins.png" },
        { name: "SpeedyPay / eMango Pay", sub: "EMANGO", logo: "" },
        { name: "Alipay / Lazada Wallet", sub: "ALIPAY_LAZADA", logo: "/img/ewallet/lazada.png" },
        {
            name: "CIS Bayad Center / Bayad",
            sub: "BAYAD",
            logo: "/img/ewallet/bayad.png"
        },
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
        overlay.hidden = false;
        document.body.classList.add("modal-open");
        requestAnimationFrame(() => {
            overlay.classList.add("is-open");
        });
    }

    function closeSheet() {
        overlay.classList.remove("is-open");
        document.body.classList.remove("modal-open");
        setTimeout(() => {
            overlay.hidden = true;
        }, 200);
    }

    btn.addEventListener("click", openSheet);
    if (closeBtn) closeBtn.addEventListener("click", closeSheet);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeSheet();
        }
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

    render(EWALLETS);
})();

// ---------------- PROFILE MODAL ----------------
(function () {
    const btn = document.getElementById("profileBtn");
    const overlay = document.getElementById("profileSheet");
    const closeBtn = document.getElementById("profileCloseBtn");

    if (!btn || !overlay) return;

    function openProfile() {
        overlay.hidden = false;
        document.body.classList.add("modal-open");
        requestAnimationFrame(() => {
            overlay.classList.add("is-open");
        });
    }

    function closeProfile() {
        overlay.classList.remove("is-open");
        document.body.classList.remove("modal-open");
        setTimeout(() => {
            overlay.hidden = true;
        }, 200);
    }

    btn.addEventListener("click", openProfile);
    if (closeBtn) closeBtn.addEventListener("click", closeProfile);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeProfile();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !overlay.hidden) {
            closeProfile();
        }
    });
})();

// -------------- CARD NUMBER + BALANCE TOGGLE --------------
(function () {
    const numberEl = document.getElementById("cardNumber");
    const balanceEl = document.getElementById("cardBalance");
    const toggleBtn = document.getElementById("cardNumberToggle");

    if (!numberEl || !toggleBtn) return;

    // card number values
    const maskedNumber = numberEl.dataset.masked || numberEl.textContent.trim();
    const fullNumber =
        numberEl.dataset.full && numberEl.dataset.full.trim().length > 0
            ? numberEl.dataset.full.trim()
            : maskedNumber;

    // balance values
    let maskedBalance = null;
    let fullBalance = null;

    if (balanceEl) {
        maskedBalance = balanceEl.dataset.masked || "••••••";
        fullBalance =
            balanceEl.dataset.full && balanceEl.dataset.full.trim().length > 0
                ? balanceEl.dataset.full.trim()
                : balanceEl.textContent.trim();
    }

    let isVisible = false;

    toggleBtn.addEventListener("click", () => {
        isVisible = !isVisible;

        numberEl.textContent = isVisible ? fullNumber : maskedNumber;

        if (balanceEl) {
            balanceEl.textContent = isVisible ? fullBalance : maskedBalance;
        }

        toggleBtn.innerHTML = isVisible
            ? '<i class="fa-regular fa-eye-slash"></i>'
            : '<i class="fa-regular fa-eye"></i>';
    });
})();

// ---------------- AUTH FLIP TABS ----------------
(function () {
    const tabs = document.querySelectorAll(".auth-tabs__btn");
    const card = document.getElementById("authCard");
    if (!tabs.length || !card) return;

    tabs.forEach((btn) => {
        btn.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("is-active"));
            btn.classList.add("is-active");

            if (btn.dataset.view === "signup") {
                card.classList.add("is-flipped");
            } else {
                card.classList.remove("is-flipped");
            }
        });
    });
})();
