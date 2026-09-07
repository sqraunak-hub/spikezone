import { useEffect } from "react";

// Applies per-page <title> and head tags directly to the DOM.
//
// Replaces react-helmet, which silently applied nothing under React 18
// (UNSAFE_componentWillMount), and react-helmet-async, which mounted its
// provider without ever emitting tags in this app. This does the same job for
// a client-rendered SPA with no library in the way.
//
// Tags are *updated in place*, not appended. index.html now ships a static
// title and description so a crawler that does not run JS still gets
// something; appending would leave two <meta name="description"> on every
// rendered page and let the crawler pick. The original value of any tag we
// touch is remembered, so leaving a route restores the static baseline
// instead of stripping the page bare.

const MANAGED = "data-szseo";
const BASELINE = new Map();

const remember = (selector) => {
  if (BASELINE.has(selector)) return;
  const el = document.head.querySelector(selector);
  BASELINE.set(selector, el ? el.getAttribute("content") : null);
};

export default function useSeo({
  title,
  description,
  canonical,
  image,
  url,
  type = "website",
  keywords,
  robots,
  twitterCard = "summary_large_image",
} = {}) {
  useEffect(() => {
    const baseTitle = document.title;
    if (title) document.title = title;

    const touched = [];

    const set = (selector, tag, attrs, content) => {
      remember(selector);
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement(tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        el.setAttribute(MANAGED, "");
        document.head.appendChild(el);
      }
      el.setAttribute(tag === "link" ? "href" : "content", content);
      touched.push(selector);
    };

    const meta = (key, attr, content) => {
      if (!content) return;
      set(`meta[${attr}="${key}"]`, "meta", { [attr]: key }, content);
    };

    meta("description", "name", description);
    meta("og:description", "property", description);
    meta("twitter:description", "name", description);
    meta("og:title", "property", title);
    meta("twitter:title", "name", title);
    meta("og:url", "property", url || canonical);
    meta("og:image", "property", image);
    meta("twitter:image", "name", image);
    meta("keywords", "name", keywords);
    // The SPA rewrite answers every unknown path with 200, so a dead URL looks
    // like a real page to a crawler. NotFound passes noindex to keep those
    // out of the index — the only signal available without server-side routing.
    meta("robots", "name", robots);
    meta("og:type", "property", type);
    meta("twitter:card", "name", twitterCard);

    if (canonical) {
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        link.setAttribute(MANAGED, "");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    return () => {
      document.title = baseTitle;
      touched.forEach((selector) => {
        const el = document.head.querySelector(selector);
        if (!el) return;
        const original = BASELINE.get(selector);
        // A tag that shipped in index.html goes back to its own value; one we
        // created for this route is removed.
        if (original === null || original === undefined) {
          if (el.hasAttribute(MANAGED)) el.parentNode.removeChild(el);
        } else {
          el.setAttribute("content", original);
        }
      });
      // The canonical is per-route by definition: a stale one pointing at the
      // previous page is worse than none.
      const link = document.head.querySelector(`link[rel="canonical"][${MANAGED}]`);
      if (link) link.parentNode.removeChild(link);
    };
  }, [title, description, canonical, image, url, type, keywords, robots, twitterCard]);
}
