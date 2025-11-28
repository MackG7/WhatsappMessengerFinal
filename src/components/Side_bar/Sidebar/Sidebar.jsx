import { useState, useEffect } from "react";
import "./Sidebar.css";
import UserProfileModal from "../UserProfileModal/UserProfileModal";
import ContactList from "../ContactList/ContactList";
import GroupList from "../GroupList/GroupList";
import NewContactModal from "../NewContactModal/NewContactModal";
import NewGroupModal from "../NewGroupModal/NewGroupModal";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import { useChat } from "../../../context/chatContext";

export default function Sidebar({ onClose }) {
    const [activeTab, setActiveTab] = useState("contacts");
    const [contacts, setContacts] = useState([]);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const { groups, loadGroups, selectGroup } = useChat();
    const { user, logout } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const resContacts = await api.get("/contacts");
            setContacts(resContacts.data.data || []);
            await loadGroups();
        } catch (error) {
            console.error("Error loading sidebar:", error);
        }
    };

    const getInitials = () => {
        if (user?.username) return user.username.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return "U";
    };

    const handleSidebarAction = () => {
        if (window.innerWidth < 751 && onClose) {
            setTimeout(() => {
                onClose();
            }, 300);
        }
    };

    const handleGroupSelect = async (group) => {
        await selectGroup(group);
        handleSidebarAction();
    };

    const handleContactSelect = async (contact) => {
        console.log("Contacto seleccionado:", contact);
        handleSidebarAction();
    };

    return (
        <aside className="wa-sidebar">
            <div className="wa-sidebar-header">
                <div className="wa-sidebar-header-left">
                    <button className="close-sidebar-btn" onClick={onClose}>
                        ✕
                    </button>

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
                </div>

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

            <div className="wa-sidebar-tabs">
                <button
                    className={activeTab === "contacts" ? "active" : ""}
                    onClick={() => {
                        setActiveTab("contacts");
                    }}
                >
                    Contactos {contacts.length > 0 && `(${contacts.length})`}
                </button>

                <button
                    className={activeTab === "groups" ? "active" : ""}
                    onClick={() => {
                        setActiveTab("groups");
                    }}
                >
                    Grupos {groups?.length > 0 && `(${groups.length})`}
                </button>
            </div>

            <div className="wa-sidebar-content">
                {activeTab === "contacts" && (
                    <ContactList
                        contacts={contacts}
                        onContactSelect={handleContactSelect}
                    />
                )}

                {activeTab === "groups" && (
                    <GroupList
                        groups={groups || []}
                        onGroupSelect={handleGroupSelect} 
                        onUpdate={loadData}
                    />
                )}
            </div>

            {(activeTab === "contacts" || activeTab === "groups") && (
                <button
                    className="wa-sidebar-new"
                    onClick={() => {
                        activeTab === "contacts"
                            ? setShowContactModal(true)
                            : setShowGroupModal(true);
                        handleSidebarAction();
                    }}
                >
                    +
                </button>
            )}

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