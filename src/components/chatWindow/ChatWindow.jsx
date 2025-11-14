import "./ChatWindow.css";
import { useChat } from "../../context/chatContext";
import MessageBubble from "../MessageBubble/MessageBubble";
import ChatInput from "../chatInput/ChatInput";
import ChatHeader from "./ChatHeader";  

export default function ChatWindow({ toggleSidebar }) {
    const { selectedChat, messages } = useChat();

    if (!selectedChat)
        return (
            <div className="chat-window-empty">
                <div className="chat-window-placeholder">
                    <h2>Selecciona un chat para comenzar</h2>
                    <p>O crea un nuevo chat o grupo desde la barra lateral</p>
                </div>
            </div>
        );

    return (
        <div className="chat-window">
            {/* HEADER */}
            <ChatHeader toggleSidebar={toggleSidebar} />

            {/* BODY */}
            <div className="wa-chat-body">
                {messages.length === 0 ? (
                    <div className="wa-empty-msg">No hay mensajes todavía</div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble key={msg._id} message={msg} />
                    ))
                )}
            </div>

            <ChatInput />
        </div>
    );
}
