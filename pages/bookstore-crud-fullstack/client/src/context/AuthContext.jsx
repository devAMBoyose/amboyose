import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/axios";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("bookstore_user");
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState(() =>
        localStorage.getItem("bookstore_jwt")
    );
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post("/auth/login", { email, password });
            setUser(res.data.user);
            setToken(res.data.token);
            localStorage.setItem("bookstore_user", JSON.stringify(res.data.user));
            localStorage.setItem("bookstore_jwt", res.data.token);
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || "Login failed"
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (payload) => {
        setLoading(true);
        try {
            const res = await api.post("/auth/register", payload);
            setUser(res.data.user);
            setToken(res.data.token);
            localStorage.setItem("bookstore_user", JSON.stringify(res.data.user));
            localStorage.setItem("bookstore_jwt", res.data.token);
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || "Registration failed"
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("bookstore_user");
        localStorage.removeItem("bookstore_jwt");
    };

    const value = { user, token, loading, login, register, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
