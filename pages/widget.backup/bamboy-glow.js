// bamboy-glow.js
(function () {
    // If you only want the widget to change, you can also use:
    // const root = document.querySelector('.bamboy-widget');
    // then replace document.documentElement with root.
    const root = document.documentElement;

    // Colors inspired by your card (green ↔ yellow ↔ orange ↔ teal)
    const glowSteps = [
        {
            green: '#22c55e',                       // green
            soft: 'rgba(34, 197, 94, 0.22)',
            glow: 'rgba(34, 197, 94, 0.9)'
        },
        {
            green: '#eab308',                       // yellow
            soft: 'rgba(234, 179, 8, 0.22)',
            glow: 'rgba(234, 179, 8, 0.9)'
        },
        {
            green: '#f97316',                       // orange
            soft: 'rgba(249, 115, 22, 0.22)',
            glow: 'rgba(249, 115, 22, 0.9)'
        },
        {
            green: '#14b8a6',                       // teal
            soft: 'rgba(20, 184, 166, 0.22)',
            glow: 'rgba(20, 184, 166, 0.9)'
        }
    ];

    let index = 0;

    function applyGlowStep() {
        const step = glowSteps[index];

        root.style.setProperty('--green', step.green);
        root.style.setProperty('--green-soft', step.soft);
        root.style.setProperty('--glow', step.glow);

        index = (index + 1) % glowSteps.length;
    }

    document.addEventListener('DOMContentLoaded', function () {
        applyGlowStep();              // set initial color
        setInterval(applyGlowStep, 2500); // change every 2.5s
    });
})();
