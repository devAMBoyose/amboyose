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

// In-memory cache so we can drive expiry / billing / logs
let cachedItems = [];
let cachedConsignments = [];
let activityLog = [];

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

// ============================
// AUTH
// ============================

// Make sure we are logged in (if not, call /api/auth/login)
async function ensureLoggedIn() {
    if (authToken) {
        return;
    }

    try {
        console.log("Logging in to inventory API…");

        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
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

        logActivity("auth", "Demo auto-login successful.");
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

    // Expiry & Restock
    expiryTbody: document.getElementById("expiry-tbody"),
    expiryEmpty: document.getElementById("expiry-empty"),
    restockTbody: document.getElementById("restock-tbody"),
    restockEmpty: document.getElementById("restock-empty"),
    alertsStatus: document.getElementById("alerts-status"),

    // Hospital balance
    hospitalTbody: document.getElementById("hospital-balance-tbody"),
    hospitalEmpty: document.getElementById("hospital-balance-empty"),
    billingStatus: document.getElementById("billing-status"),

    // Activity + print
    activityList: document.getElementById("activity-list"),
    btnPrintReport: document.getElementById("btn-print-report"),
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

// Simple date helper for expiry (expects ISO string in item.expiryDate)
function daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    if (Number.isNaN(target.getTime())) return null;

    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function formatDateShort(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toISOString().slice(0, 10);
}

// Activity log
function logActivity(type, message, meta = {}) {
    const entry = {
        id: Date.now() + "-" + Math.random().toString(16).slice(2),
        ts: new Date(),
        type,
        message,
        meta,
    };
    activityLog.unshift(entry); // newest on top
    if (activityLog.length > 50) activityLog.pop();

    renderActivityLog();
}

function renderActivityLog() {
    if (!els.activityList) return;
    els.activityList.innerHTML = "";

    if (activityLog.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No activity yet. Actions will appear here.";
        els.activityList.appendChild(li);
        return;
    }

    for (const entry of activityLog) {
        const li = document.createElement("li");
        const timeStr = entry.ts.toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        li.innerHTML = `
      <div>${entry.message}</div>
      <div class="activity-meta">${timeStr} • ${entry.type}</div>
    `;
        els.activityList.appendChild(li);
    }
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
    els.selectItem.innerHTML = `<option value="">Pick item…</option>`;

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
        cachedItems = Array.isArray(items) ? items : [];

        setStatus(els.itemsStatus, "OK", "ok");
        logActivity("api", `Loaded ${cachedItems.length} items.`);

        if (cachedItems.length === 0) {
            els.itemsError.textContent =
                "No items yet. Create items via the API or Postman.";
            recomputeAlertsFromItems();
            return;
        }

        cachedItems.forEach((item) => {
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

        // drive expiry + restock based on items
        recomputeAlertsFromItems();
    } catch (err) {
        console.error("loadItems error:", err);
        setStatus(els.itemsStatus, "Error", "error");
        els.itemsError.textContent =
            "Error loading items: " + (err.message || "Unknown error");
        logActivity("error", "Failed to load items.");
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

        // Newest first
        list.sort((a, b) => {
            const da = new Date(a.createdAt || 0).getTime();
            const db = new Date(b.createdAt || 0).getTime();
            return db - da;
        });

        cachedConsignments = list;

        setStatus(els.consStatus, "OK", "ok");
        logActivity("api", `Loaded ${cachedConsignments.length} consignments.`);

        if (list.length === 0) {
            els.consError.textContent =
                "No consignments yet. Create one with the form above.";
            recomputeHospitalBalance();
            return;
        }

        list.forEach((c) => {
            const sent = c.qtySent ?? 0;
            const used = c.qtyUsed ?? 0;
            const remaining = Math.max(sent - used, 0);
            const effectiveStatus = c.status || deriveStatus(c);

            const tr = document.createElement("tr");
            tr.dataset.id = c._id || ""; // needed for editable usage

            // Style rows depending on remaining qty / status
            if (effectiveStatus === "closed" || remaining === 0) {
                tr.classList.add("cons-row-closed");
            } else if (remaining > 0 && remaining <= 5) {
                tr.classList.add("cons-row-low");
            }

            tr.innerHTML = `
        <td>${c.item?.name || "-"}</td>
        <td>${c.hospital || "-"}</td>
        <td>${sent}</td>
        <td>${used}</td>
        <td>${remaining}</td>
        <td>${statusPill(effectiveStatus)}</td>
        <td>
          <button class="btn-mini" data-action="edit-usage">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
        </td>
      `;

            els.consTbody.appendChild(tr);
        });

        // drive hospital billing snapshot
        recomputeHospitalBalance();
    } catch (err) {
        console.error("loadConsignments error:", err);
        setStatus(els.consStatus, "Error", "error");
        els.consError.textContent =
            "Error loading consignments: " + (err.message || "Unknown error");
        logActivity("error", "Failed to load consignments.");
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

        logActivity(
            "consignment",
            `Created consignment for ${hospital} (qty ${qty}).`
        );

        await loadConsignments();
    } catch (err) {
        console.error("createConsignment error:", err);
        alert(
            "Failed to create consignment: " + (err.message || "Unknown error")
        );
        logActivity("error", "Failed to create consignment.");
    } finally {
        els.btnCreateCons.disabled = false;
        els.btnCreateCons.textContent = "Create Consignment";
    }
}

// ============================
// EDITABLE CONSIGNMENT USAGE
// ============================

async function updateConsignmentUsage(consignmentId, qtyUsed) {
    await ensureLoggedIn();

    try {
        const res = await fetch(
            `${API_BASE}/api/consignments/${consignmentId}/usage`,
            {
                method: "PATCH",
                headers: authHeaders(),
                body: JSON.stringify({ qtyUsed }),
            }
        );

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        await res.json();
        logActivity("usage", `Updated consignment usage to ${qtyUsed}.`, {
            consignmentId,
        });

        await loadConsignments();
    } catch (err) {
        console.error("updateConsignmentUsage error:", err);
        alert(
            "Failed to update consignment usage: " +
            (err.message || "Unknown error")
        );
        logActivity("error", "Failed to update consignment usage.");
    }
}

// Event delegation for "Edit usage" buttons
function handleConsTableClick(e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    if (action !== "edit-usage") return;

    const tr = btn.closest("tr");
    const consignmentId = tr?.dataset.id;
    if (!consignmentId) return;

    const sent = Number(tr.children[2]?.textContent || "0");
    const usedCurrent = Number(tr.children[3]?.textContent || "0");

    const input = prompt(
        `Enter total USED units (0–${sent}):`,
        String(usedCurrent)
    );
    if (input === null) return; // cancelled

    const newUsed = Number(input);
    if (!Number.isFinite(newUsed) || newUsed < 0 || newUsed > sent) {
        alert(`Used qty must be between 0 and ${sent}.`);
        return;
    }

    updateConsignmentUsage(consignmentId, newUsed);
}

// ============================
// EXPIRY + RESTOCK ALERTS
// ============================

function recomputeAlertsFromItems() {
    if (!els.expiryTbody || !els.restockTbody) return;

    els.expiryTbody.innerHTML = "";
    els.restockTbody.innerHTML = "";
    els.expiryEmpty.textContent = "";
    els.restockEmpty.textContent = "";

    // Demo: treat item.expiryDate (if exists) and item.minStock (if exists).
    const withExpiry = cachedItems
        .map((item) => {
            const days = daysUntil(item.expiryDate);
            return { item, days };
        })
        .filter((x) => x.days !== null && x.days <= 60); // <= 60 days left

    withExpiry.sort((a, b) => (a.days ?? 0) - (b.days ?? 0));

    if (withExpiry.length === 0) {
        els.expiryEmpty.textContent =
            "No expiry alerts. Add expiryDate to items to populate this view.";
    } else {
        withExpiry.forEach(({ item, days }) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${item.name || "-"}</td>
        <td>${formatDateShort(item.expiryDate)}</td>
        <td>${days}</td>
      `;
            els.expiryTbody.appendChild(tr);
        });
    }

    const lowStock = cachedItems.filter((item) => {
        const qty = item.quantityOnHand ?? 0;
        const min = item.minStock ?? 5; // demo threshold
        return qty > 0 && qty <= min;
    });

    if (lowStock.length === 0) {
        els.restockEmpty.textContent =
            "No restock alerts. Use minStock in your API if you want per-item thresholds.";
    } else {
        lowStock.forEach((item) => {
            const qty = item.quantityOnHand ?? 0;
            const min = item.minStock ?? 5;
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${item.name || "-"}</td>
        <td>${qty}</td>
        <td>${min}</td>
      `;
            els.restockTbody.appendChild(tr);
        });
    }

    if (els.alertsStatus) {
        const hasAlerts = withExpiry.length > 0 || lowStock.length > 0;
        setStatus(
            els.alertsStatus,
            hasAlerts ? "Alerts active" : "No alerts",
            hasAlerts ? "ok" : "idle"
        );
    }
}

// ============================
// HOSPITAL BALANCE SNAPSHOT
// ============================

function recomputeHospitalBalance() {
    if (!els.hospitalTbody) return;

    els.hospitalTbody.innerHTML = "";
    els.hospitalEmpty.textContent = "";

    if (!cachedConsignments.length) {
        els.hospitalEmpty.textContent =
            "No consignments yet. Create some to see billing snapshot.";
        return;
    }

    // Group by hospital
    const byHospital = new Map();

    cachedConsignments.forEach((c) => {
        const hospital = c.hospital || "Unknown hospital";
        const used = c.qtyUsed ?? 0;

        // Demo pricing:
        // - Try c.billingRate or c.unitPrice if present, else assume 7,500 per unit.
        const rate = c.billingRate ?? c.unitPrice ?? 7500;
        const estBill = used * rate;

        if (!byHospital.has(hospital)) {
            byHospital.set(hospital, {
                hospital,
                cases: 0,
                unitsUsed: 0,
                estBill: 0,
            });
        }

        const agg = byHospital.get(hospital);
        agg.cases += 1;
        agg.unitsUsed += used;
        agg.estBill += estBill;
    });

    const rows = Array.from(byHospital.values());
    rows.sort((a, b) => b.estBill - a.estBill);

    rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${row.hospital}</td>
      <td>${row.cases}</td>
      <td>${row.unitsUsed}</td>
      <td>${row.estBill.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}</td>
    `;
        els.hospitalTbody.appendChild(tr);
    });

    if (els.billingStatus) {
        setStatus(els.billingStatus, "Snapshot", "ok");
    }
}

// ============================
// PRINT / PDF
// ============================

function handlePrintReport() {
    logActivity("report", "Triggered print / save as PDF.");
    window.print(); // user can choose "Save as PDF"
}

// ============================
// INIT
// ============================

// ============================
// INIT
// ============================

document.addEventListener("DOMContentLoaded", async () => {
    // Hook up buttons
    els.btnRefreshItems?.addEventListener("click", loadItems);
    els.btnRefreshCons?.addEventListener("click", loadConsignments);
    els.btnCreateCons?.addEventListener("click", createConsignment);
    els.consTbody?.addEventListener("click", handleConsTableClick);
    els.btnPrintReport?.addEventListener("click", handlePrintReport);

    // If the cold-start modal helper exists, show it right away
    if (window.InventoryColdStartModal && typeof window.InventoryColdStartModal.show === "function") {
        window.InventoryColdStartModal.show();
    }

    try {
        // First load: login + fetch data
        await ensureLoggedIn();
        await Promise.all([loadItems(), loadConsignments()]);
        renderActivityLog();

        // ✅ Both status pills are now "OK" (or error handled inside).
        // If all went fine, play "server warmed up" animation + auto-close.
        if (window.InventoryColdStartModal && typeof window.InventoryColdStartModal.ready === "function") {
            window.InventoryColdStartModal.ready();
        }
    } catch (err) {
        console.error("Error during initial inventory load:", err);

        // On error we just hide the modal (no green success animation)
        if (window.InventoryColdStartModal && typeof window.InventoryColdStartModal.hide === "function") {
            window.InventoryColdStartModal.hide();
        }
    }
});



// document.addEventListener("DOMContentLoaded", async () => {
// Hook up buttons
// els.btnRefreshItems?.addEventListener("click", loadItems);
// els.btnRefreshCons?.addEventListener("click", loadConsignments);
// els.btnCreateCons?.addEventListener("click", createConsignment);
// els.consTbody?.addEventListener("click", handleConsTableClick);
// els.btnPrintReport?.addEventListener("click", handlePrintReport);

// First load: login + fetch data
//     await ensureLoggedIn();
//     await Promise.all([loadItems(), loadConsignments()]);
//     renderActivityLog();
// });
