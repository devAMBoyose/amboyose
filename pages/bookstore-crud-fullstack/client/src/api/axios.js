import axios from "axios";

// Always use environment variable (Render uses this on build)
const API_BASE = import.meta.env.VITE_API_BASE_URL;

console.log("🌐 API BASE URL →", API_BASE); // For debugging

export const api = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true,
});

// Attach token if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("bookstore_jwt");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
