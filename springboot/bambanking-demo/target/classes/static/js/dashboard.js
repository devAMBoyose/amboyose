document.addEventListener("DOMContentLoaded", function () {
    /* ---- FX DEMO (client-side only) ---- */
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

    /* ---- CARD FLIP ---- */
    document.querySelectorAll(".bb-card-flip").forEach(card => {
        card.addEventListener("click", () => {
            card.classList.toggle("is-flipped");
        });
    });
});