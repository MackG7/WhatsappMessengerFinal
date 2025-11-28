import SidebarDesktop from "../components/Side_bar/Sidebar/Sidebar.jsx";
import SidebarMobile from "../components/Side_bar/Sidebar/Sidebar.jsx";
import ChatWindow from "../components/chatWindow/ChatWindow.jsx";
import "../styles/layout.css";

export default function Layout() {
    return (
        <div className="wa-layout">
            {/* SIDEBAR DESKTOP */}
            <div className="wa-sidebar-desktop">
                <SidebarDesktop />
            </div>

            {/* SIDEBAR MOBILE */}
            <div className="wa-sidebar-mobile" style={{ display: "none" }}>
                <SidebarMobile />
            </div>

            {/* PANEL DEL CHAT */}
            <div className="wa-chat-panel">
                <ChatWindow />
            </div>
        </div>
    );
}
