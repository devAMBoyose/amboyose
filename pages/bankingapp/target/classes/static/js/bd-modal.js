/* ======================================================
   BD Modal System — ONE CLEAN, MODULAR ENGINE
   ====================================================== */

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

/* Close modal via <div class="bd-modal-backdrop"> */
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("bd-modal-backdrop")) {
        const parent = e.target.closest(".bd-modal");
        if (parent) parent.style.display = "none";
    }
});

/* Close with ESC */
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        document.querySelectorAll(".bd-modal").forEach(m => m.style.display = "none");
    }
});


// ========== Deposit channel selection (UI only) ==========
document.addEventListener("click", function (e) {
    const btn = e.target.closest(".bb-channel-option");
    if (!btn) return;

    const group = btn.closest(".bb-channel-options");
    if (!group) return;

    group.querySelectorAll(".bb-channel-option").forEach(b =>
        b.classList.remove("is-active")
    );
    btn.classList.add("is-active");
});


// ========== Update modal title based on selected deposit channel (optional) ==========
document.addEventListener("click", function (e) {
    const channelBtn = e.target.closest(".bb-channel-option");
    if (!channelBtn) return;

    const group = channelBtn.closest(".bb-channel-options");
    if (!group) return;

    // toggle active state
    group.querySelectorAll(".bb-channel-option").forEach(btn =>
        btn.classList.remove("is-active")
    );
    channelBtn.classList.add("is-active");

    // update title text e.g. "Deposit – Cash"
    const titleEl = document.getElementById("bbQaModalTitle");
    if (titleEl) {
        const label = channelBtn.querySelector("span")?.textContent?.trim() || "Cash";
        titleEl.textContent = "Deposit – " + label;
    }
});



// Deposit channel selector
document.querySelectorAll('.bb-channel-option').forEach(btn => {
    btn.addEventListener('click', () => {

        const group = btn.closest('.bb-modal-field');
        if (!group) return;

        group.querySelectorAll('.bb-channel-option')
            .forEach(b => b.classList.remove('is-active'));

        btn.classList.add('is-active');

        // update hidden field
        const hidden = document.getElementById('depositChannel');
        if (hidden)
            hidden.value = btn.dataset.channel;

        // update modal header
        const titleEl = document.getElementById('bbQaModalTitle');
        if (titleEl) {
            const text = btn.innerText.trim();
            titleEl.textContent = "Deposit – " + text;
        }
    });
});
