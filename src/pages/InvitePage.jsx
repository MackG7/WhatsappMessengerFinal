import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Auth.css";

export default function InvitePage(){
    const [inviteLink, setInviteLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const createInvite = async () => {
        try {
            setLoading(true);
            const res = await api.post("/contacts/invite");
            const token = res.data.data.token;
            const link = `${window.location.origin}/register?ref=${token}`;
            setInviteLink(link);
        } catch (error) {
            console.error("Error creating invite:", error);
            alert("Error al generar el enlace de invitación");
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

                <h2>Invitar Contacto</h2>
                <p className="auth-subtitle">Comparte WhatsApp con tus amigos</p>

                <div className="invite-content">
                    <button 
                        onClick={createInvite}
                        disabled={loading}
                        className="auth-button invite-button"
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Generando...
                            </>
                        ) : (
                            "Generar Link de invitación"
                        )}
                    </button>

                    {inviteLink && (
                        <div className="invite-link-section">
                            <p className="invite-instruction">Comparte este enlace:</p>
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