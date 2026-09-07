/**
 * Keeps the admin session alive, and fails loudly when it cannot.
 *
 * The access token lasts 60 minutes and nothing ever renewed it. Writing a
 * blog post takes longer than that, so the token would quietly die while the
 * page sat open and every save came back 401. On 2026-08-21 that cost a
 * finished post: Publish was pressed 18 times in three minutes, the server
 * answered 401 to all 18, and the screen gave no usable explanation.
 *
 * So: on a 401, swap the dead access token for a fresh one using the refresh
 * token and replay the request. The user sees nothing at all, which is the
 * point.
 *
 * When the refresh token is gone too, this deliberately does NOT redirect to
 * the login screen. Navigating away from a half-written post to "fix" the
 * session destroys the very work the person was trying to save. It explains
 * what happened instead and leaves the page - and the text - alone.
 */
import axios from "axios";
import { API_BASE_URL } from "../Utils/appConstant";

// One shared refresh, so a screen that fires several requests at once does not
// start several refreshes and race them.
let inFlightRefresh = null;

const isAuthCall = (url = "") =>
  url.includes("token/refresh") || url.endsWith("login/");

function explainDeadSession() {
  window.alert(
    "Aapki login session khatam ho gayi hai.\n\n" +
      "Jo aapne yahan likha hai wo safe hai - ye page band mat kijiye.\n\n" +
      "1. Nayi tab me admin.spikezone.in/login kholiye aur login kijiye - seedha /login, warna purana token hone ki wajah se dashboard khul jata hai\n" +
      "2. Is page pe wapas aaiye\n" +
      "3. Save / Publish dobara dabaiye"
  );
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const response = error.response;
    const original = error.config;

    if (!response || response.status !== 401 || !original) {
      return Promise.reject(error);
    }
    // A 401 from the login or refresh call itself is the real answer, not
    // something to retry.
    if (isAuthCall(original.url || "") || original._retriedAfterRefresh) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) {
      explainDeadSession();
      return Promise.reject(error);
    }

    try {
      if (!inFlightRefresh) {
        inFlightRefresh = axios.post(`${API_BASE_URL}token/refresh/`, {
          refresh,
        });
      }
      const refreshed = await inFlightRefresh;
      inFlightRefresh = null;

      const access = refreshed.data.access;
      localStorage.setItem("token", access);
      // The API rotates refresh tokens when configured to; keep the new one.
      if (refreshed.data.refresh) {
        localStorage.setItem("refreshToken", refreshed.data.refresh);
      }

      original._retriedAfterRefresh = true;
      original.headers = {
        ...(original.headers || {}),
        Authorization: `Bearer ${access}`,
      };
      return axios(original);
    } catch (refreshError) {
      inFlightRefresh = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      explainDeadSession();
      return Promise.reject(error);
    }
  }
);
