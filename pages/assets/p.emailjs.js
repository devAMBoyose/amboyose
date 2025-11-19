// Initialize EmailJS
(function () {
    emailjs.init("g1ZbBiFWLyVbS_ahL"); // your public key
})();

const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const statusBox = document.getElementById("formStatus");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Disable button during send
    submitBtn.disabled = true;
    submitBtn.querySelector(".btn__text").textContent = "Sending...";

    // Collect form data
    const formData = {
        from_name: form.from_name.value,
        reply_to: form.reply_to.value,
        phone: form.phone.value,
        service: form.service.value,
        message: form.message.value
    };

    // Send Email
    emailjs.send("service_qaz9yaz", "template_6muc3er", formData)
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
