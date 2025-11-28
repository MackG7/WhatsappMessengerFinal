import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/auth.css";

export default function InvitePage(){
    const [inviteLink, setInviteLink] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const createInvite = async () => {
        if (!inviteEmail) {
            alert("Por favor ingresa un email");
            return;
        }

        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteEmail)) {
            alert("Por favor ingresa un email válido");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/contacts/invite", { 
                email: inviteEmail 
            });
            
            const token = res.data.data.token;
            const link = `${window.location.origin}/register?ref=${token}`;
            setInviteLink(link);
            
            // Si tu backend ya envía el email, mostramos éxito
            setEmailSent(true);
            
        } catch (error) {
            console.error("Error creating invite:", error);
            alert("Error al generar y enviar la invitación");
        } finally {
            setLoading(false);
        }
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback para navegadores antiguos
            const textArea = document.createElement("textarea");
            textArea.value = inviteLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    const navigate = useNavigate();

    return(
        <div className="auth-container">
            <div className="auth-box invite-box">
                <div className="auth-logo">
                    <div className="whatsapp-logo"></div>
                    <h1>WhatsApp</h1>
                </div>

                <h2 className="invite-contact">Invitar Contacto</h2>
                <p className="auth-subtitle">Invita a tus amigos por email</p>

                <div className="invite-content">
                    {/* Campo para ingresar el email */}
                    <div className="input-group">
                        <label htmlFor="inviteEmail">Email del invitado:</label>
                        <input
                            id="inviteEmail"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="ejemplo@email.com"
                            className="auth-input"
                            disabled={loading}
                        />
                    </div>

                    <button 
                        onClick={createInvite}
                        disabled={loading || !inviteEmail}
                        className="auth-button invite-button"
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Enviando invitación...
                            </>
                        ) : (
                            "Enviar invitación por email"
                        )}
                    </button>

                    {emailSent && (
                        <div className="success-message">
                            ✅ Invitación enviada a {inviteEmail}
                        </div>
                    )}

                    {inviteLink && (
                        <div className="invite-link-section">
                            <p className="invite-instruction">O comparte este enlace manualmente:</p>
                            <div className="link-container">
                                <input 
                                    value={inviteLink} 
                                    readOnly 
                                    className="invite-input"
                                />
                                <button 
                                    onClick={copyToClipboard}
                                    className="copy-button"
                                    title="Copiar enlace"
                                >
                                    {copied ? "✓" : "📋"}
                                </button>
                            </div>
                            {copied && <div className="copied-message">¡Enlace copiado!</div>}
                        </div>
                    )}
                </div>

                <p className="auth-switch">
                    <span 
                        onClick={() => navigate("/")}
                        className="auth-link"
                    >
                        Volver al chat
                    </span>
                </p>
            </div>
        </div>
    )
}