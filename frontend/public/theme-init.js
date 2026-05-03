(() => {
	try {
		const root = document.documentElement;
		let isDark = false;
		try {
			const raw = localStorage.getItem("cermont-ui");
			if (raw) {
				const parsed = JSON.parse(raw);
				isDark = parsed?.state?.theme === "dark";
			}
		} catch {
			/* ignore parse errors */
		}
		if (!isDark) {
			isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		}
		root.classList.toggle("dark", isDark);
		root.style.colorScheme = isDark ? "dark" : "light";
	} catch {
		/* ignore storage or matchMedia errors during bootstrap */
	}
})();
