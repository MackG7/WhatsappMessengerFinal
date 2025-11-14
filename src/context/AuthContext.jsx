import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [error, setError] = useState(null);

    // Verificar si hay token en localStorage al cargar
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");

            if (token && userData) {
                try {
                    setUser(JSON.parse(userData));
                    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                    await verifyToken(token);
                } catch (error) {
                    console.error("Error checking auth:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const verifyToken = async (token) => {
        try {
            await api.get("/auth/verify");
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
            
            const { data } = await api.post("/auth/register", { 
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

            const { data } = await api.post("/auth/login", { email, password });

            if (!data.success || data.message?.includes("incorrectos")) {
                throw new Error(data.message || "Error en el login");
            }
            console.log("✅ Login exitoso:", data);

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