import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) =>
        location.pathname === path ? "nav-link active" : "nav-link";

    return (
        <nav className="navbar">
            <div>
                <div className="nav-brand">Bookstore CRUD API</div>
                <div className="nav-tag">Fullstack · JWT · MongoDB</div>
            </div>

            <div className="nav-links">
                <Link className={isActive("/")} to="/">
                    Books
                </Link>
                {!user && (
                    <>
                        <Link className={isActive("/login")} to="/login">
                            Login
                        </Link>
                        <Link className={isActive("/register")} to="/register">
                            Register
                        </Link>
                    </>
                )}
                {user && (
                    <>
                        <span className="nav-link">
                            {user.name} <span style={{ opacity: 0.7 }}>({user.role})</span>
                        </span>
                        <button className="btn secondary" onClick={logout}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};
