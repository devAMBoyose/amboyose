// src/main/resources/static/js/fx-converter.js

// === Cursor-follow glow (match style.css) ===
document.addEventListener("DOMContentLoaded", () => {
    const cursorBg = document.getElementById("cursor-bg");
    if (cursorBg) {
        window.addEventListener("pointermove", (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;

            cursorBg.style.setProperty("--cx", `${x}%`);
            cursorBg.style.setProperty("--cy", `${y}%`);
        });
    }

    // Converter elements
    const amountEl = document.getElementById("amount");
    const fromEl = document.getElementById("from");
    const toEl = document.getElementById("to");
    const swapBtn = document.getElementById("swap");
    const convertBtn = document.getElementById("convertBtn");
    const resultEl = document.getElementById("result");

    // swap currencies
    swapBtn.addEventListener("click", () => {
        const tmp = fromEl.value;
        fromEl.value = toEl.value;
        toEl.value = tmp;
    });

    // call backend
    convertBtn.addEventListener("click", async () => {
        const amount = parseFloat(amountEl.value || "0");
        const from = fromEl.value;
        const to = toEl.value;

        if (isNaN(amount) || amount <= 0) {
            resultEl.textContent = "Please enter a valid amount.";
            return;
        }

        try {
            const res = await fetch(
                `/api/fx/convert?from=${from}&to=${to}&amount=${amount}`
            );
            if (!res.ok) {
                throw new Error("Network error");
            }

            const data = await res.json();
            const converted = Number(data.converted).toFixed(4);
            resultEl.textContent = `${data.amount} ${data.from} = ${converted} ${data.to}`;
        } catch (err) {
            console.error(err);
            resultEl.textContent = "⚠ Unable to fetch FX rate. Please try again.";
        }
    });
});
