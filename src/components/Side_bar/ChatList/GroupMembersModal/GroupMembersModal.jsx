// GroupMembersModal.jsx
import { useState } from "react";
import { useChat } from "../../../context/ChatContext";
import MemberList from "../MemberList/MemberList";
import "./GroupMembersModal.css";

export default function GroupMembersModal({ group, onClose, onUpdate }) {
    const { refreshGroups } = useChat();
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        await refreshGroups();
        if (onUpdate) onUpdate();
        setLoading(false);
    };

    if (!group) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal members-modal">
                <div className="modal-header">
                    <h3>Gestionar miembros de {group.name}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="modal-content">
                    <MemberList group={group} onUpdate={handleUpdate} />
                </div>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn btn-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}