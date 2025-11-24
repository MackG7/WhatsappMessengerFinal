import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/auth.css";


export default function InviteRegisterPage(){
    const { token } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(`/contacts/resolve-invite/${token}`);
                if (res.data.ok) {
                    setData(res.data);
                } else {
                    setError("Invitación inválida");
                }
            } catch (e) {
                setError("Invitación inválida o expirada");
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    if (loading) {
        return (
            <div className="auth-container">
                <div className="auth-box">
                    <div className="loading-state">
                        <div className="spinner large"></div>
                        <p>Cargando invitación...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="auth-container">
                <div className="auth-box error-box">
                    <div className="error-icon">❌</div>
                    <h2>Invitación no válida</h2>
                    <p className="error-text">{error}</p>
                    <button 
                        onClick={() => navigate("/register")}
                        className="auth-button"
                    >
                        Crear cuenta normal
                    </button>
                </div>
            </div>
        );
    }

    return(
        <div className="auth-container">
            <div className="auth-box invite-register-box">
                <div className="auth-logo">
                    <div className="whatsapp-logo"></div>
                    <h1>WhatsApp</h1>
                </div>

                <div className="invite-header">
                    <div className="success-icon">🎉</div>
                    <h2>¡Fuiste invitado!</h2>
                </div>

                <div className="invite-details">
                    <p className="invite-message">
                        <strong>{data.invitedEmail}</strong> fue invitado por{" "}
                        <strong>{data.ownerName}</strong>
                    </p>
                    <p className="invite-submessage">
                        Únete a WhatsApp Messenger para comenzar a chatear
                    </p>
                </div>

                <button 
                    onClick={() => navigate("/register")}
                    className="auth-button primary-button"
                >
                    Crear mi cuenta ahora
                </button>

                <p className="auth-switch">
                    ¿Ya tienes una cuenta?{" "}
                    <span 
                        onClick={() => navigate("/login")}
                        className="auth-link"
                    >
                        Inicia sesión
                    </span>
                </p>
            </div>
        </div>
    )
}