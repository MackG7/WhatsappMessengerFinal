import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ThemeProvider from "./providers/ThemeProvider.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/chatContext";
import "./styles/theme.css";
import "./styles/global.css";



ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
  <AuthProvider>
    <ChatProvider>
      <App />
    </ChatProvider>
  </AuthProvider>
</ThemeProvider>
);
