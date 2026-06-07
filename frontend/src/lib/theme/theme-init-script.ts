/**
 * @packageDocumentation
 * Theme initialization script.
 *
 * This script runs before the page renders to set the `dark` class on
 * the `<html>` element, preventing a flash of unstyled content (FOUC)
 * when the user prefers dark mode or has explicitly chosen a theme.
 *
 * It is inlined via `next/script` with `beforeInteractive` in
 * `app/layout.tsx` so it never depends on a network request. The
 * previous implementation loaded `/theme-init.js` as an external
 * file, which failed offline because the request is dispatched before
 * the Service Worker has claimed the page.
 */

export const THEME_INIT_SCRIPT = `(() => {
  var storedTheme = null;
  var prefersDark = false;
  try {
    storedTheme = localStorage.getItem("cermont-theme");
    prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (error) {
    /* localStorage or matchMedia unavailable; fall through with defaults */
  }
  document.documentElement.classList.toggle(
    "dark",
    storedTheme === "dark" || (!storedTheme && prefersDark),
  );
})();`;
