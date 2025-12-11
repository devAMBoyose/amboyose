// ========= CONFIG =========

// use your real live app here
const DEMO_URL = "https://bankingapp-portfolio.onrender.com/bambanking/login";

// this will call a new API endpoint inside the SAME app
const API_SUMMARY_URL =
    "https://bankingapp-portfolio.onrender.com/bambanking/api/demo-summary";

const TOTAL_SECONDS = 26;
const AUTO_REDIRECT = true;
const REDIRECT_DELAY_MS = 3000;



// ========= ELEMENTS =========
const countdownLabel = document.getElementById("countdownLabel");
const statusText = document.getElementById("statusText");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const keepReadingBtn = document.getElementById("keepReadingBtn");
const extraInfo = document.getElementById("extraInfo");
const openDemoBtn = document.getElementById("openDemoBtn");

// demo dashboard elements
const demoBalanceEl = document.getElementById("demoBalance");
const demoCurrencyEl = document.getElementById("demoCurrency");
const demoAccountLabelEl = document.getElementById("demoAccountLabel");
const demoUpdatedAtEl = document.getElementById("demoUpdatedAt");
const demoApiStatusEl = document.getElementById("demoApiStatus");
const demoTxBodyEl = document.getElementById("demoTxBody");

// set link href
openDemoBtn.href = DEMO_URL;

keepReadingBtn.addEventListener("click", () => {
    extraInfo.style.display = extraInfo.style.display === "none" ? "block" : "none";
});

openDemoBtn.addEventListener("click", (e) => {
    // allow user to click manually anytime – no JS prevention
});

// ========= COUNTDOWN / PROGRESS =========
let elapsed = 0;
let ready = false;

const timer = setInterval(() => {
    elapsed++;
    const ratio = Math.min(elapsed / TOTAL_SECONDS, 1);
    const percent = Math.round(ratio * 100);

    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent + "%";

    const secondsLeft = Math.max(TOTAL_SECONDS - elapsed, 0);
    countdownLabel.textContent = secondsLeft > 0
        ? `approx ${secondsLeft}s remaining`
        : "service should be ready";

    if (percent < 30) {
        statusText.textContent = "Allocating resources on Render…";
    } else if (percent < 60) {
        statusText.textContent = "Booting Spring Boot application…";
    } else if (percent < 90) {
        statusText.textContent = "Connecting to database & loading dashboard…";
    } else {
        statusText.textContent = "BamBanking API is almost ready.";
    }

    if (ratio >= 1 && !ready) {
        ready = true;
        clearInterval(timer);
        statusText.textContent = "BamBanking API is ready. Loading demo snapshot…";

        if (AUTO_REDIRECT) {
            setTimeout(() => {
                window.location.href = DEMO_URL;
            }, REDIRECT_DELAY_MS);
        }
    }
}, 1000);

// ========= DEMO DASHBOARD VIA API =========
function formatMoney(value) {
    if (value == null || isNaN(value)) return "0.00";
    return Number(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleString("en-PH", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function renderSnapshot(data) {
    const balance = data.balance ?? data.currentBalance ?? 0;
    const currency = data.currency || "PHP";
    const accountLabel = data.accountLabel || data.accountName || "BamBank • Sandbox User";
    const updatedAt = data.updatedAt || data.snapshotAt || new Date().toISOString();
    const txs = Array.isArray(data.lastTransactions) ? data.lastTransactions : [];

    demoBalanceEl.textContent = formatMoney(balance);
    demoCurrencyEl.textContent = currency;
    demoAccountLabelEl.textContent = accountLabel;
    demoUpdatedAtEl.textContent = "Last updated: " + formatDate(updatedAt);
    demoApiStatusEl.textContent = "Snapshot loaded from BamBanking API.";

    demoTxBodyEl.innerHTML = "";
    if (!txs.length) {
        demoTxBodyEl.innerHTML = '<tr><td colspan="4">No recent transactions.</td></tr>';
        return;
    }

    txs.slice(0, 5).forEach(tx => {
        const tr = document.createElement("tr");
        const status = (tx.status || "OK").toUpperCase();
        const statusClass = status === "OK" || status === "SUCCESS"
            ? "demo-status-ok"
            : "demo-status-failed";

        const when = tx.date || tx.createdAt || tx.timestamp;
        const type = tx.type || tx.kind || "—";
        const amt = tx.amount ?? tx.value ?? 0;

        tr.innerHTML = `
                    <td>${formatDate(when)}</td>
                    <td>${type}</td>
                    <td>${formatMoney(amt)}</td>
                    <td class="${statusClass}">${status}</td>
                `;
        demoTxBodyEl.appendChild(tr);
    });
}

let retryCount = 0;
const MAX_RETRIES = 5;

async function loadDemoSnapshot() {
    try {
        const res = await fetch(API_SUMMARY_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        renderSnapshot(data);
    } catch (err) {
        retryCount++;
        demoApiStatusEl.textContent = "Waiting for API… (retry " + retryCount + "/" + MAX_RETRIES + ")";
        if (retryCount <= MAX_RETRIES) {
            setTimeout(loadDemoSnapshot, 5000);
        } else {
            demoApiStatusEl.textContent = "API snapshot temporarily unavailable.";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadDemoSnapshot();
});




document.addEventListener("DOMContentLoaded", function () {
    const consoleBody = document.getElementById("consoleBody");

    const logLines = [
        {
            accent: "DATABASE SYNC ACTIVE",
            text: " – Accounts & transactions use the live cloud database in real time."
        },
        {
            accent: "DEMO LOGIN ENABLED",
            text: " – Demo account: bamby.dev@gmail.com  |  PIN 1234."
        },
        {
            accent: "SECURE AUTH",
            text: " – JWT login with OTP sent to your Gmail when credentials match."
        },
        {
            accent: "TRANSFERS & HISTORY",
            text: " – Email-to-email transfers plus printable transaction history & dashboard."
        },
        {
            accent: "SIGN-UP FLOW",
            text: " – EmailJS registration auto-creates a demo card with generated CVV."
        }
    ];

    const typingSpeed = 18;   // ms per character
    const linePause = 300;  // ms pause between lines

    function typeLine(lineData, lineIndex) {
        const lineEl = document.createElement("div");
        lineEl.className = "console-line";

        const accentSpan = document.createElement("span");
        accentSpan.className = "accent";
        accentSpan.textContent = lineData.accent;

        const textSpan = document.createElement("span");
        textSpan.className = "console-text";
        textSpan.textContent = "";

        lineEl.appendChild(accentSpan);
        lineEl.appendChild(textSpan);
        consoleBody.appendChild(lineEl);

        let charIndex = 0;

        function typeChar() {
            if (charIndex <= lineData.text.length) {
                textSpan.textContent = lineData.text.slice(0, charIndex);
                charIndex++;
                setTimeout(typeChar, typingSpeed);
            } else {
                // move to next line after short pause
                setTimeout(function () {
                    startTyping(lineIndex + 1);
                }, linePause);
            }
        }

        typeChar();
    }

    function startTyping(index) {
        if (index >= logLines.length) return; // done
        typeLine(logLines[index], index);
    }

    // kick off animation
    startTyping(0);
});