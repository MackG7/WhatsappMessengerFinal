import "./ChatHeader.css";
import { useChat } from "../../context/chatContext";
import { useAuth } from "../../context/AuthContext";

export default function ChatHeader({ toggleSidebar }) {
    const { selectedChat } = useChat();
    const { user } = useAuth();

    if (!selectedChat) return null;

    let title = "Chat";
    let avatar = "?";

    if (!selectedChat.isGroup) {
        const other = selectedChat.participants.find((p) => p._id !== user._id);
        title = other?.username || other?.email;
        avatar = title?.charAt(0)?.toUpperCase();
    } else {
        title = selectedChat.name;
        avatar = title?.charAt(0)?.toUpperCase();
    }

    return (
        <div className="wa-chat-header">

            {/* === BOTÓN HAMBURGER SOLO EN MOBILE === */}
            <button
                className="hamburger-btn"
                onClick={toggleSidebar}
            >
                ☰
            </button>

            {/* === IZQUIERDA === */}
            <div className="wa-chat-header-left">
                <div className="wa-chat-header-avatar">{avatar}</div>
                <div className="wa-chat-header-info">
                    <div className="wa-chat-header-name">{title}</div>
                    <div className="wa-chat-header-status">
                        {selectedChat.isGroup ? "Grupo" : "En línea"}
                    </div>
                </div>
            </div>

            {/* === DERECHA === */}
            <div className="wa-chat-header-actions">
                <button className="chat-action-btn">
                    <i className="fa-solid fa-video"></i>
                </button>
                <button className="chat-action-btn">
                    <i className="fa-solid fa-phone"></i>
                </button>
                <button className="chat-action-btn">
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
            </div>
        </div>
    );

    <button className="back-btn" onClick={toggleSidebar}>
        <i className="fa-solid fa-arrow-left"></i>
    </button>
}
