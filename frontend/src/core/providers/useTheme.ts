"use client";

import { createContext, useContext } from "react";

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

export function useTheme(): ThemeContextValue {
	return useContext(ThemeContext);
}
