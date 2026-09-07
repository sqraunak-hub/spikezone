import HttpService from "./HttpService";
import useUserStore from "../store/userStore";

export async function registerUser(data) {
  const response = HttpService.post("register/", data);
  return response;
}

export async function loginUser(data) {
  const response = HttpService.post("login/", data);
  return response;
}

// ---- Passwordless login -----------------------------------------------------
//
// Two flows, one response shape. Both /phone/verify/ and /email/verify-login/
// return { token: {access, refresh}, user, is_new, msg }, which is the same
// shape /login/ returns, so applyAuthSession() below is the single place that
// knows how a session gets established.

// Normalizes the number server-side and reports whether this provider sends
// the SMS itself. With Firebase it does not - the browser SDK does - but the
// call still runs first so the client and server agree on the exact E.164
// string that will be matched later.
export async function requestPhoneOtp(phone) {
  return HttpService.post("phone/request-otp/", { phone });
}

// `idToken` comes from the Firebase SDK after confirmationResult.confirm().
// name/email are only read by the server when this number is brand new.
export async function verifyPhoneLogin({ idToken, name, email }) {
  return HttpService.post("phone/verify/", {
    id_token: idToken,
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
  });
}

export async function requestEmailLoginOtp(email) {
  return HttpService.post("email/request-otp/", { email });
}

export async function verifyEmailLogin({ email, otp }) {
  return HttpService.post("email/verify-login/", { email, otp });
}

/**
 * Establish the session from any login response.
 *
 * Kept here rather than in each screen because the screens had drifted: one
 * wrote the token then set the user store, another wrote the token and never
 * touched the store, so whether the header showed your name depended on which
 * form you had used.
 */
export function applyAuthSession(data) {
  const access = data?.token?.access;
  if (access) {
    localStorage.setItem("token", access);
  }
  // The refresh token is what lets the app renew a 60-minute access token
  // instead of logging the customer out mid-checkout.
  if (data?.token?.refresh) {
    localStorage.setItem("refreshToken", data.token.refresh);
  }
  if (data?.user) {
    useUserStore.getState().setUser(data.user);
  }
  return data?.user;
}

/**
 * Fill in name/email after a first OTP login.
 *
 * A phone-first account starts with a placeholder address, so this is how the
 * customer gets a real one on file - which matters before checkout, since
 * order confirmations go to it.
 */
export async function updateProfile(userId, fields) {
  const token = localStorage.getItem("token");
  const response = await HttpService.patch(`profiles/update/${userId}/`, fields, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response?.data) {
    useUserStore.getState().setUser(response.data);
  }
  return response;
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  useUserStore.getState().clearUser();
}
