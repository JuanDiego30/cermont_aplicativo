import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

type ModalName = "confirmDelete" | "editResource" | "viewDetails" | string;

type ModalPayload = Record<string, Record<string, string>>;

interface UIState {
	sidebarOpen: boolean;
	sidebarCollapsed: boolean;
	chatOpen: boolean;
	theme: Theme;
	activeModal: ModalName | null;
	modalData: ModalPayload | null;

	toggleSidebar: () => void;
	setSidebarOpen: (open: boolean) => void;
	toggleSidebarCollapsed: () => void;
	setSidebarCollapsed: (collapsed: boolean) => void;
	toggleChat: () => void;
	setChatOpen: (open: boolean) => void;
	hydrateTheme: () => void;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	openModal: (name: ModalName, data?: ModalPayload) => void;
	closeModal: () => void;
}

function applyThemeToDocument(theme: Theme): void {
	if (typeof window === "undefined") {
		return;
	}
	document.documentElement.classList.toggle("dark", theme === "dark");
}

function getInitialTheme(): Theme {
	if (typeof window === "undefined") {
		return "light";
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const useUIStore = create<UIState>()(
	persist(
		(set, get) => ({
			sidebarOpen: false,
			sidebarCollapsed: false,
			chatOpen: false,
			theme: getInitialTheme(),
			activeModal: null,
			modalData: null,

			toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
			setSidebarOpen: (open) => set({ sidebarOpen: open }),
			toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
			setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
			toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
			setChatOpen: (open) => set({ chatOpen: open }),
			hydrateTheme: () => {
				const { theme } = get();
				applyThemeToDocument(theme);
			},
			setTheme: (theme) => {
				applyThemeToDocument(theme);
				set({ theme });
			},
			toggleTheme: () =>
				set((s) => {
					const next = s.theme === "light" ? "dark" : "light";
					applyThemeToDocument(next);
					return { theme: next };
				}),
			openModal: (name, data) => set({ activeModal: name, modalData: data ?? null }),
			closeModal: () => set({ activeModal: null, modalData: null }),
		}),
		{
			name: "cermont-ui",
			partialize: (state) => ({
				theme: state.theme,
				sidebarCollapsed: state.sidebarCollapsed,
			}),
		},
	),
);
