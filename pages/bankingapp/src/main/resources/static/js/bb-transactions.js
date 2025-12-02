// =====================================
// BamBanking – Recent Transactions JS
// - filters (All / Deposit / Withdraw / Transfer / Failed)
// - highlight specific row when opened with ?ref=...
// - smooth scroll to the highlighted row
// - category based on REFERENCE prefix (BB-DEP, BB-WDL, etc.)
// =====================================
(function () {
    const table = document.querySelector(".bb-transactions-table");
    if (!table) return;

    const filterButtons = document.querySelectorAll(".bb-tx-filter");
    const rows = table.querySelectorAll("tbody tr[data-type]");

    function categoryFromRef(refRaw) {
        const ref = (refRaw || "").toUpperCase();

        if (ref.startsWith("BB-DEP")) return "deposit";
        if (ref.startsWith("BB-WDL")) return "withdraw";
        if (ref.startsWith("BB-TRF")) return "transfer";
        if (ref.startsWith("BB-A")) return "account";
        if (ref.startsWith("BB-AB")) return "autodebit";
        if (ref.startsWith("BB-PW")) return "ewallet";
        if (ref.startsWith("BB-MC")) return "moneychanger";
        if (ref.startsWith("BB-OTHERS")) return "others";
        return "other";
    }

    function applyFilter(filter) {
        const f = (filter || "all").toLowerCase();

        rows.forEach(row => {
            const ref = row.dataset.ref || "";
            const status = (row.dataset.status || "").toUpperCase();
            const cat = categoryFromRef(ref); // deposit / withdraw / transfer / ...

            let show = true;

            switch (f) {
                case "deposit":
                    show = (cat === "deposit");
                    break;
                case "withdraw":
                    show = (cat === "withdraw");
                    break;
                case "transfer":
                    show = (cat === "transfer");
                    break;
                case "failed":
                    // anything that is NOT OK is treated as failed
                    show = status && status !== "OK";
                    break;
                default:
                    show = true; // all
            }

            row.style.display = show ? "" : "none";
        });
    }

    // Wire up filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("is-active"));
            btn.classList.add("is-active");
            applyFilter(btn.dataset.filter || "all");
        });
    });

    // Default: show all
    applyFilter("all");

    // -------------------------------------
    // Highlight row when coming from receipt
    // URL format: /bambanking/dashboard?ref=BB-TRF-123...
    // -------------------------------------
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    if (refParam) {
        let targetRow = null;
        const refLower = refParam.toLowerCase();

        rows.forEach(row => {
            const rowRef = (row.dataset.ref || "").toLowerCase();
            if (rowRef === refLower) {
                targetRow = row;
            }
        });

        if (targetRow) {
            targetRow.classList.add("bb-tx-latest");

            const wrapper = document.querySelector(".bb-transactions-table-wrapper");
            if (wrapper) {
                const offset = targetRow.offsetTop - wrapper.clientHeight / 2;
                wrapper.scrollTop = offset < 0 ? 0 : offset;
            } else {
                targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }
})();


// =====================================
// PRINT: Recent Transactions Table Only
// =====================================
function bbPrintRecentTransactions() {

    // get only the table + header
    const tableWrapper = document.querySelector(".bb-transactions-table-wrapper");
    if (!tableWrapper) return;

    const tableHTML = tableWrapper.innerHTML;

    // build print page
    const printWindow = window.open("", "_blank", "width=900,height=650");
    printWindow.document.open();
    printWindow.document.write(`
        <html>
        <head>
            <title>Recent Transactions</title>
            <style>
                body {
                    font-family: "JetBrains Mono", monospace;
                    padding: 20px;
                    background: #fff;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                }
                th, td {
                    border: 1px solid #333;
                    padding: 6px;
                    text-align: left;
                }
                th {
                    background: #e2e8f0;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h2>Recent Transactions</h2>
            <table>
                ${tableHTML}
            </table>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
        printWindow.print();
    };
}
