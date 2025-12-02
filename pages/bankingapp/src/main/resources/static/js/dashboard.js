// ============================
// BamBanking – Dashboard JS
// ============================

// Quick Actions modal open/close helpers
function openQaModal(action) {
    const modal = document.getElementById("bbQaModal");
    if (!modal) return;

    // Show modal
    modal.classList.add("is-open");

    // Update title
    const titleEl = document.getElementById("bbQaModalTitle");
    if (titleEl) {
        switch (action) {
            case "account":
                titleEl.textContent = "Account information";
                break;
            case "deposit":
                titleEl.textContent = "Deposit";
                break;
            case "withdraw":
                titleEl.textContent = "Withdraw";
                break;
            case "transfer":
                titleEl.textContent = "Transfer";
                break;
            case "fx":
                titleEl.textContent = "Money Changers / FX";
                break;
            default:
                titleEl.textContent = "Quick action";
        }
    }

    // Show the appropriate section
    const sections = modal.querySelectorAll(".bb-modal-section");
    sections.forEach((sec) => {
        const secAction = sec.getAttribute("data-action");
        sec.style.display = secAction === action ? "block" : "none";
    });
}

function closeQaModal() {
    const modal = document.getElementById("bbQaModal");
    if (!modal) return;
    modal.classList.remove("is-open");
}

// Channel selection (Cash / Bank / E-Wallet / Others) for Deposit & Withdraw
document.addEventListener("DOMContentLoaded", function () {
    const channelGroups = document.querySelectorAll(".bb-channel-options");

    channelGroups.forEach((group) => {
        const buttons = group.querySelectorAll(".bb-channel-option");
        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                // Remove is-active from siblings
                buttons.forEach((b) => b.classList.remove("is-active"));
                // Add to clicked
                btn.classList.add("is-active");

                const channel = btn.getAttribute("data-channel");
                const parentForm = btn.closest("form");

                if (parentForm) {
                    const depositHidden = parentForm.querySelector("#depositChannel");
                    const withdrawHidden = parentForm.querySelector("#withdrawChannel");

                    if (depositHidden) {
                        depositHidden.value = channel;
                    }
                    if (withdrawHidden) {
                        withdrawHidden.value = channel;
                    }
                }
            });
        });
    });
});

// ============================
// FX / Money Changers logic
// ============================

const FX_RATES = {
    USD: { PHP: 56.0, EUR: 0.92, JPY: 147.0 },
    EUR: { PHP: 60.5, USD: 1.09, JPY: 159.0 },
    PHP: { USD: 0.018, EUR: 0.016, JPY: 2.62 },
    JPY: { USD: 0.0068, EUR: 0.0063, PHP: 0.38 },
};

/**
 * Convert currency using a simple fixed rate map above.
 * If no direct pair is found, returns null.
 */
function convertFx(amount, from, to) {
    if (from === to) return amount;
    const ratesFrom = FX_RATES[from];
    if (!ratesFrom) return null;
    const rate = ratesFrom[to];
    if (!rate) return null;
    return amount * rate;
}

document.addEventListener("DOMContentLoaded", function () {
    const fxAmountInput = document.getElementById("fxAmount");
    const fxFromSelect = document.getElementById("fxFrom");
    const fxToSelect = document.getElementById("fxTo");
    const fxConvertBtn = document.getElementById("fxConvert");
    const fxResult = document.getElementById("fxResult");
    const fxSwapBtn = document.getElementById("fxSwap");

    if (!fxAmountInput || !fxFromSelect || !fxToSelect || !fxConvertBtn || !fxResult) {
        return; // FX section not present on this page
    }

    function updateFx() {
        const amount = parseFloat(fxAmountInput.value || "0");
        const from = fxFromSelect.value;
        const to = fxToSelect.value;

        if (isNaN(amount) || amount <= 0) {
            fxResult.textContent = "Enter a valid amount.";
            return;
        }

        const converted = convertFx(amount, from, to);
        if (converted == null) {
            fxResult.textContent = `No rate available for ${from} → ${to}.`;
            return;
        }

        const formatted = converted.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        fxResult.textContent = `${amount} ${from} ≈ ${formatted} ${to}`;
    }

    fxConvertBtn.addEventListener("click", updateFx);

    if (fxSwapBtn) {
        fxSwapBtn.addEventListener("click", function () {
            const fromValue = fxFromSelect.value;
            fxFromSelect.value = fxToSelect.value;
            fxToSelect.value = fromValue;
            updateFx();
        });
    }
});

// ============================
// Cursor background follower
// ============================

document.addEventListener("DOMContentLoaded", function () {
    const cursorBg = document.getElementById("cursor-bg");
    if (!cursorBg) return;

    document.addEventListener("mousemove", function (e) {
        const x = e.clientX;
        const y = e.clientY;
        cursorBg.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// ============================
// Recent transactions helpers
// - auto scroll + optional highlight
// ============================

/* ==========================================
   Recent transactions helpers
   - auto-scroll wrapper
   - optional highlight by ?ref=... in URL
   ========================================== */
document.addEventListener("DOMContentLoaded", function () {
    const wrapper = document.querySelector(".bb-transactions-table-wrapper");
    if (wrapper) {
        // scroll so latest rows are visible (bottom)
        wrapper.scrollTop = wrapper.scrollHeight;
    }

    // If a specific reference is passed in the query string (?ref=BB-TRF-123...)
    // highlight the matching row so it's easy to spot.
    const params = new URLSearchParams(window.location.search);
    const highlightRef = params.get("ref");
    if (highlightRef) {
        const rows = document.querySelectorAll(".bb-transactions-table tbody tr");
        rows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 6) {
                const refCell = cells[5]; // DATE, TYPE, METHOD, AMOUNT, BALANCE, REFERENCE, STATUS
                if (refCell.textContent.trim() === highlightRef.trim()) {
                    row.classList.add("bb-tx-latest");
                    row.scrollIntoView({ block: "center", behavior: "smooth" });
                }
            }
        });
    }
});
