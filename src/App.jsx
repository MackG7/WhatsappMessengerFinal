import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/chatContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import PrivateRoute from "./routes/PrivateRoute";
import Home from "./pages/Home";
import InviteRegisterPage from "./pages/InviteRegisterPage";
import InvitePage from "./pages/InvitePage"


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            {/* Nueva ruta */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/chat/:chatId" element={<ChatPage />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/chat/:id" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/invite" element={<InvitePage />} />
            <Route path="/invite/:token" element={<InviteRegisterPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}




