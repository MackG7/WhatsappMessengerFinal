import { useChat } from "../../../context/chatContext.jsx";
import { useState } from "react";
import DeleteConfirmationModal from "../../DeleteConfirmationModal/DeleteConfirmationModal.jsx";
import AddMemberModal from "../AddMemberModal/AddMemberModal.jsx";
import "./GroupList.css";

export default function GroupList({ groups, onGroupSelect, onUpdate }) {
    const { selectedChat, deleteGroup, leaveGroup } = useChat();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedGroupForMembers, setSelectedGroupForMembers] = useState(null);

    const handleDeleteClick = (group, e) => {
        e.stopPropagation();
        setSelectedGroup(group);
        setShowDeleteModal(true);
    };

    const handleAddMembers = (group, e) => {
        e.stopPropagation();
        setSelectedGroupForMembers(group);
        setShowAddMemberModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedGroup) return;

        const isAdmin = isGroupAdmin(selectedGroup);

        try {
            if (isAdmin) {
                await deleteGroup(selectedGroup._id);
            } else {
                await leaveGroup(selectedGroup._id);
            }

            onUpdate?.();
        } catch (error) {
            console.error("Error al eliminar/salir del grupo:", error);
        } finally {
            setShowDeleteModal(false);
            setSelectedGroup(null);
        }
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

    const handleGroupClick = (group) => {
        onGroupSelect?.(group);
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
                    const memberCount = group.members?.length || 0;

                    return (
                        <div
                            key={group._id}
                            className={`group-item ${isActive ? "active" : ""}`}
                            onClick={() => handleGroupClick(group)}
                        >
                            <div className="group-avatar">
                                {group.name?.charAt(0).toUpperCase() || "G"}
                            </div>

                            <div className="wa-group-mid">
                                <div className="wa-group-top-row">
                                    <div className="wa-group-name">
                                        {group.name || "Grupo sin nombre"}
                                        {isAdmin && <span className="admin-badge">Admin</span>}
                                    </div>

                                    <div className="group-actions">
                                        {isAdmin && (
                                            <button
                                                className="btn-add-members"
                                                onClick={(e) => handleAddMembers(group, e)}
                                                title="Agregar miembros"
                                            >
                                                👥+
                                            </button>
                                        )}

                                        <button
                                            className="btn-delete-group"
                                            onClick={(e) => handleDeleteClick(group, e)}
                                            title={isAdmin ? "Eliminar grupo" : "Salir del grupo"}
                                        >
                                            {isAdmin ? "🗑️" : "🚪"}
                                        </button>
                                    </div>
                                </div>

                                <div className="wa-group-preview">
                                    {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
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

            {showAddMemberModal && (
                <AddMemberModal
                    group={selectedGroupForMembers}
                    onClose={() => {
                        setShowAddMemberModal(false);
                        setSelectedGroupForMembers(null);
                    }}
                    onSuccess={() => {
                        onUpdate?.();
                    }}
                />
            )}
        </>
    );
}