(() => {
	let storedTheme = null;
	let prefersDark = false;

	try {
		storedTheme = localStorage.getItem("cermont-theme");
		prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	} catch (error) {
		console.error("Theme initialization failed", error);
	}

	document.documentElement.classList.toggle(
		"dark",
		storedTheme === "dark" || (!storedTheme && prefersDark),
	);
})();
