// Central app configuration — values come from .env (see .env.example).
// Vite only exposes variables prefixed with VITE_.

const stripTrailingSlash = (url) => (url || "").replace(/\/+$/, "");

// Base host of the Django API, e.g. http://127.0.0.1:8001 or https://api.spikezone.in
export const API_HOST = stripTrailingSlash(
  import.meta.env.VITE_API_HOST || "http://127.0.0.1:8001"
);

// REST base used by almost every call (axios.defaults.baseURL)
export const API_BASE_URL = `${API_HOST}/api/user/`;

// Public origin of the storefront itself — used for canonical/OG URLs.
export const SITE_URL = stripTrailingSlash(
  import.meta.env.VITE_SITE_URL || "https://spikezone.in"
);

// Route builders — every internal product/category link goes through these so
// the URL scheme lives in exactly one place.
export const categoryPath = (catSlug) => `/products/${catSlug}`;
export const productPath = (catSlug, productSlug) =>
  catSlug ? `/products/${catSlug}/${productSlug}` : `/products/${productSlug}`;
