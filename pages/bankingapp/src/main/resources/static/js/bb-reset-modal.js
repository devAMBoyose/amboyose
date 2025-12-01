document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const successMsg = body.dataset.success;

    if (successMsg) {
        const modal = document.getElementById("bb-error-modal");
        if (!modal) return;

        const titleEl = modal.querySelector(".bank-modal-title");
        const msgEl = modal.querySelector(".bank-modal-message");
        const closeBtn = document.getElementById("bb-error-ok");

        if (titleEl) titleEl.textContent = "Success";
        if (msgEl) msgEl.textContent = successMsg;

        modal.classList.add("show");

        function closeModal() {
            modal.classList.remove("show");
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", closeModal);
        }

        // click outside closes
        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // ESC closes
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                closeModal();
            }
        });
    }
});