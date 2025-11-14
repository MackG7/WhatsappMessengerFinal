import { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

export const ChatContext = createContext();

export function ChatProvider({ children }) {
    const { user, token, isAuthenticated } = useAuth();

    const [chats, setChats] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const resetChatState = useCallback(() => {
        setChats([]);
        setGroups([]);
        setSelectedChat(null);
        setMessages([]);
        setError(null);
    }, []);

    useEffect(() => {
        if (isAuthenticated && token) {
            loadChats();
            loadGroups();
        } else {
            resetChatState();
        }
    }, [isAuthenticated, token, resetChatState]);

    const loadGroups = async () => {
        try {
            const res = await api.get("/groups/my", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setGroups(res.data.data || []);
            } else {
                throw new Error(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    const joinGroup = async (groupId) => {
        try {
            const res = await api.post(
                `/groups/${groupId}/add-member`,
                { memberId: user._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                await loadGroups();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadChats = async () => {
        try {
            setLoading(true);

            const res = await api.get("/chat/my-chats", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setChats(res.data.data || []);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const createOrGetAndSelect = async (otherUserId) => {
        try {
            // 1. Buscar chat existente con ese usuario
            let existingChat = chats.find(chat =>
                chat.participants?.some(p => p._id === otherUserId)
            );

            // 2. Si no existe, crearlo
            if (!existingChat) {
                const res = await api.post(
                    "/chat",
                    { participantId: otherUserId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (res.data.success) {
                    existingChat = res.data.data;
                    setChats(prev => [existingChat, ...prev]);
                } else {
                    throw new Error(res.data.message || "No se pudo crear el chat");
                }
            }

            // 3. Seleccionarlo
            return await selectChat(existingChat);

        } catch (err) {
            console.error("❌ createOrGetAndSelect error:", err);
            setError(err.response?.data?.message || err.message);
            return null;
        }
    };


    const buildSelected = useCallback(
        (chatDoc) => {
            if (!chatDoc?._id) return null;

            const isGroup = chatDoc.members !== undefined || chatDoc.isGroup;

            return {
                _id: chatDoc._id,
                participants: chatDoc.participants || [],
                members: chatDoc.members || [],
                me: user?._id,
                isGroup,
                name: chatDoc.name,
                description: chatDoc.description,
                createdBy: chatDoc.createdBy,
                ...chatDoc
            };
        },
        [user?._id]
    );

    const loadMessages = useCallback(
        async (chatId) => {
            if (!chatId) return;
            try {
                setLoading(true);

                const res = await api.get(`/chat/${chatId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data.success) {
                    setMessages(res.data.data?.messages || []);
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    const selectGroup = async (group) => {
        try {
            setLoading(true);

            const groupId = group._id || group;

            const res = await api.get(`/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (window.innerWidth < 600) {
                document.querySelector(".wa-sidebar")?.classList.remove("open");
            }

            if (res.data.success) {
                const groupData = res.data.data;

                setGroups(prev => {
                    const filtered = prev.filter(g => g._id !== groupData._id);
                    return [groupData, ...filtered];
                });

                const sel = buildSelected(groupData);
                setSelectedChat(sel);
                setMessages([]);

                await loadMessages(sel._id);
                return sel;
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
        return null;
    };

    const selectChat = async (chatOrId) => {
        try {
            let chatDoc = null;

            if (typeof chatOrId === "string") {
                chatDoc = chats.find(c => c._id === chatOrId);

                if (!chatDoc) {
                    const res = await api.get("/chat/my-chats", {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (res.data.success) {
                        const updated = res.data.data;
                        setChats(updated);
                        chatDoc = updated.find(c => c._id === chatOrId);
                    }
                }
            } else {
                chatDoc = chatOrId;
            }

            if (!chatDoc) throw new Error("Chat no encontrado");

            const sel = buildSelected(chatDoc);
            setSelectedChat(sel);
            setMessages([]);

            if (window.innerWidth < 600) {
                document.querySelector(".wa-sidebar")?.classList.remove("open");
            }

            await loadMessages(sel._id);
            return sel;
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    const sendMessage = async (content) => {
        if (!selectedChat?._id) return { success: false };

        try {
            const tempMessage = {
                _id: `temp-${Date.now()}`,
                chatId: selectedChat._id,
                sender: user,
                content: content.trim(),
                createdAt: new Date().toISOString(),
                pending: true
            };

            setMessages(prev => [...prev, tempMessage]);

            const res = await api.post(
                `/chat/${selectedChat._id}/message`,
                { content: content.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                const newMsg = res.data.data;

                setMessages(prev =>
                    prev.map(m => (m._id === tempMessage._id ? newMsg : m))
                );

                return { success: true, data: newMsg };
            }
        } catch (err) {
            console.error(err);
        }

        return { success: false };
    };

    const removeMember = async (groupId, memberId) => {
        try {
            const response = await api.delete(`/groups/${groupId}/members`, {
                data: { memberId }
            });

            if (response.data.success) {
                setGroups(prev => prev.map(group => {
                    if (group._id === groupId) {
                        return {
                            ...group,
                            members: group.members.filter(m =>
                                m.userId?._id !== memberId && m.userId !== memberId
                            )
                        };
                    }
                    return group;
                }));

                if (memberId === user._id) {
                    setGroups(prev => prev.filter(group => group._id !== groupId));
                    if (selectedChat?._id === groupId) {
                        setSelectedChat(null);
                        setMessages([]);
                    }
                }

                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const deleteGroup = async (groupId) => {
        try {
            const res = await api.delete(`/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setGroups(prev => prev.filter(g => g._id !== groupId));

                if (selectedChat?._id === groupId) {
                    setSelectedChat(null);
                    setMessages([]);
                }

                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const leaveGroup = async (groupId) => {
        try {
            const res = await api.delete(`/groups/${groupId}/members`, {
                data: { memberId: user._id },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setGroups(prev => prev.filter(g => g._id !== groupId));

                if (selectedChat?._id === groupId) {
                    setSelectedChat(null);
                    setMessages([]);
                }

                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };


    const refreshGroups = async () => {
        await loadGroups();
    };

    const ensureSelectedChat = async (chatId) => {
        if (selectedChat?._id === chatId) return selectedChat;

        const foundGroup = groups.find(g => g._id === chatId);
        if (foundGroup) return selectGroup(foundGroup);

        const foundChat = chats.find(c => c._id === chatId);
        if (foundChat) return selectChat(foundChat);

        await loadChats();
        await loadGroups();

        return null;
    };

    const clearError = () => setError(null);

    const value = {
        chats,
        groups,
        selectedChat,
        messages,
        loading,
        error,
        loadChats,
        loadGroups,
        selectChat,
        selectGroup,
        ensureSelectedChat,
        sendMessage,
        loadMessages,
        clearError,
        resetChatState,
        refreshGroups,
        joinGroup,
        deleteGroup,
        leaveGroup,
        removeMember,
        createOrGetAndSelect,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat debe usarse dentro de un ChatProvider");
    return context;
}
