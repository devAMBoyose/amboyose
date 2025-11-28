/* ===========================
   FX DEMO (client-side only)
   =========================== */
document.addEventListener("DOMContentLoaded", function () {
    const fxAmount = document.getElementById("fxAmount");
    const fxFrom = document.getElementById("fxFrom");
    const fxTo = document.getElementById("fxTo");
    const fxConvert = document.getElementById("fxConvert");
    const fxSwap = document.getElementById("fxSwap");
    const fxResult = document.getElementById("fxResult");

    const base = {
        USD: 1,
        EUR: 0.93,
        PHP: 57,
        JPY: 155
    };

    function convertFx() {
        const amount = parseFloat(fxAmount.value || "0");
        const from = fxFrom.value;
        const to = fxTo.value;
        if (!base[from] || !base[to] || isNaN(amount)) return;

        const rate = base[to] / base[from];
        const converted = amount * rate;
        fxResult.textContent =
            amount.toFixed(2) + " " + from + " ≈ " + converted.toFixed(2) + " " + to;
    }

    if (fxConvert && fxAmount && fxFrom && fxTo && fxResult) {
        fxConvert.addEventListener("click", convertFx);
        fxAmount.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                convertFx();
            }
        });
    }

    if (fxSwap && fxFrom && fxTo) {
        fxSwap.addEventListener("click", () => {
            const tmp = fxFrom.value;
            fxFrom.value = fxTo.value;
            fxTo.value = tmp;
            convertFx();
        });
    }

    /* ===========================
       CARD FLIP
       =========================== */
    document.querySelectorAll(".bb-card-flip").forEach(card => {
        card.addEventListener("click", () => {
            card.classList.toggle("is-flipped");
        });
    });
});

/* ===========================
   QUICK ACTIONS MODAL (global)
   =========================== */

function openQaModal(actionKey) {
    const modal = document.getElementById("bbQaModal");
    if (!modal) return;

    const sections = modal.querySelectorAll(".bb-modal-section");
    const titleEl = document.getElementById("bbQaModalTitle");

    const titles = {
        account: "Account info",
        deposit: "Deposit Cash",
        withdraw: "Withdraw Cash",
        transfer: "Transfer Funds",
        info: "Quick action"
    };

    sections.forEach(sec => {
        if (sec.dataset.action === actionKey) {
            sec.style.display = "block";
        } else {
            sec.style.display = "none";
        }
    });

    if (titleEl) {
        titleEl.textContent = titles[actionKey] || "Quick action";
    }

    // show modal
    modal.style.display = "flex";
}

function closeQaModal() {
    const modal = document.getElementById("bbQaModal");
    if (!modal) return;

    modal.style.display = "none";

    // (optional) clear text/number fields
    modal.querySelectorAll("input").forEach(input => {
        if (input.type === "text" || input.type === "number") {
            input.value = "";
        }
    });
}

// ESC key closes modal
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeQaModal();
    }
});
