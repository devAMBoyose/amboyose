const isTouch = "ontouchstart" in window;

document.querySelectorAll(".card").forEach((card) => {
    const inner = card.querySelector(".card-inner");

    // Tap / click: flip with a small bounce
    card.addEventListener("click", () => {
        const isFlipped = card.classList.contains("flipped");
        const targetFlip = isFlipped ? 0 : 180;

        // quick scale-out
        inner.style.transition = "transform 0.15s ease-out";
        inner.style.transform = `rotateY(${targetFlip}deg) scale(1.05)`;

        setTimeout(() => {
            // smooth settle
            inner.style.transition = "transform 0.7s cubic-bezier(.4,.2,.2,1)";
            inner.style.transform = `rotateY(${targetFlip}deg) scale(1)`;
            card.classList.toggle("flipped");
        }, 150);
    });

    // Pointer-tilt on non-touch devices
    if (!isTouch) {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // small tilt range
            const tiltX = ((y - centerY) / centerY) * -10;
            const tiltY = ((x - centerX) / centerX) * 10;
            const flipY = card.classList.contains("flipped") ? 180 : 0;

            inner.style.transition = "transform 60ms ease-out";
            inner.style.transform = `rotateX(${tiltX}deg) rotateY(${flipY + tiltY}deg)`;
        });

        card.addEventListener("mouseleave", () => {
            const flipY = card.classList.contains("flipped") ? 180 : 0;
            inner.style.transition = "transform 0.3s ease-out";
            inner.style.transform = `rotateY(${flipY}deg)`;
        });
    }
});
