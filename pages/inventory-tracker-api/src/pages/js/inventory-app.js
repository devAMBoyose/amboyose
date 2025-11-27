// pages/inventory-tracker-api/src/js/inventory-app.js

// ============================
// CONFIG
// ============================

// Base URL of your Render API (NO /api at the end)
const API_BASE = "https://amboyose-inventory-api.onrender.com";

// Demo credentials (the admin user you already registered)
const DEMO_EMAIL = "bamby@example.com";
const DEMO_PASSWORD = "password123";

// JWT token (loaded/saved to localStorage so it survives refresh)
let authToken = localStorage.getItem("inventory_jwt") || null;

// Build default headers with Authorization when we have a token
function authHeaders(extra = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...extra,
    };

    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    return headers;
}

// Make sure we are logged in (if not, call /api/auth/login)
async function ensureLoggedIn() {
    if (authToken) {
        return;
    }

    try {
        console.log("Logging in to inventory API…");

        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: DEMO_EMAIL,
                password: DEMO_PASSWORD,
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Login failed:", text);
            alert("Inventory demo login failed. Check API logs.");
            return;
        }

        const data = await res.json();
        authToken = data.token;
        localStorage.setItem("inventory_jwt", authToken);

        console.log(
            "✅ Logged in. Token:",
            authToken ? authToken.slice(0, 20) + "…" : "(missing)"
        );
    } catch (err) {
        console.error("Login error:", err);
        alert("Inventory demo login error: " + err.message);
    }
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
// SMALL HELPERS
// ============================

function setStatus(el, text, type = "idle") {
    if (!el) return;

    el.textContent = text;
    el.classList.remove("inv-pill-ok", "inv-pill-loading", "inv-pill-error");

    if (type === "ok") el.classList.add("inv-pill-ok");
    if (type === "loading") el.classList.add("inv-pill-loading");
    if (type === "error") el.classList.add("inv-pill-error");
}

// Derive sensible status if backend didn’t set one
function deriveStatus(c) {
    const sent = c.qtySent ?? 0;
    const used = c.qtyUsed ?? 0;

    if (sent <= 0) return "open";
    if (used <= 0) return "open";
    if (used < sent) return "partially_closed";
    return "closed";
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

    await ensureLoggedIn();

    setStatus(els.itemsStatus, "Loading…", "loading");
    els.itemsError.textContent = "";
    els.itemsTbody.innerHTML = "";
    els.selectItem.innerHTML = '<option value="">Pick item…</option>';

    try {
        const res = await fetch(`${API_BASE}/api/items`, {
            method: "GET",
            headers: authHeaders(),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const items = await res.json();
        setStatus(els.itemsStatus, "OK", "ok");

        if (!Array.isArray(items) || items.length === 0) {
            els.itemsError.textContent =
                "No items yet. Create items via the API or Postman.";
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

    await ensureLoggedIn();

    setStatus(els.consStatus, "Loading…", "loading");
    els.consError.textContent = "";
    els.consTbody.innerHTML = "";

    try {
        const res = await fetch(`${API_BASE}/api/consignments`, {
            method: "GET",
            headers: authHeaders(),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        let list = await res.json();
        if (!Array.isArray(list)) list = [];

        // Newest first if createdAt exists
        list.sort((a, b) => {
            const da = new Date(a.createdAt || 0).getTime();
            const db = new Date(b.createdAt || 0).getTime();
            return db - da;
        });

        setStatus(els.consStatus, "OK", "ok");

        if (list.length === 0) {
            els.consError.textContent =
                "No consignments yet. Create one with the form above.";
            return;
        }

        list.forEach((c) => {
            const sent = c.qtySent ?? 0;
            const used = c.qtyUsed ?? 0;
            const remaining = Math.max(sent - used, 0);
            const effectiveStatus = c.status || deriveStatus(c);

            const tr = document.createElement("tr");

            // Style rows depending on remaining qty / status
            if (effectiveStatus === "closed" || remaining === 0) {
                tr.classList.add("cons-row-closed");
            } else if (remaining > 0 && remaining <= 5) {
                // tweak threshold for "low remaining" here
                tr.classList.add("cons-row-low");
            }

            tr.innerHTML = `
        <td>${c.item?.name || "-"}</td>
        <td>${c.hospital || "-"}</td>
        <td>${sent}</td>
        <td>${used}</td>
        <td>${remaining}</td>
        <td>${statusPill(effectiveStatus)}</td>
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

// Create new consignment from the form
async function createConsignment(evt) {
    if (evt) evt.preventDefault();

    await ensureLoggedIn();

    const itemId = els.selectItem.value;
    const hospital = els.inputHospital.value.trim();
    const doctor = els.inputDoctor.value.trim();
    const qty = Number(els.inputQty.value || "0");

    // friendlier validation
    if (!itemId) {
        alert("Please pick an item.");
        els.selectItem.focus();
        return;
    }
    if (!hospital) {
        alert("Please enter the hospital name.");
        els.inputHospital.focus();
        return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
        alert("Quantity must be greater than 0.");
        els.inputQty.focus();
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

        const res = await fetch(`${API_BASE}/api/consignments`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        await res.json();

        // reset hospital & qty (keep selected item)
        els.inputHospital.value = "";
        els.inputDoctor.value = "";
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
// INIT
// ============================

document.addEventListener("DOMContentLoaded", async () => {
    // Hook up buttons
    els.btnRefreshItems?.addEventListener("click", loadItems);
    els.btnRefreshCons?.addEventListener("click", loadConsignments);
    els.btnCreateCons?.addEventListener("click", createConsignment);

    // First load: login + fetch data
    await ensureLoggedIn();
    await Promise.all([loadItems(), loadConsignments()]);
});
