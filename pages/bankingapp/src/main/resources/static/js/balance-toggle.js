function toggleBalance() {
    const bal = document.getElementById("balanceValue");
    const eye = document.getElementById("balanceEye");

    if (bal.dataset.hidden === "true") {
        // SHOW BALANCE
        bal.textContent = bal.dataset.realValue;
        bal.dataset.hidden = "false";
        eye.classList.remove("fa-eye-slash");
        eye.classList.add("fa-eye");
    } else {
        // HIDE BALANCE
        bal.dataset.realValue = bal.textContent;
        bal.textContent = "•••••••";
        bal.dataset.hidden = "true";
        eye.classList.add("fa-eye-slash");
        eye.classList.remove("fa-eye");
    }
}

// Start hidden by default
document.addEventListener("DOMContentLoaded", function () {
    const bal = document.getElementById("balanceValue");
    if (!bal) return;

    bal.dataset.realValue = bal.textContent;
    bal.textContent = "•••••••";
    bal.dataset.hidden = "true";
});
