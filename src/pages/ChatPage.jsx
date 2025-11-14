import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Side_bar/Sidebar/Sidebar";
import ChatWindow from "../components/chatWindow/ChatWindow";
import { useChat } from "../context/chatContext";

export default function ChatPage() {
    const { chatId } = useParams(); 
    const { selectedChat, ensureSelectedChat } = useChat();

    useEffect(() => {
        if (chatId) ensureSelectedChat(chatId);
    }, [chatId, ensureSelectedChat]);

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200">
            <Sidebar />
            {selectedChat ? (
                <ChatWindow />
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    Cargando chat...
                </div>
            )}
        </div>
    );
}
