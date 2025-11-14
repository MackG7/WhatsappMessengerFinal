import { useState, useEffect } from "react";
import "./Sidebar.css";
import UserProfileModal from "../UserProfileModal/UserProfileModal";
import ChatList from "../ChatList/ChatList";
import ContactList from "../ContactList/ContactList";
import GroupList from "../GroupList/GroupList";
import NewContactModal from "../NewContactModal/NewContactModal";
import NewGroupModal from "../NewGroupModal/NewGroupModal";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import { useChat } from "../../../context/chatContext"; 

export default function Sidebar({ mobileOpen, setMobileOpen }) {
    const [activeTab, setActiveTab] = useState("chats");
    const [contacts, setContacts] = useState([]);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const { user, logout } = useAuth();
    const { groups, loadGroups, chats, loadChats } = useChat();

    const closeMobileSidebar = () => setMobileOpen(false);
    const openMobileSidebar = () => setMobileOpen(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const resContacts = await api.get("/contacts");
            setContacts(resContacts.data.data || []);

            await loadGroups();
            await loadChats();

        } catch (err) {
            console.error("❌ Error loading sidebar:", err);
        }
    };

    const getInitials = () => {
        if (user?.username) return user.username.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return "U";
    };

    const handleSidebarAction = () => {
        if (window.innerWidth < 600) closeMobileSidebar();
    };

    return (
        <aside className={`wa-sidebar ${mobileOpen ? "open" : ""}`}>
            
            {/* HEADER */}
            <div className="wa-sidebar-header">

                {/* BOTÓN VOLVER SOLO EN MÓVIL */}
                <button 
                    className="back-btn"
                    onClick={closeMobileSidebar}
                >
                    ←
                </button>

                {/* Avatar + User info */}
                <div 
                    className="user-profile-header"
                    onClick={() => {
                        setShowProfileModal(true);
                        handleSidebarAction();
                    }}
                >
                    <div className="user-avatar-small">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="avatar-img" />
                        ) : (
                            <div className="avatar-initials">{getInitials()}</div>
                        )}
                    </div>
                    <div className="user-info-header">
                        <div className="user-name">{user?.username || user?.email}</div>
                        <div className="user-status">En línea</div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="header-actions">
                    <button 
                        className="new-invite-btn" 
                        onClick={() => {
                            window.location.href = "/invite";
                            handleSidebarAction();
                        }}
                    >
                        Invitar
                    </button>

                    <button 
                        className="wa-sidebar-logout" 
                        onClick={() => {
                            logout();
                            handleSidebarAction();
                        }}
                    >
                        Salir
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="wa-sidebar-tabs">
                <button 
                    className={activeTab === "chats" ? "active" : ""} 
                    onClick={() => {
                        setActiveTab("chats");
                        handleSidebarAction();
                    }}
                >
                    Chats {chats?.length > 0 && `(${chats.length})`}
                </button>

                <button 
                    className={activeTab === "contacts" ? "active" : ""} 
                    onClick={() => {
                        setActiveTab("contacts");
                        handleSidebarAction();
                    }}
                >
                    Contactos {contacts.length > 0 && `(${contacts.length})`}
                </button>

                <button 
                    className={activeTab === "groups" ? "active" : ""} 
                    onClick={() => {
                        setActiveTab("groups");
                        handleSidebarAction();
                    }}
                >
                    Grupos {groups?.length > 0 && `(${groups.length})`}
                </button>
            </div>

            {/* CONTENIDO */}
            <div className="wa-sidebar-content">
                {activeTab === "chats" && (
                    <ChatList 
                        chats={chats || []} 
                        onChatSelect={handleSidebarAction}
                    />
                )}

                {activeTab === "contacts" && (
                    <ContactList 
                        contacts={contacts} 
                        onContactSelect={handleSidebarAction}
                    />
                )}

                {activeTab === "groups" && (
                    <GroupList 
                        groups={groups || []} 
                        onGroupSelect={handleSidebarAction}
                    />
                )}
            </div>

            {/* BOTÓN FLOTANTE */}
            {(activeTab === "contacts" || activeTab === "groups") && (
                <button
                    className="wa-sidebar-new"
                    onClick={() => {
                        activeTab === "contacts"
                            ? setShowContactModal(true)
                            : setShowGroupModal(true);
                    }}
                >
                    
                </button>
            )}

            {/* MODALES */}
            {showContactModal && (
                <NewContactModal
                    onClose={() => setShowContactModal(false)}
                    onSuccess={() => {
                        loadData();
                        handleSidebarAction();
                    }}
                />
            )}

            {showGroupModal && (
                <NewGroupModal
                    onClose={() => setShowGroupModal(false)}
                    onSuccess={() => {
                        loadData();
                        handleSidebarAction();
                    }}
                />
            )}

            {showProfileModal && (
                <UserProfileModal 
                    onClose={() => setShowProfileModal(false)} 
                    onSuccess={() => {
                        loadData();
                        handleSidebarAction();
                    }}
                />
            )}
        </aside>
    );
}
