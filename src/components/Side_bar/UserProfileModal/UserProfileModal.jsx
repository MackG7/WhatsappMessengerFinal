import { useState, useRef } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import "./UserProfileModal.css";

export default function UserProfileModal({ onClose }) {
    const { user, updateUser } = useAuth(); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const fileInputRef = useRef(null);

    
    const [formData, setFormData] = useState({
        username: user?.username || "",
        bio: user?.bio || "",
        phone: user?.phone || ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        
        if (!file.type.startsWith('image/')) {
            setError("Por favor, selecciona una imagen válida");
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // Reducido a 2MB
            setError("La imagen no debe superar los 2MB");
            return;
        }

        try {
            setLoading(true);
            setError("");
            
            
            const compressedImage = await compressImage(file);
            
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Image = event.target.result;
                
                try {
                    
                    const response = await api.post("/users/upload-avatar", {
                        avatarBase64: base64Image
                    });

                    if (response.data.ok) {
                        if (typeof updateUser === 'function') {
                            updateUser(response.data.data);
                            setSuccess("Foto de perfil actualizada correctamente");
                        } else {
                            console.error("updateUser no es una función");
                            setSuccess("Foto procesada pero no se pudo actualizar el contexto");
                        }
                    } else {
                        setError(response.data.message);
                    }
                } catch (backendError) {
                    console.log("Backend no disponible, guardando localmente...");
                    if (typeof updateUser === 'function') {
                        const userWithAvatar = {
                            ...user,
                            avatar: base64Image
                        };
                        updateUser(userWithAvatar);
                        setSuccess("Foto de perfil actualizada (modo local)");
                    } else {
                        setError("Error: No se pudo actualizar el perfil");
                    }
                }
                
                setTimeout(() => setSuccess(""), 3000);
            };
            
            reader.onerror = () => {
                setError("Error al leer el archivo");
                setLoading(false);
            };
            
            reader.readAsDataURL(compressedImage);

        } catch (err) {
            setError("Error al procesar la imagen");
            console.error("Error:", err);
            setLoading(false);
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const MAX_WIDTH = 500;
                const MAX_HEIGHT = 500;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.7); 
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError("");
            
            const response = await api.put("/users/profile/me", formData);
            
            if (response.data.ok) {
                if (typeof updateUser === 'function') {
                    updateUser(response.data.data);
                    setSuccess("Perfil actualizado correctamente");
                } else {
                    setError("Error: No se pudo actualizar el contexto");
                }
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error al actualizar el perfil");
        } finally {
            setLoading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const getInitials = () => {
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        if (user?.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return "U";
    };

    return (
        <div className="modal-overlay">
            <div className="modal user-profile-modal">
                <div className="modal-header">
                    <h3 className="modal-title">Mi perfil</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSaveProfile} className="profile-form">
                    {/* Sección de foto de perfil */}
                    <div className="avatar-section">
                        <div className="avatar-container">
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt="Avatar" 
                                    className="profile-avatar"
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    {getInitials()}
                                </div>
                            )}
                            <div className="avatar-overlay" onClick={triggerFileInput}>
                                <span>📷</span>
                                <span>Cambiar foto</span>
                            </div>
                        </div>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        
                        {loading && <div className="upload-loading">Procesando imagen...</div>}
                        <div className="upload-info">
                            <small>Máximo 2MB - Se comprimirá automáticamente</small>
                        </div>
                    </div>

                    {/* Información del usuario */}
                    <div className="user-info">
                        <div className="info-item">
                            <label className="info-label">Email</label>
                            <div className="info-value email-value">{user?.email}</div>
                            <span className="info-note">El email no se puede cambiar</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nombre de usuario</label>
                            <input
                                type="text"
                                name="username"
                                className="input"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Tu nombre de usuario"
                                maxLength="30"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Teléfono</label>
                            <input
                                type="tel"
                                name="phone"
                                className="input"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+1 234 567 8900"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Biografía</label>
                            <textarea
                                name="bio"
                                className="input textarea bio-textarea"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Cuéntanos algo sobre ti..."
                                rows="3"
                                maxLength="140"
                            />
                            <div className="char-counter">
                                {formData.bio.length}/140
                            </div>
                        </div>
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
                            disabled={loading}
                        >
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}