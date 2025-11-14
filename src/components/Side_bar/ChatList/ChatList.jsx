import "./ChatList.css";
import { useChat } from "../../../context/chatContext.jsx";
import { useState } from "react";
import DeleteConfirmationModal from "../../DeleteConfirmationModal/DeleteConfirmationModal.jsx";

export default function ChatList({ chats, onUpdate }) {
    const { selectChat, selectedChat, deleteChat } = useChat();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedChatItem, setSelectedChatItem] = useState(null);

    const getInitials = (chat) => {
        if(chat.isGroup) return chat.name?.charAt(0)?.toUpperCase();

        const other = chat.participants?.find(p => p._id !== chat.me);
        const text = other?.alias || other?.username || other?.email || "?";
        return text.charAt(0).toUpperCase();
    };

    const getDisplayName = (chat) => {
        if(chat.isGroup) return chat.name;

        const other = chat.participants?.find(p => p._id !== chat.me);
        return other?.alias || other?.username || other?.email;
    };

    const handleDeleteClick = (chat, e) => {
        e.stopPropagation(); // Evitar que se seleccione el chat
        setSelectedChatItem(chat);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedChatItem) return;
        
        const result = await deleteChat(selectedChatItem._id);
        if (result.success) {
            console.log("✅ Chat eliminado:", getDisplayName(selectedChatItem));
            if (onUpdate) onUpdate();
        } else {
            console.error("❌ Error eliminando chat:", result.error);
            alert(result.error);
        }
        setShowDeleteModal(false);
        setSelectedChatItem(null);
    };

    return(
        <>
            <div className="wa-chatlist">
                {(!chats || chats.length === 0) && (
                    <div className="wa-chatlist-empty">No hay chats</div>
                )}

                {chats?.map(chat => {
                    const isSelected = selectedChat?._id === chat._id;
                    const lastMsg = chat.lastMessage?.content || chat.lastMessage?.message || "Sin mensajes";
                    const initials = getInitials(chat);
                    const name = getDisplayName(chat);

                    return(
                        <div key={chat._id}
                            className={`wa-chat-item ${isSelected ? "selected" : ""}`}
                            onClick={() => selectChat(chat._id)}
                        >
                            <div className="wa-chat-avatar">{initials}</div>

                            <div className="wa-chat-mid">
                                <div className="wa-chat-name">{name}</div>
                                <div className="wa-chat-last">{lastMsg}</div>
                            </div>

                            <div className="wa-chat-actions">
                                <button 
                                    className="btn-delete-chat"
                                    onClick={(e) => handleDeleteClick(chat, e)}
                                    title="Eliminar chat"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedChatItem(null);
                }}
                onConfirm={handleConfirmDelete}
                itemType="chat"
                itemName={selectedChatItem ? getDisplayName(selectedChatItem) : ''}
            />
        </>
    );
}
