import { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

export const ChatContext = createContext();

export function ChatProvider({ children }) {
    const { user, token, isAuthenticated } = useAuth();

    const [groups, setGroups] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /* ====================================
       RESET
    ==================================== */
    const resetChatState = useCallback(() => {
        setGroups([]);
        setSelectedChat(null);
        setMessages([]);
        setError(null);
    }, []);

    /* ====================================
       LOAD INITIAL
    ==================================== */
    useEffect(() => {
        if (isAuthenticated && token) loadGroups();
        else resetChatState();
    }, [isAuthenticated, token, resetChatState]);

    /* ====================================
       LOAD GROUPS
    ==================================== */
    const loadGroups = async () => {
        try {
            const res = await api.get("/groups/my", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setGroups(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    /* ====================================
       LOAD MESSAGES (auto detect type)
    ==================================== */
    const loadMessages = useCallback(async () => {
        if (!selectedChat) return;
        const chatId = selectedChat._id;

        try {
            setLoading(true);

            /* DIRECT */
            if (selectedChat.type === "direct") {
                const otherUser = selectedChat.participants.find(
                    (p) => p !== user._id
                );

                const res = await api.get(`/direct-message/${otherUser}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setMessages(res.data.data || []);
                return;
            }

            /* GROUP */
            if (selectedChat.type === "group") {
                const res = await api.get(`/group-message/${chatId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setMessages(res.data.data || []);
                return;
            }

        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedChat, token, user?._id]);

    /* ========================================
       DIRECT CHAT
    ========================================= */
    const startDirectChat = async (otherUserId) => {
        try {
            await api.get(`/direct-message/${otherUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const chat = {
                _id: otherUserId,
                type: "direct",
                participants: [user._id, otherUserId]
            };

            setSelectedChat(chat);
            setMessages([]);

            // Esperamos a que se actualice selectedChat
            setTimeout(() => loadMessages(), 50);

            return chat;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            return null;
        }
    };

    /* ========================================
       SELECT GROUP
    ========================================= */
    const selectGroup = async (group) => {
        try {
            const groupId = group._id || group;

            const res = await api.get(`/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const sel = {
                    ...res.data.data,
                    type: "group",
                    members: res.data.data.members || []
                };

                setSelectedChat(sel);
                setMessages([]);

                setTimeout(() => loadMessages(), 50);
                return sel;
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }

        return null;
    };

    /* ========================================
       SEND MESSAGE
    ========================================= */
    const sendMessage = async (text) => {
        if (!selectedChat?._id) return { success: false };

        const content = text.trim();
        if (!content) return { success: false };

        try {
            /* DIRECT */
            if (selectedChat.type === "direct") {
                const otherUser = selectedChat.participants.find(
                    (p) => p !== user._id
                );

                const res = await api.post(
                    `/direct-message`,
                    { receiverId: otherUser, message: content },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (res.data.ok) {
                    setMessages((prev) => [...prev, res.data.data]);
                    return { success: true };
                }
            }

            /* GROUP */
            if (selectedChat.type === "group") {
                const res = await api.post(
                    `/group-message/${selectedChat._id}/message`,
                    { message: content },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (res.data.success) {
                    setMessages((prev) => [...prev, res.data.data]);
                    return { success: true };
                }
            }

        } catch (err) {
            console.error(err);
        }

        return { success: false };
    };

    /* ========================================
       EXPORT
    ========================================= */
    return (
        <ChatContext.Provider
            value={{
                groups,
                selectedChat,
                messages,
                loading,
                error,
                loadGroups,
                startDirectChat,
                selectGroup,
                sendMessage,
                loadMessages,
                resetChatState,
                clearError: () => setError(null)
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat debe usarse dentro de ChatProvider");
    return context;
}
