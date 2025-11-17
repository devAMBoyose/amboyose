
const API_URL = "http://localhost:8080"; // Spring Boot server

const form = document.getElementById("loginForm");
const userInput = document.getElementById("username");
const passInput = document.getElementById("password");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        username: userInput.value,
        password: passInput.value
    };

    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            alert("Login failed");
            return;
        }

        const data = await res.json(); // { token: "..." }

        // Save JWT for later
        localStorage.setItem("jwt", data.token);

        // ✅ Redirect to your portfolio home
        window.location.href = "/index.html"; // adjust path kung iba
    } catch (err) {
        console.error(err);
        alert("Error connecting to server");
    }
});
