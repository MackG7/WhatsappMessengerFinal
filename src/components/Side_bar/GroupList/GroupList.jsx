import { useChat } from "../../../context/chatContext.jsx";
import { useState } from "react";
import DeleteConfirmationModal from "../../DeleteConfirmationModal/DeleteConfirmationModal.jsx";

export default function GroupList({ groups, onUpdate }) {
    const { selectGroup, selectedChat, deleteGroup, leaveGroup } = useChat();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    console.log("🎯 GroupList - Grupos recibidos:", groups);

    const handleDeleteClick = (group, e) => {
        e.stopPropagation(); // Evitar que se seleccione el grupo
        setSelectedGroup(group);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedGroup) return;
        
        const result = await deleteGroup(selectedGroup._id);
        if (result.success) {
            console.log("✅ Grupo eliminado:", selectedGroup.name);
            if (onUpdate) onUpdate();
        } else {
            console.error("❌ Error eliminando grupo:", result.error);
            alert(result.error);
        }
        setShowDeleteModal(false);
        setSelectedGroup(null);
    };

    const isGroupAdmin = (group) => {
        return group.members?.some(member => 
            member.userId?._id === group.createdBy?._id && 
            member.role === 'admin'
        );
    };

    if (!groups || groups.length === 0) {
        return (
            <div className="empty-groups">
                <p>No tienes grupos aún</p>
                <p className="empty-subtitle">Crea tu primer grupo para empezar a chatear</p>
            </div>
        );
    }

    return (
        <>
            <div className="group-list">
                {groups.map((group) => (
                    <div
                        key={group._id}
                        className={`group-item ${selectedChat?._id === group._id ? 'active' : ''}`}
                        onClick={() => {
                            console.log("🖱️ Click en grupo:", group.name);
                            selectGroup(group);
                        }}
                    >
                        <div className="group-avatar">
                            {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div className="group-info">
                            <div className="group-name">
                                {group.name || 'Grupo sin nombre'}
                                {isGroupAdmin(group) && <span className="admin-badge">Admin</span>}
                            </div>
                            <div className="group-preview">
                                {group.members?.length || 0} miembros
                            </div>
                        </div>
                        <div className="group-actions">
                            <button 
                                className="btn-delete-group"
                                onClick={(e) => handleDeleteClick(group, e)}
                                title={isGroupAdmin(group) ? "Eliminar grupo" : "Salir del grupo"}
                            >
                                {isGroupAdmin(group) ? "🗑️" : "🚪"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedGroup(null);
                }}
                onConfirm={handleConfirmDelete}
                itemType="group"
                itemName={selectedGroup?.name}
                actionType={selectedGroup && isGroupAdmin(selectedGroup) ? "delete" : "leave"}
            />
        </>
    );
}
