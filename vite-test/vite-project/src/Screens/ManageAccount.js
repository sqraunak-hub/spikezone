import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaArrowLeft, FaCircleCheck, FaLock } from "react-icons/fa6";

import useUserStore from "../store/userStore";
import { updateProfile } from "../Services/authService";
import SEOHelmet from "../Components/SEOHelmet";
import "../Assets/CSS/account.css";

const isPlaceholderEmail = (address) =>
  Boolean(address) && address.endsWith("@phone.spikezone.in");

const FIELDS = [
  { name: "name", label: "Full name", type: "text", autoComplete: "name", required: true },
  { name: "email", label: "Email address", type: "email", autoComplete: "email", required: true,
    help: "Order confirmations and delivery updates are sent here." },
  { name: "contact", label: "Contact number", type: "tel", autoComplete: "tel" },
  { name: "address", label: "Address", type: "text", autoComplete: "street-address", full: true },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2" },
  { name: "state", label: "State", type: "text", autoComplete: "address-level1" },
  { name: "postalcode", label: "PIN code", type: "text", autoComplete: "postal-code", inputMode: "numeric" },
];

const EMPTY = FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {});

function apiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.errors === "string") return data.errors;
  if (typeof data.detail === "string") return data.detail;
  const first = Object.values(data.errors || data)[0];
  if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  if (typeof first === "string") return first;
  return fallback;
}

export default function ManageAccount() {
  const fetchUserProfile = useUserStore((state) => state.fetchUserProfile);
  const user = useUserStore((state) => state.user);

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Seed the form once the profile lands. The placeholder address is blanked
  // rather than shown, so the field reads as "not set yet" and the customer
  // types a real one instead of editing a machine-generated string.
  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      email: isPlaceholderEmail(user.email) ? "" : user.email || "",
      contact: user.contact || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      postalcode: user.postalcode || "",
    });
  }, [user]);

  const change = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (saving || !user) return;

    if (!form.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter an email address.");
      return;
    }

    setSaving(true);
    try {
      // Trimmed on the way out: a stray space in an email is the kind of thing
      // that only shows up later as a bounced order confirmation.
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
      );
      payload.email = payload.email.toLowerCase();

      await updateProfile(user.id, payload);
      toast.success("Your details have been saved.");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not save your details."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SEOHelmet />
      <ToastContainer position="top-center" autoClose={4000} theme="light" />

      <Container className="szac">
        <Link to="/account" className="szac-back">
          <FaArrowLeft aria-hidden="true" /> Back to account
        </Link>

        <header className="szac-page-head">
          <h1 className="szac-page-title">Personal details</h1>
          <p className="szac-page-sub">
            These details appear on your orders and invoices.
          </p>
        </header>

        <form className="szac-panel" onSubmit={submit}>
          {user?.phone && (
            // Read-only on purpose: `phone` is the OTP-verified number, and the
            // API refuses to let a profile PATCH write it. Showing it as an
            // editable box would promise something the server will not honour.
            <div className="szac-locked">
              <span className="szac-locked-icon" aria-hidden="true"><FaLock /></span>
              <span className="szac-locked-body">
                <span className="szac-locked-label">Verified mobile number</span>
                <span className="szac-locked-value">
                  {user.phone}
                  <span className="szac-verified">
                    <FaCircleCheck aria-hidden="true" /> Verified
                  </span>
                </span>
              </span>
            </div>
          )}

          <div className="szac-fields">
            {FIELDS.map((field) => (
              <label
                key={field.name}
                className={`szac-field${field.full ? " szac-field-full" : ""}`}
              >
                <span className="szac-field-label">
                  {field.label}
                  {field.required && <span className="szac-req" aria-hidden="true"> *</span>}
                </span>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={change}
                  autoComplete={field.autoComplete}
                  inputMode={field.inputMode}
                  required={field.required}
                />
                {field.help && <span className="szac-field-help">{field.help}</span>}
              </label>
            ))}
          </div>

          <div className="szac-actions">
            <button type="submit" className="szac-save" disabled={saving || !user}>
              {saving ? <Spinner animation="border" size="sm" /> : "Save changes"}
            </button>
          </div>
        </form>
      </Container>
    </>
  );
}
