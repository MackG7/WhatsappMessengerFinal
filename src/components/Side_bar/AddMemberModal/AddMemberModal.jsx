import { useState, useEffect } from "react";
import api from "../../../api/axios";
import "./AddMemberModal.css";

export default function AddMemberModal({ group, onClose, onSuccess }) {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, group]);

    const loadUsers = async () => {
        try {
            const response = await api.get("/users"); 
            setUsers(response.data.data || []);
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    const filterUsers = () => {
        const currentMemberIds = group.members?.map(member =>
            member.userId._id || member.userId
        ) || [];

        const filtered = users.filter(user => {
            const isAlreadyMember = currentMemberIds.includes(user._id);
            const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase());
            return !isAlreadyMember && matchesSearch;
        });

        setFilteredUsers(filtered);
    };

    const toggleUserSelection = (user) => {
        setSelectedUsers(prev => {
            const isSelected = prev.some(u => u._id === user._id);
            if (isSelected) {
                return prev.filter(u => u._id !== user._id);
            } else {
                return [...prev, user];
            }
        });
    };

    const addMembersToGroup = async () => {
        if (selectedUsers.length === 0) return;

        setLoading(true);
        try {
            for (const user of selectedUsers) {
                await api.post(`/groups/${group._id}/members/add`, {
                    userId: user._id
                });
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error adding members:", error);
            alert("Error al agregar miembros al grupo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="add-member-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Agregar miembros a "{group.name}"</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="search-section">
                        <input
                            type="text"
                            placeholder="Buscar usuarios por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="users-list"> 
                        {filteredUsers.map(user => ( 
                            <div
                                key={user._id}
                                className={`user-item ${selectedUsers.some(u => u._id === user._id) ? 'selected' : ''}`} 
                                onClick={() => toggleUserSelection(user)}
                            >
                                <div className="user-avatar">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Avatar" />
                                    ) : (
                                        <span>{user.username?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="user-info"> 
                                    <div className="user-name">{user.username}</div>
                                    <div className="user-email">{user.email}</div>
                                </div>
                                <div className="selection-checkbox">
                                    {selectedUsers.some(u => u._id === user._id) ? "✓" : ""}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="no-users"> 
                            {searchTerm ? "No se encontraron usuarios" : "No hay usuarios disponibles para agregar"}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <div className="selected-count">
                        {selectedUsers.length} usuario(s) seleccionado(s)
                    </div>
                    <div className="action-buttons">
                        <button className="cancel-btn" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            className="add-btn"
                            onClick={addMembersToGroup}
                            disabled={selectedUsers.length === 0 || loading}
                        >
                            {loading ? "Agregando..." : `Agregar (${selectedUsers.length})`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}