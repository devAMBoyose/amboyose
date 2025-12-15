
emailjs.init('TjIVuUz2SALwlYg5j');

const SERVICE_ID = 'service_aume7sc';      // ✔ your service ID
const TEMPLATE_ID = 'template_3pw33lq';    // ✔ your template ID

const form = document.getElementById('contactForm');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('formStatus');
const btnText = btn?.querySelector('.btn__text');

if (!form) console.warn('❗ contactForm not found');
if (!btn) console.warn('❗ submitBtn not found');

/* ---------- Modal (auto-create if not existing) ---------- */
function ensureSuccessModal() {
    let modal = document.getElementById('successModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'successModal';
        modal.className = 'bam-modal';
        modal.innerHTML = `
      <div class="bam-modal__backdrop" data-close="true"></div>

      <div class="bam-modal__panel" role="dialog" aria-modal="true" aria-labelledby="bamModalTitle">
        <button class="bam-modal__close" type="button" aria-label="Close" data-close="true">✕</button>

        <div class="bam-modal__icon" aria-hidden="true">✓</div>

        <h3 id="bamModalTitle" class="bam-modal__title">Message Sent!</h3>

        <p class="bam-modal__text">
          Thanks! Your message has been sent. I’ll get back to you soon.
        </p>

        <div class="bam-modal__actions">
          <button class="bam-modal__btn" type="button" data-close="true">Okay</button>
        </div>
      </div>
    `;
        document.body.appendChild(modal);
    }

    // Inject theme-based CSS once
    if (!document.getElementById('bamModalStyles')) {
        const style = document.createElement('style');
        style.id = 'bamModalStyles';
        style.textContent = `
      :root{
        /* Fall-back theme tokens (will be overridden automatically if your portfolio already has these) */
        --bam-bg: var(--bg-main, #0b0f17);
        --bam-panel: var(--card-bg, rgba(14, 18, 28, 0.86));
        --bam-text: var(--text, #e9edf7);
        --bam-muted: var(--muted, rgba(233,237,247,.78));
        --bam-border: var(--border, rgba(255,255,255,0.12));

        --bam-accent: var(--accent-green, #00ff99);
        --bam-accent-2: var(--accent-cyan, #68d7ff);
        --bam-danger: var(--accent-red, #ff5c7a);

        --bam-radius: var(--radius, 16px);
        --bam-font: var(--font-main, inherit);
      }

      .bam-modal{
        position:fixed;
        inset:0;
        display:none;
        z-index:9999;
        font-family: var(--bam-font);
      }
      .bam-modal.is-open{ display:block; }

      .bam-modal__backdrop{
        position:absolute;
        inset:0;
        background: rgba(0,0,0,.60);
        backdrop-filter: blur(10px);
      }

      .bam-modal__panel{
        position:relative;
        width:min(560px, calc(100% - 32px));
        margin: 12vh auto 0;
        padding: 22px 22px 18px;
        border-radius: var(--bam-radius);
        background: var(--bam-panel);
        color: var(--bam-text);
        border: 1px solid var(--bam-border);

        /* subtle neon edge */
        box-shadow:
          0 18px 70px rgba(0,0,0,.60),
          0 0 0 1px rgba(255,255,255,0.04),
          0 0 32px rgba(0,255,153,.10);
        transform: translateY(10px);
        animation: bamPop .18s ease-out forwards;
      }

      @keyframes bamPop { to { transform: translateY(0); } }

      .bam-modal__close{
        position:absolute;
        top:10px; right:10px;
        background: transparent;
        border: 0;
        color: var(--bam-muted);
        font-size: 18px;
        cursor: pointer;
        opacity:.85;
      }
      .bam-modal__close:hover{ opacity:1; }

      .bam-modal__icon{
        width: 46px;
        height: 46px;
        border-radius: 14px;
        display:grid;
        place-items:center;
        margin-bottom: 10px;
        font-weight: 800;
        color: var(--bam-accent);
        background: color-mix(in srgb, var(--bam-accent) 16%, transparent);
        border: 1px solid color-mix(in srgb, var(--bam-accent) 35%, transparent);
        box-shadow: 0 0 22px color-mix(in srgb, var(--bam-accent) 18%, transparent);
      }

      .bam-modal__title{
        margin: 0 0 6px;
        font-weight: 800;
        letter-spacing: .2px;
      }

      .bam-modal__text{
        margin: 0 0 14px;
        color: var(--bam-muted);
        line-height: 1.55;
      }

      .bam-modal__actions{
        display:flex;
        justify-content:flex-end;
        gap:10px;
      }

      .bam-modal__btn{
        padding: 10px 14px;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 700;
        color: var(--bam-text);

        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.14);
        transition: transform .08s ease, background .12s ease, border-color .12s ease;
      }

      .bam-modal__btn:hover{
        background: rgba(255,255,255,0.10);
        border-color: color-mix(in srgb, var(--bam-accent-2) 40%, rgba(255,255,255,0.14));
      }
      .bam-modal__btn:active{ transform: translateY(1px); }

      body.modal-open{ overflow:hidden; }
    `;
        document.head.appendChild(style);
    }

    return modal;
}

function openSuccessModal(customTitle, customText) {
    const modal = ensureSuccessModal();
    const titleEl = modal.querySelector('.bam-modal__title');
    const textEl = modal.querySelector('.bam-modal__text');

    if (customTitle) titleEl.textContent = customTitle;
    if (customText) textEl.textContent = customText;

    modal.classList.add('is-open');
    document.body.classList.add('modal-open');

    // focus "Okay" button
    modal.querySelector('.bam-modal__btn')?.focus();
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
}

// Close modal by clicking backdrop / close / button
document.addEventListener('click', (e) => {
    const modal = document.getElementById('successModal');
    if (!modal || !modal.classList.contains('is-open')) return;

    const closeTarget = e.target.closest('[data-close="true"]');
    if (closeTarget) closeSuccessModal();
});

// Close modal by ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSuccessModal();
});

/* ---------- Button Loading State ---------- */
function setLoading(isLoading) {
    if (!btn) return;
    btn.disabled = isLoading;
    if (btnText) btnText.textContent = isLoading ? 'Sending…' : 'Submit Message';
}

/* ---------- Submit Handler ---------- */
form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(true);
    if (status) status.textContent = '';

    // Optional: set hidden time field if you have:
    // <input type="hidden" name="time" id="timeField">
    const timeField = document.getElementById('timeField');
    if (timeField) timeField.value = new Date().toLocaleString();

    try {
        await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, '#contactForm');
        form.reset();

        // ✅ portfolio-style success modal
        openSuccessModal(
            'Message Sent!',
            'Thanks! Your message has been sent. I’ll get back to you soon.'
        );

        // Optional inline status too
        if (status) status.innerHTML = '<span class="ok">Message sent successfully.</span>';
    } catch (err) {
        console.error(err);
        if (status) {
            status.innerHTML =
                '<span class="err">Oops, something went wrong. Please try again in a moment.</span>';
        }
    } finally {
        setLoading(false);
    }
});

/* ---------- Scroll Reveal ---------- */
(function attachReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) {
        els.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

    els.forEach(el => io.observe(el));
})();
