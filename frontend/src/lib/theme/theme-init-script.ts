export const THEME_INIT_SCRIPT = `(() => {
  var storedTheme = null;
  try {
    storedTheme = localStorage.getItem("cermont-theme");
  } catch (error) {}
  document.documentElement.classList.toggle(
    "dark",
    storedTheme === "dark",
  );
})();`;
