import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { API_HOST } from "../Utils/appConstant";
import useSeo from "../Utils/useSeo";

// Pulls per-route meta from the admin-managed seo.json and applies it.
const SEOHelmet = () => {
  const [meta, setMeta] = useState(null);
  const location = useLocation();

  // Slug without leading or trailing slashes. "/about/" and "/about" are the
  // same page and seo.json is keyed without either, so the trailing one has to
  // come off or the lookup misses.
  const slug = location.pathname.replace(/^\/+|\/+$/g, "") || "home";

  useEffect(() => {
    let cancelled = false;
    // The endpoint sends no Cache-Control, ETag or Last-Modified, so the
    // browser is free to cache it heuristically — and did: editing seo.json
    // changed nothing on screen until a hard reload. `no-cache` revalidates
    // every time and still gets a cheap 304 when nothing has changed. Same
    // treatment as content/index.json in Utils/contentPages.js.
    fetch(`${API_HOST}/seo-json/seo.json`, { cache: "no-cache" })
      .then((res) => res.json())
      .then((data) => {
        // Deliberately no fallback to the `home` entry. A route missing from
        // seo.json used to inherit it wholesale, which put
        // <link rel="canonical" href="https://spikezone.in/"> on the page and
        // told Google that page *is* the home page - /about/ served the About
        // content under the home title, description and canonical. Leaving
        // meta null falls through to the static baseline in index.html, which
        // claims nothing.
        if (!cancelled) setMeta(data[slug] || null);
      })
      .catch(() => {
        if (!cancelled) setMeta(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // og_image is deliberately not taken from seo.json. Every value in there is
  // dead: `home` points at "https://yourdomain.com/... (placeholder domain,
  // plus a stray quote) and the other twelve point at /images/og-*.jpg, which
  // do not exist — the SPA rewrite answers them with index.html, so they
  // return 200 with content-type text/html and every share card renders
  // broken. Falling through to the real /og-cover.jpg in index.html is
  // correct until actual per-page images are uploaded to /images/.
  useSeo({
    title: meta?.title,
    description: meta?.description,
    canonical: meta?.canonical_url,
    twitterCard: meta?.twitter_card || "summary_large_image",
  });

  return null;
};

export default SEOHelmet;
