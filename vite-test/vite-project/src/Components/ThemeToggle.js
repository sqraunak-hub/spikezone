import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";
import "../Assets/CSS/theme-toggle.css";

const KEY = "sz-theme";

/**
 * Light is the default, deliberately - not prefers-color-scheme. A visitor who
 * has never chosen gets the light site, and only an explicit choice is stored.
 *
 * The same rule is duplicated as an inline script in index.html so the stored
 * theme is applied before first paint; without it a dark-mode visitor gets a
 * white flash while the bundle boots.
 */
export const readStoredTheme = () => {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

/**
 * Swapping the theme repoints ~40 custom properties at once, and every element
 * carrying `transition: color` or `transition: background` would animate to
 * its new value on its own schedule — the page cross-fades in pieces. The
 * class suppresses transitions for the duration of the swap so the whole page
 * changes in one frame; two rAFs, so it is only dropped once the new values
 * have been painted.
 */
const applyTheme = (theme) => {
  const root = document.documentElement;
  root.classList.add("sz-theme-swapping");

  if (theme === "dark") root.dataset.theme = "dark";
  else delete root.dataset.theme;

  // rAF is throttled to a standstill in a background tab, and if the callback
  // never runs the class sticks and transitions stay dead site-wide. The
  // timeout is the backstop.
  const clear = () => root.classList.remove("sz-theme-swapping");
  requestAnimationFrame(() => requestAnimationFrame(clear));
  window.setTimeout(clear, 300);
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* private mode - the toggle still works for this session */
    }
  }, [theme]);

  const dark = theme === "dark";

  return (
    <button
      type="button"
      className="sz-theme-toggle"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <FaSun /> : <FaMoon />}
    </button>
  );
}
