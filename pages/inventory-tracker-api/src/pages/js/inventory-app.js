// pages/inventory-tracker-api/src/pages/js/inventory-app.js

document.addEventListener("DOMContentLoaded", () => {
    // ====== CONFIG ======
    const API_BASE = "http://localhost:5000/api";

    // ⚠️ PASTE YOUR JWT TOKEN HERE (from Thunder Client / login response)
    const JWT_TOKEN =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Mjc0OTE0OWRiMTVlMjk2YWQ2YTc0YSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NDE4MjI5MiwiZXhwIjoxNzY0MjY4NjkyfQ.TJBo2pZqkG4CMHHM91CMKUe-t63S-w6EfLQ9bQGvxuE";

    function authHeaders(extra = {}) {
        if (!JWT_TOKEN) {
            throw new Error("No token set – please put your JWT in JWT_TOKEN.");
        }
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_TOKEN}`,
            ...extra,
        };
    }

    // ====== DOM HOOKS (match your HTML IDs) ======
    const itemsTbody = document.getElementById("itemsTableBody");
    const itemsStatusEl = document.getElementById("itemsStatus");
    const itemsErrorEl = document.getElementById("itemsError");

    const consTbody = document.getElementById("consTableBody");
    const consStatusEl = document.getElementById("consStatus");
    const consErrorEl = document.getElementById("consError");

    const consItemSelect = document.getElementById("consItemSelect");
    const consHospitalInput = document.getElementById("consHospital");
    const consDoctorInput = document.getElementById("consDoctor");
    const consQtySentInput = document.getElementById("consQtySent");

    const btnRefreshItems = document.getElementById("btnRefreshItems");
    const btnRefreshCons = document.getElementById("btnRefreshCons");
    const btnCreateCons = document.getElementById("btnCreateCons");

    // ====== HELPERS ======
    function setItemsStatus(text) {
        if (itemsStatusEl) itemsStatusEl.textContent = text || "";
    }
    function setItemsError(text) {
        if (itemsErrorEl) itemsErrorEl.textContent = text || "";
    }
    function setConsStatus(text) {
        if (consStatusEl) consStatusEl.textContent = text || "";
    }
    function setConsError(text) {
        if (consErrorEl) consErrorEl.textContent = text || "";
    }

    function statusPill(status) {
        const s = status || "open";
        let cls = "inv-status-open";
        let label = "Open";

        if (s === "closed") {
            cls = "inv-status-closed";
            label = "Closed";
        } else if (s === "partially_closed") {
            cls = "inv-status-partial";
            label = "Partially used";
        }

        return `<span class="inv-status-pill ${cls}">${label}</span>`;
    }

    // ====== ITEMS ======
    async function loadItems() {
        setItemsStatus("Loading…");
        setItemsError("");

        try {
            const res = await fetch(`${API_BASE}/items`, {
                headers: authHeaders(),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }

            const items = await res.json();

            setItemsStatus("");
            itemsTbody.innerHTML = "";
            consItemSelect.innerHTML = '<option value="">Pick item…</option>';

            items.forEach((item) => {
                // table row
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td>${item.sku}</td>
          <td>${item.name}</td>
          <td>${item.category || "-"}</td>
          <td>${item.quantityOnHand ?? 0}</td>
          <td>${item.location || "-"}</td>
        `;
                itemsTbody.appendChild(tr);

                // dropdown option
                const opt = document.createElement("option");
                opt.value = item._id;
                opt.textContent = `${item.name} (${item.sku})`;
                consItemSelect.appendChild(opt);
            });
        } catch (err) {
            console.error("loadItems error:", err);
            setItemsStatus("Error");
            setItemsError(err.message || "Error loading items");
        }
    }

    // ====== CONSIGNMENTS ======
    async function loadConsignments() {
        setConsStatus("Loading…");
        setConsError("");

        try {
            const res = await fetch(`${API_BASE}/consignments`, {
                headers: authHeaders(),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }

            const list = await res.json();

            setConsStatus("");
            consTbody.innerHTML = "";

            list.forEach((c) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td>${c.item?.name || "-"}</td>
          <td>${c.hospital}</td>
          <td>${c.qtySent}</td>
          <td>${c.qtyUsed}</td>
          <td>${statusPill(c.status)}</td>
        `;
                consTbody.appendChild(tr);
            });
        } catch (err) {
            console.error("loadConsignments error:", err);
            setConsStatus("Error");
            setConsError(err.message || "Error loading consignments");
        }
    }

    // ====== CREATE CONSIGNMENT ======
    async function createConsignment() {
        const itemId = consItemSelect.value;
        const hospital = consHospitalInput.value.trim();
        const doctor = consDoctorInput.value.trim();
        const qtySent = Number(consQtySentInput.value || "0");

        if (!itemId || !hospital || qtySent <= 0) {
            alert("Please pick an item, hospital, and a valid quantity.");
            return;
        }

        const payload = {
            item: itemId,
            hospital,
            doctor: doctor || undefined,
            qtySent,
        };

        try {
            const res = await fetch(`${API_BASE}/consignments`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }

            await res.json();
            consHospitalInput.value = "";
            consDoctorInput.value = "";
            consQtySentInput.value = "";
            await loadConsignments();
        } catch (err) {
            console.error("createConsignment error:", err);
            alert("Failed to create consignment: " + (err.message || "Unknown"));
        }
    }

    // ====== EVENT WIRING ======
    if (btnRefreshItems) btnRefreshItems.addEventListener("click", loadItems);
    if (btnRefreshCons) btnRefreshCons.addEventListener("click", loadConsignments);
    if (btnCreateCons) btnCreateCons.addEventListener("click", createConsignment);

    // initial load
    loadItems();
    loadConsignments();
});
