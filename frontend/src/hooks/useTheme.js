import { useState, useEffect } from "react";

/**
 * Theme management hook
 * Persists theme preference to localStorage and syncs with system preference
 */
export function useTheme() {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first
        const saved = localStorage.getItem("smartsplit-theme");
        if (saved) return saved;

        // Fallback to system preference
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light";
    });

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("smartsplit-theme", theme);
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => {
            // Only auto-switch if no explicit preference saved
            if (!localStorage.getItem("smartsplit-theme")) {
                setTheme(e.matches ? "dark" : "light");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme((current) => (current === "light" ? "dark" : "light"));
    };

    return { theme, toggleTheme, setTheme };
}

export default useTheme;
