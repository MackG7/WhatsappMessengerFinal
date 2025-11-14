import "./Tabs.css";

export default function Tabs({ activeTab, onChange }) {

    return (
        <div className="wa-tabs">
            <div 
                className={`wa-tab ${activeTab === "chats" ? "active" : ""}`}
                onClick={() => onChange("chats")}
            >
                Chats
            </div>

            <div 
                className={`wa-tab ${activeTab === "contacts" ? "active" : ""}`}
                onClick={() => onChange("contacts")}
            >
                Contactos
            </div>

            <div 
                className={`wa-tab ${activeTab === "groups" ? "active" : ""}`}
                onClick={() => onChange("groups")}
            >
                Grupos
            </div>
        </div>
    );
}
