(function () {
    console.log("BamBoy script loaded");

    const toggle = document.getElementById("bamboyToggle");
    const windowEl = document.getElementById("bamboyWindow");
    const closeBtn = document.getElementById("bamboyClose");
    const form = document.getElementById("bamboyForm");
    const input = document.getElementById("bamboyInput");
    const messages = document.getElementById("bamboyMessages");

    if (!toggle || !windowEl || !closeBtn || !form || !input || !messages) {
        console.warn("BamBoy: elements not found.");
        return;
    }

    // Scan sections that BamBoy can navigate to
    const sections = Array.from(
        document.querySelectorAll("[data-bamboy-label]")
    ).map((el) => ({
        id: el.id,
        label: el.getAttribute("data-bamboy-label"),
        keywords: (el.getAttribute("data-bamboy-keywords") || "").toLowerCase(),
    }));

    let greeted = false;

    // Open / close behavior
    toggle.addEventListener("click", () => {
        windowEl.classList.toggle("open");
        if (windowEl.classList.contains("open") && !greeted) {
            greeted = true;
            showGreeting();
        }
    });

    closeBtn.addEventListener("click", () => {
        windowEl.classList.remove("open");
    });

    // Handle form submit
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        addMessage("user", text);
        input.value = "";
        handleUserText(text);
    });

    // Messages
    function addMessage(sender, html) {
        const m = document.createElement("div");
        m.className = "msg " + (sender === "user" ? "user" : "bot");
        m.innerHTML = html;
        messages.appendChild(m);
        messages.scrollTop = messages.scrollHeight;
    }

    function showGreeting() {
        addMessage(
            "bot",
            "Hi, I'm <b>BamBoy</b> 🤖<br>Ask me about your <b>skills</b>, <b>tech stack</b>, or <b>stats</b>."
        );

        if (sections.length) {
            const chips = sections
                .map(
                    (s) =>
                        `<button class="bamboy-chip" data-target="${s.id}">${s.label}</button>`
                )
                .join(" ");

            const m = document.createElement("div");
            m.className = "msg bot";
            m.innerHTML = `
        You can jump to:
        <div class="bamboy-suggestions">
          ${chips}
        </div>
      `;
            messages.appendChild(m);
            messages.scrollTop = messages.scrollHeight;
        }
    }

    // Click chips
    messages.addEventListener("click", (e) => {
        if (e.target.matches(".bamboy-chip")) {
            const id = e.target.getAttribute("data-target");
            navigateToSection(id, e.target.textContent);
        }
    });

    // Understanding the text
    function handleUserText(text) {
        const lower = text.toLowerCase();

        if (lower.includes("help")) {
            addMessage(
                "bot",
                "Try asking:<br>• show my skills<br>• show my tech stack<br>• show my stats"
            );
            return;
        }

        const match = findBestSection(lower);

        if (match) {
            navigateToSection(match.id, match.label);
        } else {
            addMessage(
                "bot",
                "I couldn't match that to a section. Use words like <b>skills</b>, <b>tech stack</b>, or <b>stats</b>."
            );
        }
    }

    function findBestSection(text) {
        let best = null;
        let scoreBest = 0;

        sections.forEach((s) => {
            let score = 0;

            s.label
                .toLowerCase()
                .split(/\s+/)
                .forEach((w) => {
                    if (w && text.includes(w)) score += 2;
                });

            s.keywords.split(/\s+/).forEach((w) => {
                if (w && text.includes(w)) score += 1;
            });

            if (score > scoreBest) {
                scoreBest = score;
                best = s;
            }
        });

        return scoreBest > 0 ? best : null;
    }

    function navigateToSection(id, label) {
        const section = document.getElementById(id);
        if (!section) {
            addMessage("bot", "Hmm, I couldn't find that section on this page.");
            return;
        }

        addMessage("bot", `On it! Scrolling to <b>${label}</b>…`);

        section.scrollIntoView({ behavior: "smooth", block: "start" });
        section.classList.add("bamboy-highlight");
        setTimeout(() => section.classList.remove("bamboy-highlight"), 1500);
    }
})();
