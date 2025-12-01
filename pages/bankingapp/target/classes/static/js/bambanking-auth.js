// /js/bambanking-auth.js

document.addEventListener("DOMContentLoaded", () => {
    // =======================
    // MODAL HELPERS (match bank-login.html)
    // =======================
    const modal = document.getElementById("bb-error-modal");
    const modalMsg = document.querySelector(".bb-error-message");
    const modalTitle = document.querySelector(".bb-error-title");
    const modalClose = document.getElementById("bb-error-ok");

    function showModal(message, title = "Notice") {
        if (!modal || !modalMsg) return;
        modalMsg.textContent = message;
        if (modalTitle) modalTitle.textContent = title;
        modal.classList.add("show");          // make sure .show in your CSS makes it visible
    }

    function hideModal() {
        if (!modal) return;
        modal.classList.remove("show");
    }

    if (modalClose) {
        modalClose.addEventListener("click", hideModal);
    }
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) hideModal();
        });
    }

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
    // FLIP CARD (login/signup)
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

    const openSignupFlag =
        (document.body.dataset.openSignup || "").toLowerCase() === "true";
    if (openSignupFlag) {
        showSignup();
    }

    // =======================
    // CLIENT-SIDE VALIDATION
    // =======================

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    // ---- LOGIN FORM (uses inline onsubmit="return validateLogin(event)")
    window.validateLogin = function (e) {
        const evt = e || window.event;
        const username =
            document.getElementById("username")?.value.trim() || "";
        const pin =
            document.getElementById("pin")?.value.trim() || ""; // id="pin" in HTML

        if (!username || !pin) {
            if (evt) evt.preventDefault();
            showModal(
                "Please fill in both username and PIN.",
                "Missing information"
            );
            return false;
        }

        if (!/^\d{4}$/.test(pin)) {
            if (evt) evt.preventDefault();
            showModal("PIN must be exactly 4 digits.", "Invalid PIN");
            return false;
        }

        // allow normal form submit to Spring Boot
        return true;
    };

    // ---- SIGNUP FORM (id="signupForm")
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            const firstName =
                document.getElementById("firstName")?.value.trim() || "";
            const lastName =
                document.getElementById("lastName")?.value.trim() || "";
            const email =
                document.getElementById("email")?.value.trim() || "";
            const pin =
                document.getElementById("signup-pin")?.value.trim() || "";
            const fullNameHidden = document.getElementById("fullName");

            if (!firstName || !lastName || !email || !pin) {
                e.preventDefault();
                showModal(
                    "Please fill in all fields before creating your account.",
                    "Missing information"
                );
                return;
            }

            if (!emailRegex.test(email)) {
                e.preventDefault();
                showModal(
                    "Please enter a valid email like name@example.com.",
                    "Invalid email"
                );
                return;
            }

            if (!/^\d{4}$/.test(pin)) {
                e.preventDefault();
                showModal("PIN must be exactly 4 digits.", "Invalid PIN");
                return;
            }

            if (fullNameHidden) {
                fullNameHidden.value = `${firstName} ${lastName}`;
            }
        });
    }

    // ---- FORGOT PIN link on login page (class="forgot-pin-link")
    const forgotLink = document.querySelector(".forgot-pin-link");
    if (forgotLink) {
        forgotLink.addEventListener("click", (e) => {
            // let your /bambanking/forgot-pin page handle real reset,
            // here we just show info if you want
            // e.preventDefault();
            // showModal("For this demo, please use the sample accounts on the login page.", "Forgot PIN?");
        });
    }
});
