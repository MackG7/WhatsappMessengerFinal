// src/store/themeStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
    persist(
        (set, get) => ({
            theme: "dark", // default A (dark)
            setTheme: (t) => set({ theme: t === "light" ? "light" : "dark" }),
            toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
        }),
        {
            name: "wa-theme",
            version: 1,
        }
    )
);
