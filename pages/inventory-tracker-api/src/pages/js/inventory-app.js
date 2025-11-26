// pages/inventory-tracker-api/src/pages/js/inventory-app.js

// ============================
// CONFIG
// ============================

// 🔴 CHANGE THIS if your Render URL is different
const API_BASE = "https://amboyose-inventory-api.onrender.com/api";

// ⚠️ For now we still hard-code a JWT just for the demo.
//    Paste the token you get from login/Thunder Client.
//    In a real app, store this in localStorage or a proper auth flow.
const JWT_TOKEN = "PASTE_YOUR_JWT_TOKEN_HERE";

// Build default headers with Authorization
function authHeaders(extra = {}) {
    if (!JWT_TOKEN) {
        throw new Error("No JWT token set – update JWT_TOKEN in inventory-app.js");
    }
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWT_TOKEN}`,
        ...extra,
    };
}

// ============================
// DOM ELEMENTS
// ============================

const els = {
    // Items
    itemsStatus: document.getElementById("items-status"),
    itemsError: document.getElementById("items-error"),
    itemsTbody: document.getElementById("items-tbody"),
    btnRefreshItems: document.getElementById("btn-refresh-items"),

    // Consignments
    consStatus: document.getElementById("cons-status"),
    consError: document.getElementById("consignments-error"),
    consTbody: document.getElementById("consignments-tbody"),
    btnRefreshCons: document.getElementById("btn-refresh-cons"),
    btnCreateCons: document.getElementById("btn-create-cons"),

    // Consignment form
    selectItem: document.getElementById("consignment-item-select"),
    inputHospital: document.getElementById("consignment-hospital"),
    inputDoctor: document.getElementById("consignment-doctor"),
    inputQty: document.getElementById("consignment-qty"),
};

// ============================
// HELPERS
// ============================

function setStatus(el, text, type = "idle") {
    if (!el) return;
    el.textContent = text;

    el.classList.remove("inv-pill-ok", "inv-pill-loading", "inv-pill-error");

    if (type === "ok") el.classList.add("inv-pill-ok");
    if (type === "loading") el.classList.add("inv-pill-loading");
    if (type === "error") el.classList.add("inv-pill-error");
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

// ============================
// ITEMS
// ============================

async function loadItems() {
    if (!els.itemsError || !els.itemsTbody || !els.selectItem) return;

    setStatus(els.itemsStatus, "Loading…", "loading");
    els.itemsError.textContent = "";
    els.itemsTbody.innerHTML = "";
    els.selectItem.innerHTML = '<option value="">Pick item…</option>';

    try {
        const res = await fetch(`${API_BASE}/items`, {
            headers: authHeaders(),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const items = await res.json();
        setStatus(els.itemsStatus, "OK", "ok");

        if (!Array.isArray(items) || items.length === 0) {
            els.itemsError.textContent = "No items yet. Create items via the API.";
            return;
        }

        items.forEach((item) => {
            // Table row
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${item.sku || "-"}</td>
        <td>${item.name || "-"}</td>
        <td>${item.category || "-"}</td>
        <td>${item.quantityOnHand ?? 0}</td>
        <td>${item.location || "-"}</td>
      `;
            els.itemsTbody.appendChild(tr);

            // Select option for consignment form
            const opt = document.createElement("option");
            opt.value = item._id;
            opt.textContent = `${item.name || "Unnamed"} (${item.sku || "no SKU"})`;
            els.selectItem.appendChild(opt);
        });
    } catch (err) {
        console.error("loadItems error:", err);
        setStatus(els.itemsStatus, "Error", "error");
        els.itemsError.textContent =
            "Error loading items: " + (err.message || "Unknown error");
    }
}

// ============================
// CONSIGNMENTS
// ============================

async function loadConsignments() {
    if (!els.consError || !els.consTbody) return;

    setStatus(els.consStatus, "Loading…", "loading");
    els.consError.textContent = "";
    els.consTbody.innerHTML = "";

    try {
        const res = await fetch(`${API_BASE}/consignments`, {
            headers: authHeaders(),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const list = await res.json();
        setStatus(els.consStatus, "OK", "ok");

        if (!Array.isArray(list) || list.length === 0) {
            els.consError.textContent = "No consignments yet. Create one above.";
            return;
        }

        list.forEach((c) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${c.item?.name || "-"}</td>
        <td>${c.hospital || "-"}</td>
        <td>${c.qtySent ?? 0}</td>
        <td>${c.qtyUsed ?? 0}</td>
        <td>${statusPill(c.status)}</td>
      `;
            els.consTbody.appendChild(tr);
        });
    } catch (err) {
        console.error("loadConsignments error:", err);
        setStatus(els.consStatus, "Error", "error");
        els.consError.textContent =
            "Error loading consignments: " + (err.message || "Unknown error");
    }
}

// Create new consignment
async function createConsignment(evt) {
    if (evt) evt.preventDefault();

    const itemId = els.selectItem.value;
    const hospital = els.inputHospital.value.trim();
    const doctor = els.inputDoctor.value.trim();
    const qty = Number(els.inputQty.value || "0");

    if (!itemId || !hospital || qty <= 0) {
        alert("Please pick an item, hospital, and a valid quantity.");
        return;
    }

    const payload = {
        item: itemId,
        hospital,
        doctor: doctor || undefined,
        qtySent: qty,
    };

    try {
        els.btnCreateCons.disabled = true;
        els.btnCreateCons.textContent = "Creating…";

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

        // reset form (hospital & qty, keep item/doctor if you want)
        els.inputHospital.value = "";
        els.inputQty.value = "";

        await loadConsignments();
    } catch (err) {
        console.error("createConsignment error:", err);
        alert("Failed to create consignment: " + (err.message || "Unknown error"));
    } finally {
        els.btnCreateCons.disabled = false;
        els.btnCreateCons.textContent = "Create Consignment";
    }
}

// ============================
// WIRE EVENTS
// ============================

document.addEventListener("DOMContentLoaded", () => {
    els.btnRefreshItems?.addEventListener("click", loadItems);
    els.btnRefreshCons?.addEventListener("click", loadConsignments);
    els.btnCreateCons?.addEventListener("click", createConsignment);

    // Initial load
    loadItems();
    loadConsignments();
});
