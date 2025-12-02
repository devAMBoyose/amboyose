// ============================
// BamBanking – Tx Filters
// ============================
(function () {
    const filterButtons = document.querySelectorAll(".bb-tx-filter");
    const rows = document.querySelectorAll(".bb-transactions-table tbody tr[data-type]");

    if (!filterButtons.length || !rows.length) return;

    function applyFilter(filter) {
        const f = filter.toLowerCase();

        rows.forEach(row => {
            const type = (row.dataset.type || "").toLowerCase();
            const status = (row.dataset.status || "").toLowerCase();

            let show = true;

            switch (f) {
                case "deposit":
                    show = type.includes("deposit");
                    break;
                case "withdraw":
                    show = type.includes("withdraw");
                    break;
                case "transfer":
                    show = type.includes("transfer");
                    break;
                case "failed":
                    show = status !== "ok";
                    break;
                default:
                    show = true; // all
            }

            row.style.display = show ? "" : "none";
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("is-active"));
            btn.classList.add("is-active");
            applyFilter(btn.dataset.filter || "all");
        });
    });

    // default: ALL
    applyFilter("all");
})();
