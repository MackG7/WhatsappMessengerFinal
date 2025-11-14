// src/providers/ThemeProvider.jsx
import { useEffect } from "react";
import { useThemeStore } from "../store/themeStore";

export default function ThemeProvider({ children }) {
    const theme = useThemeStore((s) => s.theme);

    useEffect(() => {
        const root = document.documentElement; // <html>
        root.setAttribute("data-theme", theme); // 'dark' | 'light'
    }, [theme]);

    return children;
}
