"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTheme } from "@/lib/theme/ThemeProvider";

const subscribeMounted = (_callback: () => void) => () => {};
const getSnapshotMounted = () => true;
const getServerSnapshotMounted = () => false;

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const mounted = useSyncExternalStore(
		subscribeMounted,
		getSnapshotMounted,
		getServerSnapshotMounted,
	);

	const handleToggle = () => {
		if (theme === "light") {
			setTheme("dark");
		} else if (theme === "dark") {
			setTheme("system");
		} else {
			setTheme("light");
		}
	};

	if (!mounted) {
		return (
			<button
				type="button"
				aria-label="Cambiar tema"
				title="Cambiar tema"
				className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
				disabled
			>
				<Monitor className="size-4" aria-hidden="true" />
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={handleToggle}
			className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
			aria-label={`Cambiar tema. Actual: ${theme}`}
			title={`Cambiar tema. Actual: ${theme}`}
		>
			{theme === "light" && <Sun className="size-4" />}
			{theme === "dark" && <Moon className="size-4" />}
			{theme === "system" && <Monitor className="size-4" />}
		</button>
	);
}
