} else {
  if (els.html) els.html.value = `
<div class="card-grid">

  <!-- Card 1 -->
  <div class="card">
    <div class="card-inner">
      <div class="card-face card-front one">
        <div>
          <h2>Quantum UI</h2>
          <p>Next-gen UI framework designed for speed, interactivity, and effortless scalability.</p>
        </div>
        <p>Tap or click to flip</p>
      </div>
      <div class="card-face card-back">
        <div>
          <h3>Features</h3>
          <ul class="features">
            <li>Lightning-fast rendering</li>
            <li>Modular component system</li>
            <li>Seamless API integration</li>
            <li>AI-powered UI suggestions</li>
          </ul>
        </div>
        <div class="cta-buttons">
          <a href="#" class="primary">Get Started</a>
          <a href="#" class="secondary">Learn More</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Card 2 -->
  <div class="card">
    <div class="card-inner">
      <div class="card-face card-front two">
        <div>
          <h2>Neon Cloud</h2>
          <p>Cloud-native infrastructure that scales dynamically and keeps latency near zero.</p>
        </div>
        <p>Tap or click to flip</p>
      </div>
      <div class="card-face card-back">
        <div>
          <h3>Advantages</h3>
          <ul class="features">
            <li>Auto-scaling engine</li>
            <li>low-latency network</li>
            <li>Zero-downtime</li>
            <li>Built-in analytics</li>
          </ul>
        </div>
        <div class="cta-buttons">
          <a href="#" class="primary">Deploy Now</a>
          <a href="#" class="secondary">Docs</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Card 3 -->
  <div class="card">
    <div class="card-inner">
      <div class="card-face card-front three">
        <div>
          <h2>Nova AI</h2>
          <p>Advanced AI toolkit to build, train, and deploy models directly in the browser.</p>
        </div>
        <p>Tap or click to flip</p>
      </div>
      <div class="card-face card-back">
        <div>
          <h3>What's Inside</h3>
          <ul class="features">
            <li>In-browser training engine</li>
            <li>Model visualization tools</li>
            <li>Secure model hosting</li>
            <li>Dataset builder</li>
          </ul>
        </div>
        <div class="cta-buttons">
          <a href="#" class="primary">Try Nova</a>
          <a href="#" class="secondary">Explore API</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Card 4 -->
  <div class="card">
    <div class="card-inner">
      <div class="card-face card-front four">
        <div>
          <h2>Pulse Metrics</h2>
          <p>Real-time monitoring platform with predictive analytics and anomaly detection.</p>
        </div>
        <p>Tap or click to flip</p>
      </div>
      <div class="card-face card-back">
        <div>
          <h3>Highlights</h3>
          <ul class="features">
            <li>Live dashboards</li>
            <li>Predictive forecasting</li>
            <li>Custom alerts & triggers</li>
            <li>AI-based anomaly tracking</li>
          </ul>
        </div>
        <div class="cta-buttons">
          <a href="#" class="primary">Start Free</a>
          <a href="#" class="secondary">View Demo</a>
        </div>
      </div>
    </div>
  </div>

</div>
`.trim();

  if (els.css) els.css.value = `
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@400;600&display=swap");

:root {
  --bg: #0a0c10;
  --card-bg: rgba(20, 25, 35, 0.9);
  --accent: #00f5ff;
  --text: #fafbfd;
  --text-dim: #c6c7cc;
  --radius: 20px;
  --shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: "Inter", sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1200px;
}

.card { perspective: 1000px; cursor: pointer; position: relative; transform-style: preserve-3d; }

.card-inner {
  position: relative;
  width: 100%;
  min-height: 360px;
  transform-style: preserve-3d;
  border-radius: var(--radius);
  transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
}

.card.flipped .card-inner { transform: rotateY(180deg); }

.card-face {
  position: absolute; inset: 0; border-radius: var(--radius);
  background: var(--card-bg); box-shadow: var(--shadow); padding: 24px;
  display: flex; flex-direction: column; justify-content: space-between;
  backface-visibility: hidden; transform-style: preserve-3d;
  transition: box-shadow 0.3s, filter 0.3s;
}

.card-face::before {
  content: ""; position: absolute; inset: 0; border-radius: var(--radius);
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.25), 0 0 25px rgba(0, 255, 255, 0.15) inset;
  opacity: 0; transition: opacity 0.4s;
}

.card:hover .card-face::before,
.card.flipped .card-face::before {
  opacity: 1; animation: pulse 2s infinite alternate;
}

@keyframes pulse {
  0% { box-shadow: 0 0 12px rgba(0, 255, 255, 0.25), 0 0 25px rgba(0, 255, 255, 0.15) inset; }
  50% { box-shadow: 0 0 22px rgba(0, 255, 255, 0.4), 0 0 35px rgba(0, 255, 255, 0.25) inset; }
  100% { box-shadow: 0 0 12px rgba(0, 255, 255, 0.25), 0 0 25px rgba(0, 255, 255, 0.15) inset; }
}

.card-front h2 {
  font-family: "Orbitron", sans-serif; font-size: 1.6rem; color: var(--accent); margin-bottom: 0.5rem;
}
.card-front p { font-size: 1rem; color: var(--text-dim); line-height: 1.5; }

.one   { background: url("https://iili.io/KSTN6ps.png") center/cover no-repeat; }
.two   { background: url("https://iili.io/KSTNsjf.png") center/cover no-repeat; }
.three { background: url("https://iili.io/KSTNLQ4.png") center/cover no-repeat; }
.four  { background: url("https://iili.io/KST8L1R.png") center/cover no-repeat; }

.card-back { transform: rotateY(180deg); display: flex; flex-direction: column; justify-content: space-between; }

.card-back h3 {
  font-family: "Orbitron", sans-serif; font-size: 1.4rem; color: var(--accent); margin-bottom: 1rem;
}

ul.features { list-style: none; padding: 0; margin: 0; }
ul.features li {
  margin-bottom: 0.6rem; padding-left: 1.4rem; position: relative; color: var(--text-dim); font-size: 0.95rem;
}
ul.features li::before { content: "⚡"; position: absolute; left: 0; color: var(--accent); }

.cta-buttons { display: flex; gap: 12px; margin-top: 1.5rem; }
.cta-buttons a {
  flex: 1; text-align: center; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-weight: 600; transition: all 0.3s;
}
.cta-buttons a.primary { background: var(--accent); color: #000; }
.cta-buttons a.primary:hover { background: #00ffff; }
.cta-buttons a.secondary { border: 1px solid var(--accent); color: var(--accent); }
.cta-buttons a.secondary:hover { background: rgba(0, 255, 255, 0.1); }

@media (max-width: 768px) {
  body { padding: 20px; }
  .card-inner { min-height: 300px; }
  .card-face { padding: 18px; }
  .card-front h2 { font-size: 1.3rem; }
  .card-back h3 { font-size: 1.2rem; }
  ul.features li { font-size: 0.9rem; }
}
`.trim();

  if (els.js) els.js.value = `const isTouch = "ontouchstart" in window;

document.querySelectorAll(".card").forEach((card) => {
  const inner = card.querySelector(".card-inner");

  // Tap/click flip with subtle scale-bounce
  card.addEventListener("click", () => {
    const baseRotate = card.classList.contains("flipped") ? 0 : 180;

    inner.style.transition = "transform 0.15s ease-out";
    inner.style.transform = \`rotateY(\${baseRotate}deg) scale(1.05)\`;

    setTimeout(() => {
      inner.style.transition = "transform 0.7s cubic-bezier(.4,.2,.2,1)";
      inner.style.transform = \`rotateY(\${baseRotate}deg) scale(1)\`;
      card.classList.toggle("flipped");
    }, 150);
  });

  if (!isTouch) {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      const baseRotate = card.classList.contains("flipped") ? 180 : 0;
      inner.style.transform =
        \`rotateY(\${baseRotate}deg) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg) scale(1)\`;
    });

    card.addEventListener("mouseleave", () => {
      const baseRotate = card.classList.contains("flipped") ? 180 : 0;
      inner.style.transform = \`rotateY(\${baseRotate}deg) rotateX(0deg) rotateY(0deg) scale(1)\`;
    });
  }
});
`;
  setLive(true);
}
