document.addEventListener("DOMContentLoaded", function () {
    // Make sure EmailJS SDK is loaded
    if (typeof emailjs === "undefined") {
        console.error("EmailJS SDK not loaded. Check the CDN script tag.");
        return;
    }

    // Initialize EmailJS with your PUBLIC KEY
    emailjs.init("g1ZbBiFWLyVbS_ahL"); // your public key

    const form = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submitBtn");
    const statusBox = document.getElementById("formStatus");

    if (!form) {
        console.error("contactForm element not found in DOM.");
        return;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Basic required check (optional but nice)
        if (!form.from_name.value || !form.reply_to.value || !form.phone.value || !form.service.value || !form.message.value) {
            statusBox.innerHTML = `<span class="err">Please fill in all required fields.</span>`;
            return;
        }

        submitBtn.disabled = true;
        submitBtn.querySelector(".btn__text").textContent = "Sending...";

        const formData = {
            from_name: form.from_name.value,
            reply_to: form.reply_to.value,
            phone: form.phone.value,
            service: form.service.value,
            message: form.message.value
        };

        emailjs
            .send("service_qaz9yaz", "template_6muc3er", formData)
            .then(() => {
                statusBox.innerHTML = `<span class="ok">Message sent successfully! ✔️</span>`;
                form.reset();
                submitBtn.disabled = false;
                submitBtn.querySelector(".btn__text").textContent = "Submit Message";
            })
            .catch((err) => {
                console.error("EmailJS error:", err);
                statusBox.innerHTML = `<span class="err">Failed to send message. Please try again.</span>`;
                submitBtn.disabled = false;
                submitBtn.querySelector(".btn__text").textContent = "Submit Message";
            });
    });
});
