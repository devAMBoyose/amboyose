(() => {
    // ------- Slower timing (tweak to taste) -------
    const SPEED_MAIN = 55;   // ms per character for name/role/summary (was 18)
    const SPEED_LIST = 42;   // ms per character for details (was 14)
    const GAP_MAIN = 250;  // ms pause between the big lines
    const GAP_LIST = 120;  // ms pause between each detail item
    const MIN_LINE_MS = 900; // minimum time any line spends "typing" off-screen
    const AFTER_LOADER_DELAY = 600;

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // Off-screen typer: types text into hidden span to control duration
    function ghostType(text, speed) {
        return new Promise(resolve => {
            const ghost = document.createElement("span");
            ghost.className = "sr-typing";
            document.body.appendChild(ghost);

            let i = 0;
            const step = () => {
                ghost.textContent += text.charAt(i);
                i++;
                if (i >= text.length) {
                    ghost.remove();
                    resolve();
                } else {
                    setTimeout(step, speed);
                }
            };

            // Ensure even short lines don't finish too fast
            const expected = Math.max(text.length * speed, MIN_LINE_MS);
            // If the text is short, stretch the per-char delay to meet MIN_LINE_MS
            const adjustedSpeed = Math.ceil(expected / Math.max(1, text.length));
            const useSpeed = Math.max(speed, adjustedSpeed);

            const tick = () => {
                ghost.textContent += text.charAt(i);
                i++;
                if (i >= text.length) {
                    ghost.remove();
                    resolve();
                } else {
                    setTimeout(tick, useSpeed);
                }
            };
            tick();
        });
    }

    function prep(el) {
        if (!el) return null;
        const text = el.textContent.trim();
        el.classList.add("typing-hide", "reveal"); // hidden but ready to animate
        return { el, text };
    }

    async function reveal(el) {
        el.classList.remove("typing-hide"); // make it visible
        // trigger transition on next frame
        requestAnimationFrame(() => el.classList.add("show"));
    }

    async function runTyping() {
        const nameEl = document.querySelector(".about-me .name");
        const roleEl = document.querySelector(".about-me .role");
        const sumEl = document.querySelector(".about-me .summary");

        const blocks = [prep(nameEl), prep(roleEl), prep(sumEl)].filter(Boolean);

        for (const { el, text } of blocks) {
            await ghostType(text, SPEED_MAIN);
            await reveal(el);
            await sleep(GAP_MAIN);
        }

        const valueEls = Array.from(document.querySelectorAll(".details-grid .v"));
        const values = valueEls.map(prep).filter(Boolean);

        for (const { el, text } of values) {
            await ghostType(text, SPEED_LIST);
            await reveal(el);
            await sleep(GAP_LIST);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(runTyping, AFTER_LOADER_DELAY);
    });
})();
