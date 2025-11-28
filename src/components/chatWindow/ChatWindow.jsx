import { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/chatContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/chat.css";

export default function ChatWindow() {
    const { selectedChat, messages, sendMessage } = useChat();
    const { user } = useAuth();
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedChat]);

    if (!selectedChat) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const content = text.trim();
        if (!content) return;

        sendMessage(content);
        setText("");
        setTimeout(scrollToBottom, 50);
    };

    const formatTime = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getContent = (msg) => {
        return (
            msg.content ||
            msg.message ||
            msg.text ||
            msg.body ||
            ""
        );
    };

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
            <div className="chat-body">
                <div className="messages-list">
                    {messages?.length > 0 ? (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`message-row ${
                                    isMine(msg) ? "mine" : "theirs"
                                }`}
                            >
                                <div className="message-bubble">
                                    <div>{getContent(msg)}</div>
                                    <div className="message-meta">
                                        {formatTime(msg.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="wa-empty-msg">
                            No hay mensajes todavía.
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <form className="chat-input" onSubmit={handleSubmit}>
                <input
                    className="chat-input-field"
                    type="text"
                    placeholder="Escribe un mensaje"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button className="send-btn" type="submit">
                    ➤
                </button>
            </form>
        </div>
    );
}
