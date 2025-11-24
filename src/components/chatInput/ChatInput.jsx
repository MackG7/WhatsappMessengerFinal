import "../../styles/chat.css";
import { useState } from "react";
import { useChat } from "../../context/chatContext";
import { Send } from "lucide-react";

export default function ChatInput() {
    const [message, setMessage] = useState("");
    const { sendMessage } = useChat();

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        await sendMessage(message);
        setMessage("");
    };

    return (
        <form className="wa-chat-input" onSubmit={handleSend}>
            <input
                type="text"
                className="wa-chat-input-field"
                placeholder="Escribe un mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="wa-send-btn">
                <Send size={20} />
            </button>
        </form>
    );
}
