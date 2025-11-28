async function loadDemoLastTransaction() {
    const txEl = document.getElementById("demo-last-tx-amount");
    if (!txEl) return;

    txEl.textContent = "Loading…";

    try {
        const res = await fetch("https://amboyose-bambanking.onrender.com/api/demo-last-transaction");
        if (!res.ok) throw new Error("HTTP " + res.status);

        const data = await res.json();

        const type = data.type || "NONE";
        const amount = Number(data.amount || 0);

        const sign = type === "WITHDRAW" ? "-₱" : "+₱";

        txEl.textContent =
            sign +
            amount.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
    } catch (err) {
        console.error("Failed to load last transaction", err);
        txEl.textContent = "No data";
    }
}

loadDemoLastTransaction();