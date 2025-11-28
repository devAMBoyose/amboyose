import { LoginForm } from "../components/LoginForm";

export const LoginPage = () => (
    <div className="panel">
        <div className="panel-header">
            <span className="panel-title">Login</span>
            <span className="chip">JWT Auth</span>
        </div>
        <LoginForm />
    </div>
);
