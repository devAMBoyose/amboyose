/* ---------- EmailJS ---------- */
emailjs.init('YOUR_EMAILJS_PUBLIC_KEY'); // ← replace

const SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';   // ← replace
const TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';  // ← replace

const form = document.getElementById('contactForm');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('formStatus');
const btnText = btn.querySelector('.btn__text');

function setLoading(isLoading) {
    btn.disabled = isLoading;
    btnText.textContent = isLoading ? 'Sending…' : 'Submit Message';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(true);
    status.textContent = '';

    try {
        await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, '#contactForm');
        form.reset();
        status.innerHTML = '<span class="ok">Thanks! Your message has been sent. I’ll get back to you soon.</span>';
    } catch (err) {
        console.error(err);
        status.innerHTML = '<span class="err">Oops, something went wrong. Please try again in a moment.</span>';
    } finally {
        setLoading(false);
    }
});

/* ---------- Scroll Reveal (professional, lightweight) ---------- */
(function attachReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) {
        // Fallback: make everything visible immediately
        els.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target); // reveal once
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

    els.forEach(el => io.observe(el));
})();
