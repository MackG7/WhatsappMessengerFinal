import { useChat } from "../../../context/chatContext.jsx";
import { useState } from "react";
import DeleteConfirmationModal from "../../DeleteConfirmationModal/DeleteConfirmationModal.jsx";

export default function GroupList({ groups, onUpdate }) {
    const { selectGroup, selectedChat, deleteGroup, leaveGroup } = useChat();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const handleDeleteClick = (group, e) => {
        e.stopPropagation();
        setSelectedGroup(group);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedGroup) return;

        const isAdmin = isGroupAdmin(selectedGroup);

        const result = isAdmin
            ? await deleteGroup(selectedGroup._id)
            : await leaveGroup(selectedGroup._id);

        if (result.success) {
            onUpdate?.();
        }

        setShowDeleteModal(false);
        setSelectedGroup(null);
    };

    const isGroupAdmin = (group) => {
        if (!group?.members || !group?.createdBy?._id) return false;

        return group.members.some(
            (member) =>
                (member.userId?._id === group.createdBy._id ||
                    member.userId === group.createdBy._id) &&
                member.role === "admin"
        );
    };

    if (!groups?.length) {
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
                {groups.map((group) => {
                    const isActive = selectedChat?._id === group._id;
                    const isAdmin = isGroupAdmin(group);

                    return (
                        <div
                            key={group._id}
                            className={`group-item ${isActive ? "active" : ""}`}
                            onClick={() => selectGroup(group)}
                        >
                            {/* Avatar */}
                            <div className="group-avatar">
                                {group.name?.charAt(0).toUpperCase() || "G"}
                            </div>

                            {/* NOMBRE + TACHO EN LA MISMA FILA */}
                            <div className="wa-group-mid">
                                <div className="wa-group-top-row">
                                    <div className="wa-group-name">
                                        {group.name || "Grupo sin nombre"}
                                    </div>

                                    <button
                                        className="btn-delete-group"
                                        onClick={(e) => handleDeleteClick(group, e)}
                                        title={isAdmin ? "Eliminar grupo" : "Salir del grupo"}
                                    >
                                        {isAdmin ? "🗑️" : "🚪"}
                                    </button>
                                </div>

                                <div className="wa-group-preview">
                                    {group.members?.length || 0} miembros
                                </div>
                            </div>
                        </div>
                    );
                })}
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
                actionType={
                    selectedGroup && isGroupAdmin(selectedGroup)
                        ? "delete"
                        : "leave"
                }
            />
        </>
    );
}
