import "./ContactList.css";
import { useChat } from "../../../context/chatContext";
import { useState } from "react";
import DeleteConfirmationModal from "../../DeleteConfirmationModal/DeleteConfirmationModal.jsx";

export default function ContactList({ contacts, onUpdate }) {
    const { startDirectChat, deleteContact } = useChat(); 
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    const startChat = async (contact) => {
        const contactId = contact.contactUser?._id || contact._id;
        await startDirectChat(contactId); 
    };

    const handleDeleteClick = (contact, e) => {
        e.stopPropagation();
        setSelectedContact(contact);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedContact) return;

        const result = await deleteContact(selectedContact._id);

        if (result.success) {
            console.log("✅ Contacto eliminado:", getContactName(selectedContact));
            onUpdate && onUpdate();
        } else {
            console.error("❌ Error eliminando contacto:", result.error);
            alert(result.error);
        }

        setShowDeleteModal(false);
        setSelectedContact(null);
    };

    const getContactName = (contact) => {
        return (
            contact.alias ||
            contact.contactUser?.username ||
            contact.contactUser?.email
        );
    };

    return (
        <>
            <div className="wa-contactlist">
                {contacts.length === 0 && (
                    <div className="wa-no-contacts">No tienes contactos aún</div>
                )}

                {contacts.map((contact) => {
                    const name = getContactName(contact);
                    const displayEmail = contact.contactUser?.email;
                    const initials = name?.charAt(0).toUpperCase();

                    return (
                        <div
                            key={contact._id}
                            className="wa-contact-item"
                            onClick={() => startChat(contact)}
                        >
                            <div className="wa-contact-avatar">{initials}</div>

                            <div className="wa-contact-mid">
                                <div className="wa-contact-name">{name}</div>
                                <div className="wa-contact-email">{displayEmail}</div>
                            </div>

                            <div className="wa-contact-actions">
                                <button
                                    className="btn-delete-contact"
                                    onClick={(e) => handleDeleteClick(contact, e)}
                                    title="Eliminar contacto"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedContact(null);
                }}
                onConfirm={handleConfirmDelete}
                itemType="contact"
                itemName={selectedContact ? getContactName(selectedContact) : ""}
            />
        </>
    );
}
