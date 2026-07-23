"use client";

import { createContext } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
	theme: "light",
	toggleTheme: () => {},
	setTheme: () => {},
});

// useTheme replaced by @/lib/theme/ThemeProvider
