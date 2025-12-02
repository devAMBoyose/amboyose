/* ======================================================
   BD Modal System — ONE CLEAN, MODULAR ENGINE
   ====================================================== */

/* Basic open / close helpers (for any bd-modal) */
function bdOpen(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = "flex";
}

function bdClose(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = "none";
}

/* Close when clicking backdrop */
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("bd-modal-backdrop")) {
        const parent = e.target.closest(".bd-modal");
        if (parent) parent.style.display = "none";
    }
});

/* Close all bd-modals with ESC */
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        document.querySelectorAll(".bd-modal").forEach(m => {
            m.style.display = "none";
        });
    }
});


/* ======================================================
   CHANNEL PILLS (Cash / Bank / E-Wallet / Others)
   Shared by: Deposit + Withdraw
   ======================================================

Expected HTML in each form:

<div class="bb-modal-field">
    <label>DEPOSIT FROM</label>

    <div class="bb-channel-options">
        <button type="button" class="bb-channel-option is-active" data-channel="CASH">
            <i class="fa-solid fa-money-bill-wave"></i>
            <span>Cash</span>
        </button>
        ...
    </div>

    <input type="hidden" name="channel" value="CASH">
</div>
*/

document.addEventListener("click", function (e) {
    const btn = e.target.closest(".bb-channel-option");
    if (!btn) return;

    const group = btn.closest(".bb-modal-field");
    if (!group) return;

    // Toggle active pill in THIS group only
    group.querySelectorAll(".bb-channel-option").forEach(el =>
        el.classList.remove("is-active")
    );
    btn.classList.add("is-active");

    // Update hidden channel field inside this group
    const hidden = group.querySelector('input[type="hidden"][name="channel"]');
    if (hidden) {
        hidden.value = btn.dataset.channel || "";
    }

    // Update modal title: "Deposit – Cash", "Withdraw – E-Wallet", etc.
    const titleEl = document.getElementById("bbQaModalTitle");
    if (titleEl) {
        const label =
            btn.querySelector("span")?.textContent?.trim() || btn.textContent.trim();

        // Cache the verb once (Deposit / Withdraw / Transfer)
        if (!titleEl.dataset.verb) {
            const current = titleEl.textContent.trim();   // e.g. "Deposit Cash"
            const parts = current.split(/\s+/);
            titleEl.dataset.verb = parts[0] || "Action";
        }

        const verb = titleEl.dataset.verb;
        titleEl.textContent = `${verb} – ${label}`;
    }
});


