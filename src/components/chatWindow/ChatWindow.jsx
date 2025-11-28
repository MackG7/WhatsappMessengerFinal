import { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/chatContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/chat.css";

export default function ChatWindow() {
    const { selectedChat, messages, sendMessage } = useChat();
    const { user } = useAuth();
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null);

    /* ===============================
       AUTO-SCROLL SIEMPRE QUE CAMBIAN MENSAJES
    =============================== */
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedChat]);

    if (!selectedChat) return null;

    /* ===============================
       ENVIAR MENSAJE
    =============================== */
    const handleSubmit = (e) => {
        e.preventDefault();
        const content = text.trim();
        if (!content) return;

        sendMessage(content);
        setText("");

        // Bajamos al final
        setTimeout(scrollToBottom, 50);
    };

    /* ===============================
       FORMATEAR HORA
    =============================== */
    const formatTime = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    /* ===============================
       OBTENER CONTENIDO SEGURO
    =============================== */
    const getContent = (msg) => {
        return (
            msg.content ||   // direct-message y group-message actual
            msg.message ||   // fallback
            msg.text ||      // fallback
            msg.body ||      // fallback
            ""               // si no existe
        );
    };

    /* ===============================
       DETERMINAR SI ES MÍO
    =============================== */
    const isMine = (msg) => {
        const senderId =
            msg.sender?._id ||
            msg.senderId ||
            msg.sender ||
            msg.from ||
            "";

        return senderId.toString() === user?._id?.toString();
    };

    return (
        <div className="chat-window">

            {/* ======================== */}
            {/* CHAT BODY */}
            {/* ======================== */}
            <div className="wa-chat-body">
                <div className="wa-messages-list">

                    {messages?.length > 0 ? (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`wa-message-row ${isMine(msg) ? "mine" : "theirs"}`}
                            >
                                <div className="wa-message-bubble">
                                    <div className="wa-message-text">
                                        {getContent(msg)}
                                    </div>
                                    <div className="wa-message-meta">
                                        {formatTime(msg.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="wa-empty-msg">
                            No hay mensajes todavía. ¡Envía el primero! 💬
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* ======================== */}
            {/* CHAT INPUT */}
            {/* ======================== */}
            <form className="wa-chat-input" onSubmit={handleSubmit}>
                <input
                    className="wa-chat-input-field"
                    type="text"
                    placeholder="Escribe un mensaje"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button className="wa-send-btn" type="submit">
                    ➤
                </button>
            </form>

        </div>
    );
}
