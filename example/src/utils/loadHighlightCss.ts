const THEMES = {
  light:
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css",
  dark: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css",
};

const LINK_ID = "highlightjs-theme-style";

/**
 * Loads the appropriate highlight.js theme CSS based on the system color scheme.
 */
export function loadHighlightCss() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const href = isDark ? THEMES.dark : THEMES.light;

  let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;

  if (link) {
    if (link.href !== href) {
      link.href = href;
    }
  } else {
    link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}
