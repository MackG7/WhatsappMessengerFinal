import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
    const { isAuthenticated, loading, user } = useContext(AuthContext);

    console.log("🔐 PrivateRoute estado:", {
        isAuthenticated,
        loading,
        user: user ? `Usuario: ${user.email}` : "No user",
        hasToken: !!localStorage.getItem("token")
    });

    if (loading) {
        console.log("⏳ PrivateRoute: Loading inicial...");
        return <div className="text-center text-white mt-10">Cargando...</div>;
    }

    if (!isAuthenticated) {
        console.log("🚫 PrivateRoute: No autenticado, redirigiendo a login");
        return <Navigate to="/login" replace />;
    }

    console.log("✅ PrivateRoute: Usuario autenticado, mostrando contenido");
    return children;
}