/* ---------- ELEMENTS (optional per page) ---------- */
const codeEl = document.getElementById('code');
const typeBtn = document.getElementById('typeBtn');
const codeTpl = document.getElementById('codeTpl');

/* ---------- Typing engine that can be interrupted ---------- */
let typingTimer = null;
function typeEffect(htmlString, speed = 10, step = 3) {
  if (!codeEl) return;
  if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
  codeEl.innerHTML = "";
  let i = 0;
  typingTimer = setInterval(() => {
    codeEl.innerHTML = htmlString.slice(0, i += step);
    if (i >= htmlString.length) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
  }, speed);
}

/* ---------- Start typing if this page has a code template ---------- */
if (codeEl && codeTpl) {
  const htmlCode = codeTpl.innerHTML.trim();
  typeEffect(htmlCode);
  // Replay typing
  if (typeBtn) typeBtn.addEventListener('click', () => typeEffect(htmlCode));
}

/* ===== cursor-following glow engine (shared) ===== */
(function cursorGlow() {
  const root = document.documentElement;
  let targetX = 0.5, targetY = 0.5;
  let curX = targetX, curY = targetY;
  const ease = 0.12;
  let rafId = null;

  function onMove(e) {
    const vw = window.innerWidth, vh = window.innerHeight;
    let x = 0.5, y = 0.5;
    if (e.touches && e.touches[0]) {
      x = e.touches[0].clientX / vw;
      y = e.touches[0].clientY / vh;
    } else if (typeof e.clientX === "number") {
      x = e.clientX / vw;
      y = e.clientY / vh;
    }
    targetX = Math.max(0, Math.min(1, x));
    targetY = Math.max(0, Math.min(1, y));
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    curX += (targetX - curX) * ease;
    curY += (targetY - curY) * ease;
    root.style.setProperty("--cx", (curX * 100).toFixed(2) + "%");
    root.style.setProperty("--cy", (curY * 100).toFixed(2) + "%");
    if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  root.style.setProperty("--cx", "50%");
  root.style.setProperty("--cy", "50%");
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: true });
})();


/* ---------- Make each project line clickable ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const codeEl = document.getElementById("code");
  if (!codeEl) return;

  const linkMap = {
    "Inventory Dashboard — React + Node (2025)": "inventory.html",
    "Medical Equipment Catalog — PHP + MySQL": "medical.html",
    "Personal Portfolio — HTML + CSS + JS": "portfolio.html",
    "E-Commerce Demo — React + Firebase": "ecommerce.html"
  };

  // Wait for typing animation to finish
  setTimeout(() => {
    const lines = codeEl.innerText.split("\n").filter(Boolean);
    codeEl.innerHTML = "";

    lines.forEach(line => {
      const match = Object.keys(linkMap).find(k => line.includes(k));
      const p = document.createElement("div");
      p.textContent = line;
      if (match) {
        p.classList.add("clickable-line");
        p.addEventListener("click", () => window.location.href = linkMap[match]);
      }
      codeEl.appendChild(p);
    });
  }, 1500);

});



/* ---------- Portfolio Profile ---------- */
// document.addEventListener("DOMContentLoaded", () => {
//   if (!codeEl) return;

//   const linkMap = {
//     "Inventory Dashboard — React + Node (2025)": "inventory.html",
//     "Medical Equipment Catalog — PHP + MySQL": "medical.html",
//     "Personal Portfolio — HTML + CSS + JS": "portfolio.html",
//     "E-Commerce Demo — React + Firebase": "ecommerce.html"
//   };

//   // Wait for the typing animation to finish, then make lines clickable
//   setTimeout(() => {
//     const lines = codeEl.innerText.split("\n").filter(Boolean);
//     codeEl.innerHTML = "";

//     lines.forEach(line => {
//       const match = Object.keys(linkMap).find(k => line.includes(k));
//       const p = document.createElement("div");
//       p.textContent = line;
//       p.style.cursor = match ? "pointer" : "default";
//       p.style.transition = "color 0.2s ease";
//       p.style.margin = "2px 0";

//       if (match) {
//         p.addEventListener("click", () => {
//           window.location.href = linkMap[match];
//         });
//         p.addEventListener("mouseenter", () => p.style.color = "#7ef6a1");
//         p.addEventListener("mouseleave", () => p.style.color = "");
//       }

//       codeEl.appendChild(p);
//     });
//   }, 1500);
// });
