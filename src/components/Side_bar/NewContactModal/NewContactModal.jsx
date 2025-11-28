import { useState } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import "./NewContactModal.css";

export default function NewContactModal({ onClose, onSuccess }) {

    const [email, setEmail] = useState("");
    const [alias, setAlias] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return setError("Email requerido");

        try{
            setLoading(true);
            setError("");

            console.log("🔍 Buscando usuario con email:", email.trim());

            const searchRes = await api.get(`/users/search/email?email=${email.trim()}`);
            
            console.log("✅ Resultado de búsqueda:", searchRes.data);

            if (!searchRes.data.ok) {
                throw new Error("Usuario no encontrado en el sistema");
            }

            const foundUser = searchRes.data.data;

            if (foundUser._id === user?._id) {
                throw new Error("No puedes agregarte a ti mismo como contacto");
            }

            // Verificar si ya es contacto
            try {
                const contactsRes = await api.get("/contacts");
                const existingContact = contactsRes.data.data?.find(contact => 
                    contact.contactUser?._id === foundUser._id || 
                    contact._id === foundUser._id ||
                    contact.email === foundUser.email
                );
                
                if (existingContact) {
                    throw new Error(`Ya tienes a ${foundUser.username || foundUser.email} en tus contactos`);
                }
            } catch (contactsError) {
                console.log("No se pudieron verificar contactos existentes, continuando...");
            }

            console.log("📤 Agregando contacto...");
            
            const contactRes = await api.post("/contacts", {
                email: foundUser.email,       
                alias: alias.trim() || foundUser.username || foundUser.email  
            });

            console.log("✅ Contacto agregado:", contactRes.data);

            if(contactRes.data.success){
                if(onSuccess) onSuccess();
                onClose();
            } else {
                setError(contactRes.data.message || "Error al agregar contacto");
            }

        }catch(err){
            console.error("❌ Error:", err);
            
            let errorMessage = err.response?.data?.message || err.message || "Error agregando contacto";
            
            if (errorMessage.includes("no encontrado") || errorMessage.includes("no existe")) {
                errorMessage = "No se encontró ningún usuario registrado con ese email";
            } else if (errorMessage.includes("agregarte a ti mismo")) {
                errorMessage = "No puedes agregarte a ti mismo como contacto";
            } else if (errorMessage.includes("Ya tienes")) {
                errorMessage = err.message;
            } else if (err.response?.status === 400) {
                errorMessage = "Datos inválidos para agregar contacto";
            }
            
            setError(errorMessage);
        }finally{
            setLoading(false);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (error) setError("");
    };

    return(
        <div className="wa-modal-overlay">
            <div className="wa-modal">

                <div className="wa-modal-header">
                    <span>Agregar contacto</span>
                    <button className="wa-modal-close" onClick={onClose}>✕</button>
                </div>

                {error && (
                    <div className="wa-modal-error">
                        {error}
                        <br />
                        <small style={{opacity: 0.8, fontSize: '11px'}}>
                            El usuario debe estar registrado en WhatsApp Messenger
                        </small>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="wa-modal-form">

                    <label>Email del contacto</label>
                    <input 
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="wa-modal-input"
                        disabled={loading}
                        required
                        placeholder="usuario@ejemplo.com"
                    />

                    <label>Alias (opcional)</label>
                    <input 
                        type="text"
                        value={alias}
                        onChange={(e)=>setAlias(e.target.value)}
                        className="wa-modal-input"
                        disabled={loading}
                        placeholder="Nombre para identificar el contacto"
                    />

                    <div className="wa-modal-info">
                        <small>Ingresa el email de un usuario registrado en la aplicación</small>
                    </div>

                    <button 
                        type="submit"
                        className="wa-modal-confirm"
                        disabled={loading || !email.trim()}
                    >
                        {loading ? "Agregando contacto..." : "Agregar contacto"}
                    </button>

                </form>

            </div>
        </div>
    );
}