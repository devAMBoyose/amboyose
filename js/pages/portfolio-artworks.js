const filters = document.querySelectorAll(".apw-filter");
const cards = document.querySelectorAll(".apw-card");

filters.forEach((btn) => {
    btn.addEventListener("click", () => {
        filters.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const filter = btn.dataset.filter;

        cards.forEach((card) => {
            const match = filter === "all" || card.dataset.cat === filter;
            card.classList.toggle("-hide", !match);
        });
    });
});
