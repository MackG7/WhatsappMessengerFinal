// MemberList.jsx
import { useChat } from "../../../context/chatContext";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import DeleteConfirmationModal from "../../DeleteConfirmationModal/DeleteConfirmationModal.jsx";

export default function MemberList({ group, onUpdate }) {
    const { removeMember, leaveGroup } = useChat();
    const { user } = useAuth();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    const isCurrentUserAdmin = group.members?.some(member => 
        member.userId?._id === user._id && member.role === 'admin'
    );

    const isCurrentUserCreator = group.createdBy?._id === user._id;

    const canRemoveMembers = isCurrentUserAdmin || isCurrentUserCreator;

    const handleRemoveMemberClick = (member, e) => {
        e.stopPropagation();
        setSelectedMember(member);
        setShowDeleteModal(true);
    };

    const handleConfirmRemove = async () => {
        if (!selectedMember || !group) return;
        
        let result;
        
        if (selectedMember.userId?._id === user._id) {
            // El usuario está intentando salir del grupo
            result = await leaveGroup(group._id);
        } else {
            // El admin está intentando remover a otro miembro
            result = await removeMember(group._id, selectedMember.userId?._id);
        }

        if (result.success) {
            console.log("✅ Miembro removido:", selectedMember.userId?.username);
            if (onUpdate) onUpdate();
        } else {
            console.error("❌ Error removiendo miembro:", result.error);
            alert(result.error);
        }
        
        setShowDeleteModal(false);
        setSelectedMember(null);
    };

    const getMemberDisplayName = (member) => {
        return member.userId?.username || member.userId?.email || 'Usuario';
    };

    if (!group?.members || group.members.length === 0) {
        return (
            <div className="member-list-empty">
                <p>No hay miembros en este grupo</p>
            </div>
        );
    }

    return (
        <>
            <div className="member-list">
                <div className="member-list-header">
                    <h4>Miembros del grupo ({group.members.length})</h4>
                </div>
                
                {group.members.map((member) => {
                    const isSelf = member.userId?._id === user._id;
                    const isAdmin = member.role === 'admin';
                    const canRemove = canRemoveMembers && 
                        (isSelf || (!isSelf && (isCurrentUserCreator || !isAdmin)));

                    return (
                        <div key={member.userId?._id || member._id} className="member-item">
                            <div className="member-avatar">
                                {getMemberDisplayName(member).charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="member-info">
                                <div className="member-name">
                                    {getMemberDisplayName(member)}
                                    {isSelf && <span className="you-badge">Tú</span>}
                                    {isAdmin && <span className="admin-badge">Admin</span>}
                                    {group.createdBy?._id === member.userId?._id && 
                                     <span className="creator-badge">Creador</span>}
                                </div>
                                <div className="member-role">
                                    {isAdmin ? 'Administrador' : 'Miembro'}
                                </div>
                            </div>

                            {canRemove && (
                                <div className="member-actions">
                                    <button 
                                        className={`btn-remove-member ${isSelf ? 'btn-leave' : ''}`}
                                        onClick={(e) => handleRemoveMemberClick(member, e)}
                                        title={isSelf ? "Salir del grupo" : "Remover miembro"}
                                    >
                                        {isSelf ? "🚪" : "🗑️"}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedMember(null);
                }}
                onConfirm={handleConfirmRemove}
                itemType="member"
                itemName={group?.name}
                actionType="removeMember"
                memberName={selectedMember ? getMemberDisplayName(selectedMember) : ''}
                isSelf={selectedMember?.userId?._id === user._id}
            />
        </>
    );
}