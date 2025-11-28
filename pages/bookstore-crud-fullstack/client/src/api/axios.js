import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export const api = axios.create({
    baseURL: `${API_BASE}/api`
});

// attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("bookstore_jwt");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
