import { create } from "zustand";

type Theme = "light" | "dark";

interface UIState {
	sidebarOpen: boolean;
	sidebarCollapsed: boolean;
	chatOpen: boolean;
	theme: Theme;
	activeModal: string | null;
	modalData: unknown;

	toggleSidebar: () => void;
	setSidebarOpen: (open: boolean) => void;
	toggleSidebarCollapsed: () => void;
	setSidebarCollapsed: (collapsed: boolean) => void;
	toggleChat: () => void;
	setChatOpen: (open: boolean) => void;
	hydrateTheme: () => void;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	openModal: (name: string, data?: unknown) => void;
	closeModal: () => void;
}

function getStoredTheme(): Theme {
	if (typeof window === "undefined") {
		return "light";
	}
	const stored = localStorage.getItem("cermont-theme");
	if (stored === "dark" || stored === "light") {
		return stored;
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
	if (typeof window === "undefined") {
		return;
	}

	document.documentElement.classList.toggle("dark", theme === "dark");
	localStorage.setItem("cermont-theme", theme);
}

export const useUIStore = create<UIState>((set) => ({
	sidebarOpen: false,
	sidebarCollapsed: false,
	chatOpen: false,
	theme: "light",
	activeModal: null,
	modalData: null,

	toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
	setSidebarOpen: (open) => set({ sidebarOpen: open }),
	toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
	setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
	toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
	setChatOpen: (open) => set({ chatOpen: open }),
	hydrateTheme: () => {
		const theme = getStoredTheme();
		applyTheme(theme);
		set({ theme });
	},
	setTheme: (theme) => {
		applyTheme(theme);
		set({ theme });
	},
	toggleTheme: () =>
		set((s) => {
			const next = s.theme === "light" ? "dark" : "light";
			applyTheme(next);
			return { theme: next };
		}),
	openModal: (name, data = null) => set({ activeModal: name, modalData: data }),
	closeModal: () => set({ activeModal: null, modalData: null }),
}));
