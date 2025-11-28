import { useState } from "react";
import "./DeleteConfirmationModal.css";
import { AlertTriangle } from "lucide-react";

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    itemType,
    itemName,
    actionType = "delete",
    memberName = "",
    isSelf = false
}) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
        onClose();
    };

    const titleMap = {
        delete: "Confirmar eliminación",
        leave: "Salir del grupo",
        removeMember: isSelf ? "Salir del grupo" : "Remover miembro"
    };

    const messageMap = {
        delete: {
            chat: `¿Eliminar el chat con ${itemName}?`,
            contact: `¿Eliminar a ${itemName} de tus contactos?`,
            group: `¿Eliminar el grupo "${itemName}"?`,
            message: "¿Eliminar este mensaje?",
            default: "¿Eliminar este elemento?"
        },
        leave: {
            group: `¿Querés salir del grupo "${itemName}"?`,
            default: "¿Querés salir?"
        },
        removeMember: {
            self: `¿Querés salir del grupo "${itemName}"?`,
            member: `¿Remover a ${memberName} del grupo "${itemName}"?`
        }
    };

    const getMessage = () => {
        if (actionType === "leave") {
            return messageMap.leave[itemType] || messageMap.leave.default;
        }
        if (actionType === "removeMember") {
            return isSelf
                ? messageMap.removeMember.self
                : messageMap.removeMember.member;
        }
        return messageMap.delete[itemType] || messageMap.delete.default;
    };

    const getButtonText = () => {
        if (loading) {
            return actionType === "leave"
                ? "Saliendo..."
                : actionType === "removeMember"
                ? "Removiendo..."
                : "Eliminando...";
        }
        if (actionType === "leave") return "Salir";
        if (actionType === "removeMember") return "Remover";
        return "Eliminar";
    };

    const buttonClassMap = {
        delete: "btn-delete",
        leave: "btn-leave",
        removeMember: "btn-remove"
    };

    return (
        <div className="modal-overlay">
            <div className="delete-confirmation-modal">
                
                {/* HEADER */}
                <div className="delete-modal-header">
                    <h3>{titleMap[actionType]}</h3>
                </div>

                {/* BODY */}
                <div className="delete-modal-body">
                    <AlertTriangle className="warning-icon-svg" size={48} />
                    <p>{getMessage()}</p>
                    <p className="warning-text">Esta acción no se puede deshacer.</p>
                </div>

                {/* BUTTONS */}
                <div className="delete-modal-actions">
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </button>

                    <button
                        className={buttonClassMap[actionType]}
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
