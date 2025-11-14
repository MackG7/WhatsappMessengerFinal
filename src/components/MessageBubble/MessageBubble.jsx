import "./MessageBubble.css";
import { useChat } from "../../context/chatContext";
import { Check, CheckCheck } from "lucide-react";

export default function MessageBubble({ message }) {
    const { meContact } = useChat();
    const isMine = message.sender?._id === meContact?._id;

    // Simular estados: si tiene readBy > 1 = leído
    const isRead = message.readBy && message.readBy.length > 1;

    return (
        <div className={`wa-bubble-row ${isMine ? "mine" : "theirs"}`}>
            <div className={`wa-bubble ${isMine ? "mine" : "theirs"}`}>
                <div className="wa-bubble-text">{message.content || message.message}</div>

                <div className="wa-bubble-footer">
                    <span className="wa-bubble-time">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>

                    {isMine && (
                        <span className={`wa-checks ${isRead ? "read" : ""}`}>
                            {isRead ? <CheckCheck size={14} /> : <Check size={14} />}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
