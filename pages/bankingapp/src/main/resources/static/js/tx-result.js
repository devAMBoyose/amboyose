document.addEventListener("DOMContentLoaded", () => {
    const refEl = document.getElementById("bbTxRef");
    const copyBtn = document.getElementById("bbCopyRef");

    if (refEl && copyBtn && navigator.clipboard) {
        copyBtn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(refEl.textContent.trim());
                copyBtn.classList.add("is-copied");
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                setTimeout(() => {
                    copyBtn.classList.remove("is-copied");
                    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
                }, 1600);
            } catch (e) {
                console.error("Copy failed", e);
            }
        });
    }
});
