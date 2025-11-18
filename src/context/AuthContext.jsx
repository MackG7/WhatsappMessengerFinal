import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");

            if (token && userData) {
                try {
                    setUser(JSON.parse(userData));
                    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                    await verifyToken();
                } catch (error) {
                    console.error("Error checking auth:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const verifyToken = async () => {
        try {
            await api.get("auth/verify");
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error("Token verification failed:", error);
                logout();
            }
        }
    };

    const register = async (username, email, password) => {
        try {
            setAuthLoading(true);
            setError(null);

            const { data } = await api.post("auth/register", { 
                username, 
                email, 
                password 
            });

            if (data.success) {
                return login(email, password);
            } else {
                throw new Error(data.message || "Error en el registro");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Error de conexión";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setAuthLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setAuthLoading(true);
            setError(null);

            console.log("🔐 Intentando login con:", { email });

            const { data } = await api.post("auth/login", { email, password });

            // 👉 EMAIL NO EXISTE → ir a REGISTRO
            if (data.message === "email_not_found") {
                console.warn("📌 Email no existe. Redirigiendo a registro...");
                window.location.href = `/register?email=${encodeURIComponent(email)}`;
                return { success: false, redirect: true };
            }

            // 👉 CONTRASEÑA INCORRECTA
            if (data.message === "wrong_password") {
                throw new Error("La contraseña es incorrecta");
            }

            // 👉 EMAIL NO VERIFICADO
            if (data.message === "email_not_verified") {
                throw new Error("Tu email no está verificado. Revisa tu bandeja o spam.");
            }

            if (!data.success) {
                throw new Error(data.message || "Error en el login");
            }

            console.log("✅ Login exitoso:", data);

            // Guardar en storage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setUser(data.user);
            api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

            return { success: true, user: data.user };

        } catch (error) {
            console.error("❌ Error en login:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error de conexión";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setAuthLoading(false);
        }
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
        localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setError(null);
        delete api.defaults.headers.common["Authorization"];
    };

    const clearError = () => setError(null);

    const value = {
        user,
        login,
        register,
        logout,
        loading,
        authLoading,
        error,
        updateUser,
        clearError,
        isAuthenticated: !!user && !!localStorage.getItem("token")
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
};
