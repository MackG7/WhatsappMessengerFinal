import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/global.css";
import { FaWhatsapp } from "react-icons/fa";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const { login, authLoading, error, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate("/", { replace: true });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                
                {/* LOGO DE WHATSAPP */}
                <div className="auth-logo">
                    <FaWhatsapp size={60} color="#6c6c6c" />
                    <h1>WhatsApp</h1>
                </div>

                <h2>Iniciar sesión</h2>
                <p className="auth-subtitle">Bienvenido de vuelta</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Correo electrónico"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={authLoading}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            id="password"
                            name="password"
                            type="password"
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
                                Iniciando sesión...
                            </>
                        ) : (
                            "Iniciar sesión"
                        )}
                    </button>
                </form>

                <p className="auth-switch">
                    ¿No tienes una cuenta?{" "}
                    <span 
                        onClick={() => !authLoading && navigate("/register")}
                        className={authLoading ? "disabled-link" : "auth-link"}
                    >
                        Regístrate
                    </span>
                </p>
            </div>
        </div>
    );
}
