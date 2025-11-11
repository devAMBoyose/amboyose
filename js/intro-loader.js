(() => {
    const root = document.getElementById('intro-loader');
    if (!root) return;

    // Show once per session; force with ?intro=1
    const params = new URLSearchParams(location.search);
    const FORCE = params.get('intro') === '1';
    const KEY = 'intro_seen';
    if (sessionStorage.getItem(KEY) && !FORCE) {
        root.remove();
        return;
    }

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    const typedEl = root.querySelector('#intro-typed');
    const statusEl = root.querySelector('#intro-status');
    const pctEl = root.querySelector('.intro__pct');
    const fillEl = root.querySelector('.intro__bar-fill');
    const stepsEl = root.querySelector('#intro-steps');
    const steps = Array.from(stepsEl.querySelectorAll('li'));

    // Java-backend themed stages
    const stages = [
        { target: 12, cmd: '$ java -version', status: 'Checking JDK 17…', step: 0 },
        { target: 30, cmd: '$ ./gradlew dependencies', status: 'Resolving Gradle dependencies…', step: 1 },
        { target: 55, cmd: '$ ./gradlew bootRun -x test', status: 'Starting Spring Boot context…', step: 2 },
        { target: 78, cmd: '$ ./gradlew test', status: 'Running unit tests…', step: 3 },
        { target: 100, cmd: '$ ./gradlew bootJar', status: 'Packaging JAR…', step: 4 },
    ];

    // typewriter for current command
    let typingTimer;
    function typeCommand(text) {
        clearInterval(typingTimer);
        typedEl.textContent = '';
        let i = 0;
        const speed = 12; // faster typing
        typingTimer = setInterval(() => {
            typedEl.textContent = text.slice(0, ++i);
            if (i >= text.length) clearInterval(typingTimer);
        }, speed);
    }

    let pct = 0;
    let stageIdx = 0;
    typeCommand(stages[0].cmd);
    statusEl.textContent = stages[0].status;

    function markStepDone(idx) {
        const li = steps[idx];
        if (!li || li.classList.contains('done')) return;
        li.classList.add('done');
        li.textContent = 'Completed';
        li.setAttribute('aria-label', li.getAttribute('data-label') + ' completed');
    }

    function tick() {
        const stage = stages[stageIdx];
        const inc = Math.max(1, Math.round((stage.target - pct) * 0.25));
        pct = Math.min(stage.target, pct + inc);

        fillEl.style.width = pct + '%';
        pctEl.textContent = pct + '%';

        if (pct >= stage.target) {
            markStepDone(stage.step);
            if (stageIdx < stages.length - 1) {
                stageIdx++;
                statusEl.textContent = stages[stageIdx].status;
                typeCommand(stages[stageIdx].cmd);
            } else {
                // finished
                sessionStorage.setItem(KEY, '1');
                setTimeout(() => {
                    root.classList.add('exit');
                    setTimeout(() => {
                        html.style.overflow = prevOverflow || '';
                        root.remove();
                    }, 480);
                }, 280);
                return;
            }
        }
        setTimeout(tick, 55 + Math.random() * 110);
    }

    requestAnimationFrame(() => setTimeout(tick, 180));
})();
