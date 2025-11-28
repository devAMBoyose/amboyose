import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const RegisterForm = () => {
    const { register, loading } = useAuth();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const res = await register(form);
        if (!res.success) {
            setError(res.message);
        } else {
            navigate("/");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Name
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                />
            </label>
            <label>
                Email
                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                />
            </label>
            <label>
                Password
                <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                />
            </label>
            {error && <div className="error-text">{error}</div>}
            <button className="btn" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
            </button>
        </form>
    );
};
