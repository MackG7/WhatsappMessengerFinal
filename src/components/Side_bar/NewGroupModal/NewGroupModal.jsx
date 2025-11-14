import { useState } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import "./NewGroupModal.css";

export default function NewGroupModal({ onClose, onSuccess }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("El nombre del grupo es requerido");
            return;
        }

        try {
            setLoading(true);
            setError("");

            console.log('🔄 Creando nuevo grupo...');
            
            const response = await api.post("/groups", {
                name: name.trim(),
                description: description.trim()
            });

            console.log('✅ Respuesta completa:', response);
            console.log('📋 Datos del grupo creado:', response.data);

            if (response.data.success) {
                console.log('🎉 Grupo creado exitosamente:', response.data.group);
                
                // ✅ Pasar el grupo creado a onSuccess
                if (onSuccess) {
                    onSuccess(response.data.group);
                }
                onClose();
            } else {
                setError(response.data.message || "Error al crear grupo");
            }
        } catch (err) {
            console.error("❌ Error creando grupo:", err);
            console.error("📋 Detalles del error:", err.response?.data);
            setError(err.response?.data?.message || "Error al crear grupo");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="modal-title">Crear nuevo grupo</h3>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label className="form-label">Nombre del grupo *</label>
                        <input
                            type="text"
                            placeholder="Mi grupo de amigos"
                            className="input"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            required
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {/* ❌ REMOVER MemberList - No se necesita durante la creación */}
                    {/* <MemberList group={selectedChat} onUpdate={loadGroups} /> */}

                    <div className="form-group">
                        <label className="form-label">Descripción (opcional)</label>
                        <textarea
                            placeholder="Describe el propósito del grupo..."
                            className="input textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            disabled={loading}
                        />
                    </div>

                    <div className="modal-info">
                        <p>💡 <strong>Nota:</strong> Al crear el grupo, serás automáticamente agregado como administrador. Podrás agregar miembros después de crear el grupo.</p>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-confirm"
                            disabled={loading || !name.trim()}
                        >
                            {loading ? "Creando..." : "Crear Grupo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}