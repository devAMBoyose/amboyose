(function () {
    console.log("BAM BOT script loaded");

    // ========= BAM BOT DATA =========
    const bambyData = {
        name: "Anna Marice Eben Boyose",
        gender: "Female",
        title: "Full-Stack Developer | React | Node.js | PHP | Java | MongoDB | UI/UX Design",

        bio: `
            I'm a Full-Stack Developer who builds fast, functional, and visually polished applications.<br>
            Skilled in front-end, back-end, database systems, UI/UX design, and analytics.<br><br>

            I am currently living in <b>Mandaluyong City, Metro Manila</b>,<br>
            but originally from <b>Davao City</b>.<br><br>

            I am actively studying and practicing:<br>
            • Robotics / RPA (BluePrism)<br>
            • Java Programming NC III<br>
            • Computer Hardware Servicing NC II<br>
            • Continuous full-stack development skills
        `,

        personal: {
            birthday: "January 27, 1990",
            age: 35,
            gender: "Female",
            currentCity: "Mandaluyong City, Metro Manila",
            hometown: "Davao City",
            website: "https://amboyose.com",
            degree: "Bachelor of Science in Computer Science",
            phone: "+63 962 989 0260",
            email: "amboyose.dev@gmail.com",
            freelance: "Available"
        },

        quickStats: {
            happyClients: 1565,
            projects: 546,
            hoursSupport: 1763,
            certificates: 24
        },

        coreSkills: {
            frontend: ["HTML5", "CSS3", "JavaScript", "React", "UI/UX Design", "Figma", "Photoshop", "Illustrator"],
            backend: ["Node.js", "PHP", "Java", "REST APIs"],
            database: ["MySQL", "MongoDB", "PostgreSQL"],
            tools: ["Git", "Power BI", "Google Analytics", "Google Tag Manager", "Looker Studio", "Microsoft Office", "Google Workspace"]
        },

        interests: [
            "Exploring New Technologies",
            "Building Side Projects",
            "Contributing to Open Source",
            "Designing & Prototyping"
        ],

        hobbies: ["Painting", "Travelling", "Swimming", "Music"],

        studying: [
            "Robotics Process Automation (RPA / BluePrism)",
            "Java Programming NC III",
            "Computer Hardware Servicing NC II",
            "Full-Stack Development (JavaScript, React, Node.js)"
        ],

        experience: [
            {
                role: "InfoSec / Full Stack Developer",
                company: "Biosite Medical Instruments",
                period: "Feb 2024 – July 2025",
                summary: "Handled full-stack development, UI/UX, REST APIs, database management, and system integration."
            },
            {
                role: "Website Developer (Front-End)",
                company: "OfWorkers (US Based)",
                period: "Dec 2023 – Feb 2024",
                summary: "Customized WordPress themes, improved SEO, and created brand-aligned web layouts."
            },
            {
                role: "IT Specialist / Database Administrator",
                company: "Devarete Venture Inc.",
                period: "2018 – 2024",
                summary: "Managed servers, databases, cybersecurity, hardware, and enterprise IT systems."
            },
            {
                role: "Graphic Designer",
                company: "Kirobin Digital Printing",
                period: "2013 – 2018",
                summary: "Produced graphics for marketing, social media, print, and web."
            },
            {
                role: "Virtual Assistant",
                company: "US Healthcare / Collections",
                period: "2014 – 2016",
                summary: "Handled CRM updates, medical records, appointment coordination, and follow-ups."
            }
        ],

        education: [
            "JAVA Programming NC III (2025)",
            "Robotics Process Automation – BluePrism (2022)",
            "BS Criminology (2007–2012)",
            "Computer Hardware Servicing NC II (2013)"
        ],

        certifications: [
            "HTML, CSS & JavaScript (Johns Hopkins, 2025)",
            "IBM Software Engineering (2025)",
            "LinkedIn DevOps Certified (2025)",
            "MongoDB Schema Design & Aggregation (2025)",
            "Ethical Hacking Fundamentals (2025)",
            "Google UI Design, GA4 Setup, SEO & WordPress Optimization",
            "OPSWAT Critical Infrastructure Protection (2025)",
            "Building RAG Apps with MongoDB (2025)",
            "LinkedIn Content & Creative Design (2025)"
        ],

        contact: {
            address: "Shaw Blvd, Mandaluyong City, Metro Manila",
            email: "amboyose.dev@gmail.com",
            phone: "+63 962 989 0260",
            socials: {
                github: "https://github.com/devAMBoyose",
                linkedin: "https://linkedin.com/in/amboyose",
                facebook: "https://www.facebook.com/bambam.wong.1/",
                instagram: "https://www.instagram.com/bamb_y27/",
                tiktok: "https://www.tiktok.com/@bamby27900",
                whatsapp: "https://api.whatsapp.com/send/?phone=639292803010",
                viber: "+639292803010"
            }
        }
    };

    // ========= BASE ELEMENTS =========
    const toggle = document.getElementById("bamboyToggle");
    const windowEl = document.getElementById("bamboyWindow");
    const closeBtn = document.getElementById("bamboyClose");
    const form = document.getElementById("bamboyForm");
    const input = document.getElementById("bamboyInput");
    const messages = document.getElementById("bamboyMessages");

    if (!toggle || !windowEl || !closeBtn || !form || !input || !messages) {
        console.warn("BAM BOT: elements not found.");
        return;
    }

    const sections = Array.from(
        document.querySelectorAll("[data-bamboy-label]")
    ).map((el) => ({
        id: el.id,
        label: el.getAttribute("data-bamboy-label"),
        keywords: (el.getAttribute("data-bamboy-keywords") || "").toLowerCase()
    }));

    let greeted = false;

    // ========= DRAGGABLE WINDOW (drag by header) =========
    const dragHandle = windowEl.querySelector(".bamboy-header");
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    function getClientPos(e) {
        if (e.touches && e.touches[0]) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function startDrag(e) {
        if (!dragHandle) return;
        if (e.target === closeBtn) return;

        isDragging = true;
        const { x, y } = getClientPos(e);
        const rect = windowEl.getBoundingClientRect();

        dragOffsetX = x - rect.left;
        dragOffsetY = y - rect.top;

        windowEl.style.position = "fixed";
        windowEl.style.bottom = "auto";
        windowEl.style.right = "auto";
        windowEl.style.left = rect.left + "px";
        windowEl.style.top = rect.top + "px";
        windowEl.style.transition = "none";

        dragHandle.classList.add("dragging");
        e.preventDefault();
    }

    function onDrag(e) {
        if (!isDragging) return;
        const { x, y } = getClientPos(e);

        let newLeft = x - dragOffsetX;
        let newTop = y - dragOffsetY;

        const padding = 8;
        const maxLeft = window.innerWidth - windowEl.offsetWidth - padding;
        const maxTop = window.innerHeight - windowEl.offsetHeight - padding;

        newLeft = Math.max(padding, Math.min(maxLeft, newLeft));
        newTop = Math.max(padding, Math.min(maxTop, newTop));

        windowEl.style.left = newLeft + "px";
        windowEl.style.top = newTop + "px";
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        windowEl.style.transition = "";
        if (dragHandle) dragHandle.classList.remove("dragging");
    }

    if (dragHandle) {
        dragHandle.addEventListener("mousedown", startDrag);
        dragHandle.addEventListener("touchstart", startDrag, { passive: false });
        document.addEventListener("mousemove", onDrag);
        document.addEventListener("touchmove", onDrag, { passive: false });
        document.addEventListener("mouseup", endDrag);
        document.addEventListener("touchend", endDrag);
    }

    // ========= OPEN / CLOSE =========
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

    // ========= FORM SUBMIT =========
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        addMessage("user", text);
        input.value = "";
        handleUserText(text);
    });

    // ========= MESSAGES =========
    function addMessage(sender, html) {
        const m = document.createElement("div");
        m.className = "msg " + (sender === "user" ? "user" : "bot");
        m.innerHTML = html;
        messages.appendChild(m);
        messages.scrollTop = messages.scrollHeight;
    }

    // ========= GREETING =========
    function showGreeting() {
        replyWithDelay(
            `Hello, I'm <b>BAM BOT</b> 🤖<br>
            Your UI portfolio assistant.<br><br>
            Ask me anything about <b>Bam</b> — skills, experience, projects, certifications, or contact details.<br>
            You don't need to scroll the whole page, I'll give you a quick review of the portfolio for you.`
        );

        if (sections.length) {
            const chips = sections
                .map((s) => `<button class="bamboy-chip" data-target="${s.id}">${s.label}</button>`)
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

    // ========= TYPING INDICATOR =========
    let typingEl = null;

    function showTyping() {
        if (typingEl) return;
        typingEl = document.createElement("div");
        typingEl.className = "msg bot typing";
        typingEl.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;
        messages.appendChild(typingEl);
        messages.scrollTop = messages.scrollHeight;
    }

    function hideTyping() {
        if (!typingEl) return;
        typingEl.remove();
        typingEl = null;
    }

    function replyWithDelay(html, delay = 700) {
        showTyping();
        setTimeout(() => {
            hideTyping();
            addMessage("bot", html);
        }, delay);
    }

    // ========= SUGGESTION CHIPS =========
    messages.addEventListener("click", (e) => {
        if (e.target.matches(".bamboy-chip")) {
            const id = e.target.getAttribute("data-target");
            navigateToSection(id, e.target.textContent);
        }
    });

    // ========= HELPERS =========
    // keyword scanner for HR replies
    function hasAny(text, keywords) {
        return keywords.some((word) => text.includes(word));
    }

    // ========= HANDLE USER TEXT =========
    function handleUserText(text) {
        const lower = text.toLowerCase();

        if (lower.includes("help")) {
            replyWithDelay(
                "You can ask me things like:<br>" +
                "• Who is Anna Marice?<br>" +
                "• Is she female?<br>" +
                "• What are Bam's skills?<br>" +
                "• Show Bam's experience<br>" +
                "• Show certifications<br>" +
                "• How can I contact Bam?<br>" +
                "• Where is Bam based?<br>" +
                "• Are you open for freelance?<br>" +
                "• Can you work nightshift?<br>" +
                "• What are your strengths and weaknesses?"
            );
            return;
        }

        const answer = getBotAnswer(lower);
        if (answer) {
            replyWithDelay(answer);
            return;
        }

        const match = findBestSection(lower);
        if (match) {
            showTyping();
            setTimeout(() => {
                hideTyping();
                navigateToSection(match.id, match.label);
            }, 700);
        } else {
            replyWithDelay(
                "I couldn't match that yet.<br>" +
                "Try asking about <b>skills</b>, <b>experience</b>, <b>certifications</b>, <b>HR questions</b>, or <b>contact</b>."
            );
        }
    }

    // ========= Q&A LOGIC =========
    function getBotAnswer(lower) {
        // ABOUT / GENDER / WHO
        if (
            lower.includes("who is") ||
            lower.includes("who are you") ||
            lower.includes("anna marice") ||
            lower.includes("about bam") ||
            lower.includes("about anna") ||
            lower.includes("is this female") ||
            lower.includes("is she female") ||
            lower.includes("gender")
        ) {
            return `
                <b>${bambyData.name}</b><br>
                <b>Gender:</b> ${bambyData.gender}<br><br>

                <b>About Me:</b><br>
                ${bambyData.bio}<br><br>

                <b>Current City:</b> ${bambyData.personal.currentCity}<br>
                <b>Hometown:</b> ${bambyData.personal.hometown}<br><br>

                <b>Currently Studying / Practicing:</b><br>
                • ${bambyData.studying.join("<br>• ")}
            `;
        }

        // SKILLS
        if (
            lower.includes("skill") ||
            lower.includes("skills") ||
            lower.includes("tech stack") ||
            lower.includes("stack")
        ) {
            return `
                <b>Core Skills & Tech Stack</b><br>
                <b>Frontend:</b> ${bambyData.coreSkills.frontend.join(", ")}<br>
                <b>Backend:</b> ${bambyData.coreSkills.backend.join(", ")}<br>
                <b>Database:</b> ${bambyData.coreSkills.database.join(", ")}<br>
                <b>Tools:</b> ${bambyData.coreSkills.tools.join(", ")}
            `;
        }

        // EXPERIENCE
        if (
            lower.includes("experience") ||
            lower.includes("work history") ||
            lower.includes("job") ||
            lower.includes("roles") ||
            lower.includes("career")
        ) {
            const items = bambyData.experience
                .map(
                    (exp) =>
                        `<b>${exp.role}</b> @ ${exp.company} (${exp.period}) – ${exp.summary}`
                )
                .join("<br><br>");
            return `<b>Professional Experience</b><br>${items}`;
        }

        // CERTIFICATIONS
        if (
            lower.includes("certification") ||
            lower.includes("certifications") ||
            lower.includes("certificate") ||
            lower.includes("badge") ||
            lower.includes("credentials")
        ) {
            return `<b>Certifications</b><br>• ${bambyData.certifications.join("<br>• ")}`;
        }

        // EDUCATION
        if (
            lower.includes("education") ||
            lower.includes("study") ||
            lower.includes("school") ||
            lower.includes("course")
        ) {
            return `<b>Education</b><br>• ${bambyData.education.join("<br>• ")}`;
        }

        // STATS
        if (
            lower.includes("stats") ||
            lower.includes("numbers") ||
            lower.includes("clients") ||
            lower.includes("projects") ||
            lower.includes("hours")
        ) {
            const s = bambyData.quickStats;
            return `
                <b>Portfolio Stats</b><br>
                • Happy Clients: ${s.happyClients}<br>
                • Projects: ${s.projects}<br>
                • Hours of Support: ${s.hoursSupport}<br>
                • Certificates: ${s.certificates}
            `;
        }

        // CONTACT
        if (
            lower.includes("contact") ||
            lower.includes("email") ||
            lower.includes("phone") ||
            lower.includes("reach") ||
            lower.includes("connect")
        ) {
            const c = bambyData.contact;
            return `
                <b>Contact Information</b><br>
                📍 ${c.address}<br>
                📧 <a href="mailto:${c.email}" target="_blank">${c.email}</a><br>
                📱 ${c.phone}<br><br>
                <b>Social Profiles:</b><br>
                <a href="${c.socials.github}" target="_blank">GitHub</a> •
                <a href="${c.socials.linkedin}" target="_blank">LinkedIn</a> •
                <a href="${c.socials.facebook}" target="_blank">Facebook</a> •
                <a href="${c.socials.instagram}" target="_blank">Instagram</a> •
                <a href="${c.socials.tiktok}" target="_blank">TikTok</a>
            `;
        }

        // LOCATION
        if (
            lower.includes("where do you live") ||
            lower.includes("where does she live") ||
            lower.includes("where is bam based") ||
            lower.includes("where is anna based") ||
            lower.includes("location") ||
            lower.includes("city") ||
            lower.includes("hometown")
        ) {
            return `
                <b>Location</b><br>
                Current City: ${bambyData.personal.currentCity}<br>
                Hometown: ${bambyData.personal.hometown}
            `;
        }

        // RESUME
        if (lower.includes("resume") || lower.includes("cv")) {
            return `
                Bam's resume highlights roles in InfoSec / Full Stack Development, Front-End Web Development, IT Specialist / DBA, and Graphic Design.<br>
                You can view and download the PDF from the <b>Portfolio / About</b> sections of this website.
            `;
        }

        // ========= FUN HR / JOB INTERVIEW ANSWERS =========

        // Freelance / project-based
        if (hasAny(lower, ["freelance", "project based", "project-based", "side job"])) {
            return `
                Absolutely! 💼<br>
                I'm open to <b>freelance</b> and <b>project-based</b> work, as long as the scope and timeline are clear.<br>
                I treat every project like a mini-product: organized, documented, and delivered on time.
            `;
        }

        // Work from home / remote
        if (hasAny(lower, ["work from home", "wfh", "remote work", "remote-only", "remote only"])) {
            return `
                100% yes 🙌<br>
                I'm fully set up for <b>remote / work-from-home</b> work with stable internet, own workstation, and communication tools ready.
            `;
        }

        // Night shift / US time
        if (hasAny(lower, ["night shift", "graveyard", "us time", "us hours", "nightshift"])) {
            return `
                I'm open to <b>night shift / US time</b> if the role needs it 🌙<br>
                I've already handled overlapping schedules with international clients before.
            `;
        }

        // ASAP / immediate start
        if (hasAny(lower, ["asap", "start now", "start immediately", "immediate start", "earliest start"])) {
            return `
                I can <b>start ASAP</b> 🚀<br>
                Just let me know the onboarding process and target start date so I can align my schedule.
            `;
        }

        // Strengths
        if (hasAny(lower, ["your strengths", "strengths", "strength"])) {
            return `
                <b>My Core Strengths 💪</b><br>
                • Fast learner – I pick up new tools and stacks quickly.<br>
                • Detail-oriented – I care about clean UI and clean code.<br>
                • Strong problem-solving – I enjoy debugging and fixing edge cases.<br>
                • Independent but collaborative – I can work solo or with a team.<br>
                • Organized – I like clear tasks, deadlines, and documentation.
            `;
        }

        // Weaknesses
        if (hasAny(lower, ["your weaknesses", "weaknesses", "weakness"])) {
            return `
                <b>My Honest Weaknesses 🙈</b><br>
                • I sometimes take extra time polishing UI and details because I want it to look and feel right.<br>
                • I can overload my to-do list when I'm excited about many ideas.<br><br>
                The good side: I'm aware of this, so I use planning and time-blocking to keep things realistic and on schedule.
            `;
        }

        // Part-time / full-time
        if (hasAny(lower, ["part time", "part-time", "full time", "full-time", "employment type"])) {
            return `
                I'm open to both <b>full-time</b> and <b>part-time</b> opportunities 😊<br>
                As long as expectations, hours, and responsibilities are clearly defined.
            `;
        }

        // Equipment / internet / workstation
        if (hasAny(lower, ["equipment", "laptop", "pc", "workstation", "internet", "connection", "wifi"])) {
            return `
                Yes, I'm fully equipped for remote work 🖥️<br>
                • Personal laptop/PC<br>
                • Stable high-speed internet<br>
                • Backup options for power and connectivity<br>
                • Tools like VS Code, Git, Zoom, Slack, etc. already set up.
            `;
        }

        // Can you work under pressure / deadlines?
        if (hasAny(lower, ["under pressure", "handle pressure", "stress", "tight deadline", "deadlines"])) {
            return `
                I can work under pressure, but I prefer <b>organized pressure</b> 😄<br>
                I break work into smaller tasks, set mini-deadlines, communicate early, and avoid last-minute surprises.
            `;
        }

        // Tell me about yourself (HR style)
        if (hasAny(lower, ["tell me about yourself", "about yourself", "introduce yourself"])) {
            return `
                Sure! 🙋‍♀️<br>
                I'm <b>${bambyData.name}</b>, a <b>Full-Stack Developer</b> with experience in frontend, backend, UI/UX, IT support, and graphics.<br>
                Based in <b>${bambyData.personal.currentCity}</b>, originally from <b>${bambyData.personal.hometown}</b>.<br>
                I'm passionate about building useful, clean, and user-friendly web applications and always open to learning new tech.
            `;
        }

        // Why should we hire you?
        if (hasAny(lower, ["why should we hire you", "why hire you", "what makes you different"])) {
            return `
                Great question 😄<br>
                You should hire me because I combine <b>development skills</b> (frontend, backend, databases) with <b>design sense</b> and <b>real-world experience</b> in IT, InfoSec, and operations.<br>
                I communicate clearly, deliver reliably, and treat every project like it's my own product.
            `;
        }

        // Salary expectation
        if (hasAny(lower, ["salary expectation", "expected salary", "rate expectation", "how much is your rate"])) {
            return `
                For salary or rate, I'm flexible and prefer to align it with the role scope, responsibilities, and schedule 😊<br>
                We can discuss a fair range once the full details of the position are clear.
            `;
        }

        return null;
    }

    // ========= SECTION MATCHING =========
    function findBestSection(text) {
        let best = null;
        let highestScore = 0;

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

            if (score > highestScore) {
                best = s;
                highestScore = score;
            }
        });

        return highestScore > 0 ? best : null;
    }

    // ========= SCROLL TO SECTION =========
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
