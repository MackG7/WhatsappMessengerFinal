import { useState } from "react";
import "./DeleteConfirmationModal.css";

export default function DeleteConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    itemType, 
    itemName,
    actionType = "delete", // "delete", "leave", "removeMember"
    memberName = "", // Nombre del miembro para removeMember
    isSelf = false // Si es auto-eliminación
}) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
        onClose();
    };

    const getTitle = () => {
        switch (actionType) {
            case 'leave':
                return "Confirmar salida";
            case 'removeMember':
                return "Remover miembro";
            default:
                return "Confirmar eliminación";
        }
    };

    const getMessage = () => {
        if (actionType === "leave") {
            switch (itemType) {
                case 'group':
                    return `¿Estás seguro de que quieres salir del grupo "${itemName}"?`;
                default:
                    return `¿Estás seguro de que quieres salir?`;
            }
        }

        if (actionType === "removeMember") {
            if (isSelf) {
                return `¿Estás seguro de que quieres salir del grupo "${itemName}"?`;
            }
            return `¿Estás seguro de que quieres remover a ${memberName} del grupo "${itemName}"?`;
        }

        switch (itemType) {
            case 'message':
                return '¿Estás seguro de que quieres eliminar este mensaje?';
            case 'chat':
                return `¿Estás seguro de que quieres eliminar el chat con ${itemName}?`;
            case 'contact':
                return `¿Estás seguro de que quieres eliminar a ${itemName} de tus contactos?`;
            case 'group':
                return `¿Estás seguro de que quieres eliminar el grupo "${itemName}"?`;
            case 'member':
                return `¿Estás seguro de que quieres eliminar a ${itemName} del grupo?`;
            default:
                return '¿Estás seguro de que quieres eliminar este elemento?';
        }
    };

    const getWarningText = () => {
        if (actionType === "removeMember" && !isSelf) {
            return "El miembro perderá acceso al grupo.";
        }
        return "Esta acción no se puede deshacer.";
    };

    const getButtonText = () => {
        if (loading) {
            if (actionType === "leave" || (actionType === "removeMember" && isSelf)) {
                return "Saliendo...";
            } else if (actionType === "removeMember") {
                return "Removiendo...";
            } else {
                return "Eliminando...";
            }
        }

        if (actionType === "leave" || (actionType === "removeMember" && isSelf)) {
            return "Salir";
        } else if (actionType === "removeMember") {
            return "Remover";
        } else {
            return "Eliminar";
        }
    };

    const getButtonClass = () => {
        if (actionType === "leave" || (actionType === "removeMember" && isSelf)) {
            return "btn-leave";
        } else if (actionType === "removeMember") {
            return "btn-remove";
        } else {
            return "btn-delete";
        }
    };

    return (
        <div className="modal-overlay">
            <div className="delete-confirmation-modal">
                <div className="delete-modal-header">
                    <h3>{getTitle()}</h3>
                </div>
                
                <div className="delete-modal-body">
                    <div className="warning-icon">⚠️</div>
                    <p>{getMessage()}</p>
                    <p className="warning-text">{getWarningText()}</p>
                </div>
                
                <div className="delete-modal-actions">
                    <button 
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        className={getButtonClass()}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {getButtonText()}
                    </button>
                </div>
            </div>
        </div>
    );
}