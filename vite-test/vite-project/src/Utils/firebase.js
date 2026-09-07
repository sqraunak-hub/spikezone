// Firebase, loaded only when someone actually chooses to log in by mobile.
//
// The SDK is a few hundred KB and the storefront is a shop, not an app - most
// visitors never open the login page at all. So nothing here runs at import
// time: initFirebaseAuth() dynamically imports firebase/app and firebase/auth
// on first use, which keeps them in their own chunk instead of the main
// bundle. Everything below is idempotent, so calling it on every render of the
// login form is fine.
//
// These config values are public by design - they ship inside any web build
// and are not secrets. What actually protects the project is the SMS region
// policy (India only) and the authorized-domains list in the Firebase console.
//
// Heads up when testing locally: Firebase rejects phone sign-in outright when
// the page is served from the hostname `localhost`, on http and https alike,
// with auth/invalid-app-credential. Use https://spikezone.localtest.me:5175
// instead - see "Firebase phone auth does not work on localhost" in README.md.

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// True when the build has the keys. The login page reads this to decide
// whether to offer the mobile tab at all, rather than showing a button that
// fails the moment it is pressed.
export const isPhoneLoginConfigured = Boolean(
  FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.authDomain && FIREBASE_CONFIG.projectId
);

let authPromise = null;

// Resolves to { auth, RecaptchaVerifier, signInWithPhoneNumber }.
export function initFirebaseAuth() {
  if (!isPhoneLoginConfigured) {
    return Promise.reject(
      new Error("Mobile login is not configured for this build.")
    );
  }

  if (!authPromise) {
    authPromise = (async () => {
      const [{ initializeApp, getApps, getApp }, authModule] = await Promise.all([
        import("firebase/app"),
        import("firebase/auth"),
      ]);

      // getApps() guard: Vite's HMR re-runs this module on edit, and a second
      // initializeApp with the same name throws.
      const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
      const auth = authModule.getAuth(app);

      // Sends the SMS and renders the reCAPTCHA challenge in the user's own
      // language where Firebase supports it, instead of always English.
      auth.useDeviceLanguage();

      return {
        auth,
        RecaptchaVerifier: authModule.RecaptchaVerifier,
        signInWithPhoneNumber: authModule.signInWithPhoneNumber,
      };
    })();
  }

  return authPromise;
}

// Firebase error codes are not for humans. Anything unmapped falls through to
// a generic line rather than putting "auth/internal-error" in front of a
// customer.
const ERROR_MESSAGES = {
  "auth/invalid-phone-number": "That mobile number doesn't look right.",
  "auth/missing-phone-number": "Please enter your mobile number.",
  "auth/invalid-verification-code": "Wrong OTP. Please check and try again.",
  "auth/code-expired": "That OTP has expired. Please request a new one.",
  "auth/too-many-requests":
    "Too many attempts from this device. Please wait a few minutes and try again.",
  "auth/quota-exceeded":
    "We can't send OTPs right now. Please try email login instead.",
  "auth/captcha-check-failed":
    "Verification failed. Please reload the page and try again.",
  "auth/network-request-failed":
    "Network problem. Check your connection and try again.",
  // Raised when the number's country is outside the console's SMS region
  // policy - which for us is India-only, on purpose.
  "auth/unsupported-first-factor": "Only Indian mobile numbers are supported.",
  // Google rejected the reCAPTCHA token. Despite the name this is never about
  // our API key or service account - "app credential" here means the captcha
  // token, so retrying (which mints a fresh one) genuinely can succeed.
  "auth/invalid-app-credential":
    "Verification failed. Please reload the page and try again, or use email login.",
  "auth/internal-error":
    "Something went wrong at our SMS provider. Please try email login.",
  "auth/operation-not-allowed":
    "Mobile login is temporarily unavailable. Please use email login.",
  "auth/billing-not-enabled":
    "Mobile OTP is temporarily unavailable. Please use email login.",
};

export function firebaseErrorMessage(error) {
  const code = error?.code;

  // Always surface the raw code. The customer-facing strings above are
  // deliberately vague, which made live debugging guesswork - the console now
  // carries the one piece of information that actually identifies the fault.
  if (typeof console !== "undefined") {
    console.error("[SpikeZone] phone auth failed:", code || "(no code)", error?.message || error);
  }

  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  // Unmapped codes used to vanish behind a generic sentence. Showing the code
  // costs the customer nothing and turns a support message into a diagnosis.
  return `Could not send the OTP${code ? ` (${code})` : ""}. Please try again or use email login.`;
}
