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

// chart + toggle
const chartCanvas = document.getElementById("cashFlowChart");
const txToggleBtn = document.getElementById("txToggleBtn");

// ========= STATE =========
let cashFlowChart = null;
let allTransactions = [];
let showAllTx = false;

// set link href
if (openDemoBtn) {
    openDemoBtn.href = DEMO_URL;
}

// toggle extra info text
if (keepReadingBtn && extraInfo) {
    keepReadingBtn.addEventListener("click", () => {
        extraInfo.style.display = extraInfo.style.display === "none" ? "block" : "none";
    });
}

// show 5 vs all transactions
if (txToggleBtn) {
    txToggleBtn.addEventListener("click", () => {
        showAllTx = !showAllTx;
        renderTransactions();
    });
}

// ========= COUNTDOWN / PROGRESS =========
let elapsed = 0;
let ready = false;

const timer = setInterval(() => {
    elapsed++;
    const ratio = Math.min(elapsed / TOTAL_SECONDS, 1);
    const percent = Math.round(ratio * 100);

    if (progressFill) progressFill.style.width = percent + "%";
    if (progressPercent) progressPercent.textContent = percent + "%";

    const secondsLeft = Math.max(TOTAL_SECONDS - elapsed, 0);
    if (countdownLabel) {
        countdownLabel.textContent =
            secondsLeft > 0 ? `approx ${secondsLeft}s remaining` : "service should be ready";
    }

    if (statusText) {
        if (percent < 30) {
            statusText.textContent = "Allocating resources on Render…";
        } else if (percent < 60) {
            statusText.textContent = "Booting Spring Boot application…";
        } else if (percent < 90) {
            statusText.textContent = "Connecting to database & loading dashboard…";
        } else {
            statusText.textContent = "BamBanking API is almost ready.";
        }
    }

    if (ratio >= 1 && !ready) {
        ready = true;
        clearInterval(timer);
        if (statusText) {
            statusText.textContent = "BamBanking API is ready. Loading demo snapshot…";
        }

        if (AUTO_REDIRECT) {
            setTimeout(() => {
                window.location.href = DEMO_URL;
            }, REDIRECT_DELAY_MS);
        }
    }
}, 1000);

// ========= HELPERS =========
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

// ========= PIE / DONUT CHART (DEPOSIT / TRANSFER / WITHDRAW) =========
function updateCashFlowChart(transactions) {
    if (!chartCanvas || !window.Chart) return;

    let totalDeposit = 0;
    let totalTransfer = 0;
    let totalWithdraw = 0;

    transactions.forEach((tx) => {
        const typeRaw = (tx.type || tx.kind || "").toString().toLowerCase();
        const amount = Number(tx.amount ?? tx.value ?? 0) || 0;

        if (typeRaw.includes("deposit")) {
            totalDeposit += amount;
        } else if (
            typeRaw.includes("withdraw") ||
            typeRaw.includes("cash out") ||
            typeRaw.includes("cash_out")
        ) {
            totalWithdraw += amount;
        } else if (typeRaw.includes("transfer")) {
            totalTransfer += amount;
        }
    });

    // If no data at all, keep donut visible with equal parts
    if (totalDeposit === 0 && totalTransfer === 0 && totalWithdraw === 0) {
        totalDeposit = totalTransfer = totalWithdraw = 1;
    }

    if (cashFlowChart) {
        cashFlowChart.destroy();
    }

    cashFlowChart = new Chart(chartCanvas, {
        type: "doughnut",
        data: {
            labels: ["Deposit", "Transfer", "Withdraw"],
            datasets: [
                {
                    data: [totalDeposit, totalTransfer, totalWithdraw],
                    // Deposit = green, Transfer = pink, Withdraw = blue (matches badges)
                    backgroundColor: ["#22c55e", "#ec4899", "#3b82f6"],
                    borderWidth: 0,
                    hoverOffset: 10
                }
            ]
        },
        options: {
            cutout: "55%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#e5e7eb",
                        boxWidth: 16,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const label = ctx.label || "";
                            const value = ctx.parsed || 0;
                            return `${label}: ₱${formatMoney(value)}`;
                        }
                    }
                }
            }
        }
    });
}

// ========= TRANSACTIONS TABLE (5 vs ALL) =========
function renderTransactions() {
    if (!demoTxBodyEl) return;

    demoTxBodyEl.innerHTML = "";

    if (!allTransactions.length) {
        demoTxBodyEl.innerHTML = '<tr><td colspan="4">No recent transactions.</td></tr>';
        if (txToggleBtn) {
            txToggleBtn.textContent = "Show latest 5";
            txToggleBtn.disabled = true;
        }
        return;
    }

    const txsToShow = showAllTx ? allTransactions : allTransactions.slice(0, 5);

    if (txToggleBtn) {
        if (showAllTx) {
            txToggleBtn.textContent = "Show latest 5";
        } else {
            txToggleBtn.textContent = `Show all (${allTransactions.length})`;
        }
        txToggleBtn.disabled = allTransactions.length <= 5;
    }

    txsToShow.forEach((tx) => {
        const tr = document.createElement("tr");
        const status = (tx.status || "OK").toUpperCase();
        const statusClass =
            status === "OK" || status === "SUCCESS" ? "demo-status-ok" : "demo-status-failed";

        const when = tx.date || tx.createdAt || tx.timestamp;
        const typeRaw = tx.type || tx.kind || "—";
        const amt = tx.amount ?? tx.value ?? 0;

        // badge logic
        const lower = typeRaw.toLowerCase();
        let badgeClass = "tx-badge--other";
        let badgeLabel = typeRaw;
        let detailText = "";

        if (lower.includes("deposit")) {
            badgeClass = "tx-badge--deposit";
            badgeLabel = "Deposit";
            detailText = typeRaw.replace(/deposit/i, "").trim();
        } else if (lower.includes("withdraw")) {
            badgeClass = "tx-badge--withdraw";
            badgeLabel = "Withdraw";
            detailText = typeRaw.replace(/withdraw/i, "").trim();
        } else if (lower.includes("transfer")) {
            badgeClass = "tx-badge--transfer";
            badgeLabel = "Transfer";
            detailText = typeRaw.replace(/transfer/i, "").trim();
        }

        const typeCellHtml = `
      <div class="tx-type-cell">
        <span class="tx-badge ${badgeClass}">${badgeLabel}</span>
        ${detailText ? `<span class="tx-detail">${detailText}</span>` : ""}
      </div>
    `;

        tr.innerHTML = `
      <td>${formatDate(when)}</td>
      <td>${typeCellHtml}</td>
      <td>₱${formatMoney(amt)}</td>
      <td class="${statusClass}">${status}</td>
    `;
        demoTxBodyEl.appendChild(tr);
    });
}

// ========= SNAPSHOT RENDER (called after API) =========
function renderSnapshot(data) {
    const balance = data.balance ?? data.currentBalance ?? 0;
    const currency = data.currency || "PHP";
    const accountLabel = data.accountLabel || data.accountName || "BamBank • Sandbox User";
    const updatedAt = data.updatedAt || data.snapshotAt || new Date().toISOString();
    const txs = Array.isArray(data.lastTransactions) ? data.lastTransactions : [];

    // store everything from API
    allTransactions = txs;

    if (demoBalanceEl) demoBalanceEl.textContent = formatMoney(balance);
    if (demoCurrencyEl) demoCurrencyEl.textContent = currency;
    if (demoAccountLabelEl) demoAccountLabelEl.textContent = accountLabel;
    if (demoUpdatedAtEl) demoUpdatedAtEl.textContent = "Last updated: " + formatDate(updatedAt);
    if (demoApiStatusEl) demoApiStatusEl.textContent = "Snapshot loaded from BamBanking API.";

    // render table and chart
    renderTransactions();
    updateCashFlowChart(allTransactions);
}

// ========= API CALL =========
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
        if (demoApiStatusEl) {
            demoApiStatusEl.textContent =
                "Waiting for API… (retry " + retryCount + "/" + MAX_RETRIES + ")";
        }
        if (retryCount <= MAX_RETRIES) {
            setTimeout(loadDemoSnapshot, 5000);
        } else if (demoApiStatusEl) {
            demoApiStatusEl.textContent = "API snapshot temporarily unavailable.";
        }
    }
}

// ========= CONSOLE TYPING EFFECT =========
function initConsoleTyping() {
    const consoleBody = document.getElementById("consoleBody");
    if (!consoleBody) return;

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

    const typingSpeed = 18;
    const linePause = 300;

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
                setTimeout(() => startTyping(lineIndex + 1), linePause);
            }
        }

        typeChar();
    }

    function startTyping(index) {
        if (index >= logLines.length) return;
        typeLine(logLines[index], index);
    }

    startTyping(0);
}

// ========= INIT =========
document.addEventListener("DOMContentLoaded", () => {
    loadDemoSnapshot();
    initConsoleTyping();
});
