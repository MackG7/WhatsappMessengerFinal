import { useThemeStore } from "../../store/themeStore";

export default function ThemeToggle() {
    const theme = useThemeStore(s => s.theme);
    const toggle = useThemeStore(s => s.toggleTheme);

    return (
        <button onClick={toggle} title="Cambiar tema" style={{ marginRight: "10px" }}>
            {theme === "dark" ? "☀️" : "🌙"}
        </button>
    );
}
