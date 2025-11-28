import { RegisterForm } from "../components/RegisterForm";

export const RegisterPage = () => (
    <div className="panel">
        <div className="panel-header">
            <span className="panel-title">Create Account</span>
            <span className="chip">New User</span>
        </div>
        <RegisterForm />
    </div>
);
