import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/global.css";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const { register, authLoading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await register(
            formData.username,
            formData.email,
            formData.password
        );

        if (result.success) {
            navigate("/login", { replace: true });
        } 
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                {/* LOGO DE WHATSAPP */}
                <div className="auth-logo">
                    <div className="whatsapp-logo">💬</div>
                    <h1>WhatsApp</h1>
                </div>

                <h2>Crear cuenta</h2>
                <p className="auth-subtitle">Regístrate para comenzar a chatear</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="username"
                            placeholder="Nombre de usuario"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={authLoading}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Correo electrónico"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={authLoading}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={authLoading}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={authLoading}
                        className={`auth-button ${authLoading ? "loading" : ""}`}
                    >
                        {authLoading ? (
                            <>
                                <div className="spinner"></div>
                                Procesando...
                            </>
                        ) : (
                            "Registrarse"
                        )}
                    </button>
                </form>

                <p className="auth-switch">
                    ¿Ya tienes una cuenta?{" "}
                    <span 
                        onClick={() => !authLoading && navigate("/login")}
                        className={authLoading ? "disabled-link" : "auth-link"}
                    >
                        Inicia sesión
                    </span>
                </p>
            </div>
        </div>
    );
}