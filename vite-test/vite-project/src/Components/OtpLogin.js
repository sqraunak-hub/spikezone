import React, { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import OtpInput from "react18-otp-input";
import { toast } from "react-toastify";

import {
  applyAuthSession,
  requestEmailLoginOtp,
  requestPhoneOtp,
  updateProfile,
  verifyEmailLogin,
  verifyPhoneLogin,
} from "../Services/authService";
import {
  firebaseErrorMessage,
  initFirebaseAuth,
  isPhoneLoginConfigured,
} from "../Utils/firebase";
import "../Assets/CSS/otp-login.css";

const RESEND_SECONDS = 30;

// Read out of the API error envelope. The backend answers with {errors: "..."}
// via UserRenderer on some views and DRF's field-keyed dict on others, so both
// shapes have to be handled or the customer gets "[object Object]".
function apiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.errors === "string") return data.errors;
  if (typeof data.error === "string") return data.error;
  if (typeof data.detail === "string") return data.detail;

  const firstField = Object.values(data.errors || data)[0];
  if (Array.isArray(firstField) && typeof firstField[0] === "string") {
    return firstField[0];
  }
  if (typeof firstField === "string") return firstField;
  return fallback;
}

export default function OtpLogin({ onSuccess, onUsePassword }) {
  // Mobile is the default when it is configured; otherwise the tab is hidden
  // entirely and this falls back to email rather than offering a dead button.
  const [mode, setMode] = useState(isPhoneLoginConfigured ? "mobile" : "email");
  const [step, setStep] = useState("identify");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // What the server normalized the number to. Shown back to the user on the
  // OTP screen so they can see the SMS went where they meant it to.
  const [sentTo, setSentTo] = useState("");

  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Set after a first-time login when the account still has no real name or
  // email - drives the small completion form.
  const [newUser, setNewUser] = useState(null);
  const [profile, setProfile] = useState({ name: "", email: "" });

  const recaptchaHostRef = useRef(null);
  const verifierRef = useRef(null);
  const confirmationRef = useRef(null);

  // ---- reCAPTCHA lifecycle ------------------------------------------------
  //
  // The widget has to be torn down and rebuilt for every send. Firebase
  // consumes the token on use, and a verifier that has already been spent
  // fails the next signInWithPhoneNumber with captcha-check-failed - which is
  // exactly what a "Resend OTP" button triggers.

  const clearVerifier = useCallback(() => {
    if (verifierRef.current) {
      try {
        verifierRef.current.clear();
      } catch {
        // Already torn down (unmount races the clear) - nothing to do.
      }
      verifierRef.current = null;
    }
    if (recaptchaHostRef.current) {
      recaptchaHostRef.current.innerHTML = "";
    }
  }, []);

  useEffect(() => clearVerifier, [clearVerifier]);

  // Resend countdown.
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const startCountdown = () => setResendIn(RESEND_SECONDS);

  // ---- Sending ------------------------------------------------------------

  const sendPhoneOtp = async () => {
    // Round-trip first so the number Firebase is asked to text is byte-for-byte
    // the one the backend will later match the token against.
    const { data } = await requestPhoneOtp(phone);
    const normalized = data.phone;

    const { auth, RecaptchaVerifier, signInWithPhoneNumber } =
      await initFirebaseAuth();

    clearVerifier();
    verifierRef.current = new RecaptchaVerifier(auth, recaptchaHostRef.current, {
      size: "invisible",
    });

    confirmationRef.current = await signInWithPhoneNumber(
      auth,
      normalized,
      verifierRef.current
    );

    setSentTo(normalized);
  };

  const sendEmailOtp = async () => {
    const address = email.trim().toLowerCase();
    await requestEmailLoginOtp(address);
    setSentTo(address);
  };

  const handleSend = async (event) => {
    event?.preventDefault();
    if (busy) return;

    if (mode === "mobile" && phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (mode === "email" && !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "mobile") {
        await sendPhoneOtp();
      } else {
        await sendEmailOtp();
      }
      setOtp("");
      setStep("code");
      startCountdown();
      toast.success("OTP sent.");
    } catch (error) {
      // A Firebase failure leaves a spent widget behind; without this the
      // retry fails for a different reason than the original attempt did.
      clearVerifier();
      toast.error(
        error?.code
          ? firebaseErrorMessage(error)
          : apiErrorMessage(error, "Could not send the OTP. Please try again.")
      );
    } finally {
      setBusy(false);
    }
  };

  // ---- Verifying ----------------------------------------------------------

  const finish = (data) => {
    applyAuthSession(data);

    // A phone-first account gets a placeholder email it never chose, so ask
    // for the real one now - order confirmations depend on it.
    const needsProfile =
      data.is_new || !data.user?.name || isPlaceholderEmail(data.user?.email);

    if (needsProfile) {
      setNewUser(data.user);
      setProfile({
        name: data.user?.name || "",
        email: isPlaceholderEmail(data.user?.email) ? "" : data.user?.email || "",
      });
      setStep("profile");
      return;
    }

    toast.success(data.msg || "Login Success");
    onSuccess?.(data.user);
  };

  const handleVerify = async (event) => {
    event?.preventDefault();
    if (busy || otp.length < 6) return;

    setBusy(true);
    try {
      let data;

      if (mode === "mobile") {
        // Firebase checks the code, then hands us a signed token that carries
        // the number. The backend trusts the token, never the form field.
        const credential = await confirmationRef.current.confirm(otp);
        const idToken = await credential.user.getIdToken();
        ({ data } = await verifyPhoneLogin({ idToken }));
      } else {
        ({ data } = await verifyEmailLogin({ email: sentTo, otp }));
      }

      clearVerifier();
      finish(data);
    } catch (error) {
      toast.error(
        error?.code
          ? firebaseErrorMessage(error)
          : apiErrorMessage(error, "Wrong OTP. Please try again.")
      );
      setOtp("");
    } finally {
      setBusy(false);
    }
  };

  // ---- Profile completion -------------------------------------------------

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (busy) return;

    if (!profile.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setBusy(true);
    try {
      const fields = { name: profile.name.trim() };
      // Only send an email if they actually typed one; PATCHing the
      // placeholder back would just rewrite it unchanged.
      if (profile.email.trim()) fields.email = profile.email.trim().toLowerCase();

      const { data } = await updateProfile(newUser.id, fields);
      toast.success("Welcome to SpikeZone!");
      onSuccess?.(data);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not save your details."));
    } finally {
      setBusy(false);
    }
  };

  const skipProfile = () => {
    toast.success("Logged in.");
    onSuccess?.(newUser);
  };

  // ---- Render -------------------------------------------------------------

  const switchMode = (next) => {
    if (next === mode) return;
    clearVerifier();
    confirmationRef.current = null;
    setMode(next);
    setStep("identify");
    setOtp("");
    setSentTo("");
  };

  const editIdentifier = () => {
    clearVerifier();
    confirmationRef.current = null;
    setStep("identify");
    setOtp("");
    setResendIn(0);
  };

  return (
    <div className="otp-login">
      {/* Invisible reCAPTCHA renders here. It must stay mounted for the whole
          flow: Firebase resolves the challenge against this node while the SMS
          request is in flight. */}
      <div ref={recaptchaHostRef} />

      {step === "identify" && (
        <>
          {isPhoneLoginConfigured && (
            <div className="otp-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "mobile"}
                className={`otp-tab ${mode === "mobile" ? "active" : ""}`}
                onClick={() => switchMode("mobile")}
              >
                Mobile OTP
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "email"}
                className={`otp-tab ${mode === "email" ? "active" : ""}`}
                onClick={() => switchMode("email")}
              >
                Email OTP
              </button>
            </div>
          )}

          <form onSubmit={handleSend} autoComplete="on">
            {mode === "mobile" ? (
              <label className="otp-field">
                <span className="otp-field-label">Mobile number</span>
                <div className="otp-phone-input">
                  <span className="otp-cc">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={14}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </label>
            ) : (
              <label className="otp-field">
                <span className="otp-field-label">Email address</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
            )}

            <button type="submit" className="form-submit mt-4" disabled={busy}>
              {busy ? <Spinner animation="border" size="sm" /> : "Send OTP"}
            </button>
          </form>

          <p className="otp-hint">
            No password needed. We&apos;ll send you a 6-digit code
            {mode === "mobile" ? " by SMS." : " by email."}
          </p>

          {onUsePassword && (
            <button type="button" className="otp-link" onClick={onUsePassword}>
              Login with password instead
            </button>
          )}
        </>
      )}

      {step === "code" && (
        <form onSubmit={handleVerify}>
          <p className="otp-sent-to">
            Code sent to <strong>{sentTo}</strong>
            <button type="button" className="otp-link inline" onClick={editIdentifier}>
              Change
            </button>
          </p>

          {/* Styled through this wrapper rather than the library's
              containerStyle/inputStyle props, which take inline style objects
              - the CSS then stays with the rest of the theme. */}
          <div className="otp-boxes">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              isInputNum
              shouldAutoFocus
            />
          </div>

          <button
            type="submit"
            className="form-submit mt-4"
            disabled={busy || otp.length < 6}
          >
            {busy ? <Spinner animation="border" size="sm" /> : "Verify & Login"}
          </button>

          <div className="otp-resend">
            {resendIn > 0 ? (
              <span>Resend OTP in {resendIn}s</span>
            ) : (
              <button type="button" className="otp-link" onClick={handleSend} disabled={busy}>
                Resend OTP
              </button>
            )}
          </div>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={handleProfileSave}>
          <h5 className="otp-profile-head">Almost done</h5>
          <p className="otp-hint">
            Tell us who you are so we can put it on your orders.
          </p>

          <label className="otp-field">
            <span className="otp-field-label">Full name</span>
            <input
              type="text"
              autoComplete="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </label>

          <label className="otp-field">
            <span className="otp-field-label">
              Email address <span className="otp-optional">(for order updates)</span>
            </span>
            <input
              type="email"
              autoComplete="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </label>

          <button type="submit" className="form-submit mt-4" disabled={busy}>
            {busy ? <Spinner animation="border" size="sm" /> : "Continue"}
          </button>

          <button type="button" className="otp-link" onClick={skipProfile}>
            Skip for now
          </button>
        </form>
      )}
    </div>
  );
}

// Mirrors CustomUserManager.create_phone_user - anything at this domain was
// generated by us, never typed by a customer.
function isPlaceholderEmail(address) {
  return Boolean(address) && address.endsWith("@phone.spikezone.in");
}
