// /js/bambanking-auth.js

document.addEventListener("DOMContentLoaded", () => {

    // =======================
    // MODAL HELPERS
    // =======================
    const modal = document.getElementById("errorModal");
    const modalMsg = document.getElementById("errorModalMessage");
    const modalTitle = document.getElementById("modalTitle");
    const modalClose = document.getElementById("errorModalClose");

    function showModal(message, title = "Notice") {
        if (!modal || !modalMsg) return;
        modalMsg.textContent = message;
        if (modalTitle) modalTitle.textContent = title;
        modal.classList.add("show");
    }

    function hideModal() {
        if (!modal) return;
        modal.classList.remove("show");
    }

    modalClose?.addEventListener("click", hideModal);
    modal?.addEventListener("click", (e) => {
        if (e.target === modal) hideModal();
    });

    // =======================
    // SERVER-SIDE MESSAGES
    // =======================
    const errorFromServer = (document.body.dataset.error || "").trim();
    const successFromServer = (document.body.dataset.success || "").trim();

    if (errorFromServer) {
        showModal(errorFromServer, "Notice");
    } else if (successFromServer) {
        showModal(successFromServer, "Success");
    }

    // =======================
    // FLIP CARD
    // =======================
    const flip = document.getElementById("authFlip");
    const tabLogin = document.getElementById("tabLogin");
    const tabSignup = document.getElementById("tabSignup");
    const tabLoginBack = document.getElementById("tabLoginBack");
    const tabSignupBack = document.getElementById("tabSignupBack");

    function showLogin() {
        if (!flip) return;
        flip.classList.remove("is-flipped");
        tabLogin?.classList.add("active");
        tabSignup?.classList.remove("active");
        tabLoginBack?.classList.add("active");
        tabSignupBack?.classList.remove("active");
    }

    function showSignup() {
        if (!flip) return;
        flip.classList.add("is-flipped");
        tabLogin?.classList.remove("active");
        tabSignup?.classList.add("active");
        tabLoginBack?.classList.remove("active");
        tabSignupBack?.classList.add("active");
    }

    tabLogin?.addEventListener("click", showLogin);
    tabLoginBack?.addEventListener("click", showLogin);
    tabSignup?.addEventListener("click", showSignup);
    tabSignupBack?.addEventListener("click", showSignup);

    // Auto-open signup if backend says so
    const openSignupFlag =
        (document.body.dataset.openSignup || "").toLowerCase() === "true";
    if (openSignupFlag) {
        showSignup();
    }

    // =======================
    // CLIENT-SIDE VALIDATION
    // =======================

    // Same email regex as in AuthService
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    // ---- LOGIN FORM ----
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            const username = document.getElementById("username")?.value.trim() || "";
            const pin = document.getElementById("login-pin")?.value.trim() || "";

            if (!username || !pin) {
                e.preventDefault();
                showModal("Please fill in both username and PIN.", "Missing information");
                return;
            }

            if (!/^\d{4}$/.test(pin)) {
                e.preventDefault();
                showModal("PIN must be exactly 4 digits.", "Invalid PIN");
                return;
            }
        });
    }

    // ---- SIGNUP FORM ----
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            const firstName = document.getElementById("firstName")?.value.trim() || "";
            const lastName = document.getElementById("lastName")?.value.trim() || "";
            const email = document.getElementById("email")?.value.trim() || "";
            const pin = document.getElementById("signup-pin")?.value.trim() || "";
            const fullNameHidden = document.getElementById("fullName");

            // 1) check all required fields
            if (!firstName || !lastName || !email || !pin) {
                e.preventDefault();
                showModal("Please fill in all fields before creating your account.", "Missing information");
                return;
            }

            // 2) email format
            if (!emailRegex.test(email)) {
                e.preventDefault();
                showModal("Please enter a valid email like name@example.com.", "Invalid email");
                return;
            }

            // 3) PIN format
            if (!/^\d{4}$/.test(pin)) {
                e.preventDefault();
                showModal("PIN must be exactly 4 digits.", "Invalid PIN");
                return;
            }

            // 4) combine first + last into hidden fullName for backend
            if (fullNameHidden) {
                fullNameHidden.value = `${firstName} ${lastName}`;
            }
        });
    }
});


// ---- FORGOT PIN LINK ----
const forgotBtn = document.getElementById("forgotPasswordBtn");
if (forgotBtn) {
    forgotBtn.addEventListener("click", () => {
        showModal(
            "For this demo, please use: anna@gmail.com / bam@gmail.com with PIN 1234 or 4321.",
            "Forgot PIN?"
        );
    });
}
