// Central app configuration — values come from .env (see .env.example).
// CRA only exposes variables prefixed with REACT_APP_.

const stripTrailingSlash = (url) => (url || "").replace(/\/+$/, "");

// Base host of the Django API, e.g. http://127.0.0.1:8001 or https://api.spikezone.in
export const API_HOST = stripTrailingSlash(
  process.env.REACT_APP_API_HOST || "http://127.0.0.1:8001"
);

// REST base used by almost every call
export const API_BASE_URL = `${API_HOST}/api/user/`;

// Public storefront URL (used for "View Website" links)
export const SITE_URL = stripTrailingSlash(
  process.env.REACT_APP_SITE_URL || "http://localhost:5175"
);
