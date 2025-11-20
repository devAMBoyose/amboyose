// Flip between Login and Sign up on the auth card

(function () {
    const tabs = document.querySelectorAll(".auth-tabs__btn");
    const card = document.getElementById("authCard");

    if (!tabs.length || !card) return;

    function setView(view) {
        tabs.forEach(btn => {
            btn.classList.toggle("is-active", btn.dataset.view === view);
        });

        if (view === "signup") {
            card.classList.add("is-flipped");
        } else {
            card.classList.remove("is-flipped");
        }
    }

    tabs.forEach(btn => {
        btn.addEventListener("click", () => {
            setView(btn.dataset.view);
        });
    });

    // default
    setView("login");
})();
