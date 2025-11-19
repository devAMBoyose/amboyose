/* ---------- EmailJS setup ---------- */
emailjs.init('g1ZbBiFwLyVbS_ahL'); // your public key

const SERVICE_ID = 'service_qaz9yaz';
const TEMPLATE_ID = 'template_6muc3er';

const form = document.getElementById('contactForm');
const btn = document.getElementById('submitBtn');
const statusEl = document.getElementById('formStatus');
const btnText = btn.querySelector('.btn__text');

function setLoading(isLoading) {
    btn.disabled = isLoading;
    btnText.textContent = isLoading ? 'Sending…' : 'Submit Message';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    setLoading(true);
    statusEl.textContent = '';

    try {
        await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, '#contactForm');
        form.reset();
        statusEl.innerHTML =
            '<span class="ok">Thanks! Your message has been sent. I’ll get back to you soon. 😊</span>';
    } catch (err) {
        console.error('EmailJS error:', err);
        statusEl.innerHTML =
            '<span class="err">Oops, something went wrong. Please try again in a moment.</span>';
    } finally {
        setLoading(false);
    }
});
