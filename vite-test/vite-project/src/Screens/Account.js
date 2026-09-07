import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaUserPen,
  FaBoxOpen,
  FaLocationDot,
  FaHeart,
  FaPen,
  FaHeadset,
  FaChevronRight,
  FaCircleCheck,
} from "react-icons/fa6";

import useUserStore from "../store/userStore";
import SEOHelmet from "../Components/SEOHelmet";
import "../Assets/CSS/account.css";

// One entry per destination, so the grid is data rather than repeated markup.
// `tone` picks a hue from the theme's five-colour accent palette - each one is
// contrast-checked against its own tint in both themes.
const SECTIONS = [
  {
    to: "/account/manage-account",
    icon: <FaUserPen />,
    tone: "c1",
    title: "Personal details",
    desc: "Name, email and contact number",
  },
  {
    to: "/orders",
    icon: <FaBoxOpen />,
    tone: "c2",
    title: "My orders",
    desc: "Track deliveries and view past orders",
  },
  {
    to: "/account/manage-address",
    icon: <FaLocationDot />,
    tone: "c3",
    title: "Saved addresses",
    desc: "Add or edit your delivery addresses",
  },
  {
    to: "/wishlist",
    icon: <FaHeart />,
    tone: "c5",
    title: "Wishlist",
    desc: "Products you saved for later",
  },
  {
    to: "/my-reviews",
    icon: <FaPen />,
    tone: "c4",
    title: "My reviews",
    desc: "Reviews you have written",
  },
  {
    to: "/contact",
    icon: <FaHeadset />,
    tone: "c1",
    title: "Help & support",
    desc: "Questions about an order or a product",
  },
];

// The address create_phone_user() mints is ours, not the customer's, so it is
// never shown back to them as their email.
const isPlaceholderEmail = (address) =>
  Boolean(address) && address.endsWith("@phone.spikezone.in");

function initialsFor(user) {
  const name = (user?.name || "").trim();
  if (name) {
    const parts = name.split(/\s+/);
    return (
      (parts[0][0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")
    ).toUpperCase();
  }
  const email = (user?.email || "").trim();
  if (email && !isPlaceholderEmail(email)) return email.slice(0, 2).toUpperCase();
  const phone = (user?.phone || user?.contact || "").replace(/\D/g, "");
  return phone ? phone.slice(-2) : "SZ";
}

export default function Account() {
  const fetchUserProfile = useUserStore((state) => state.fetchUserProfile);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const email = isPlaceholderEmail(user?.email) ? "" : user?.email || "";
  const phone = user?.phone || user?.contact || "";
  // Nudge shown only while something is genuinely missing - a complete profile
  // should not be nagged.
  const incomplete = !user?.name?.trim() || !email;

  return (
    <>
      <SEOHelmet />

      <Container className="szac">
        <header className="szac-hero">
          <span className="szac-hero-avatar">{initialsFor(user)}</span>

          <div className="szac-hero-id">
            <p className="szac-hero-eyebrow">Your account</p>
            <h1 className="szac-hero-name">
              {user?.name?.trim() || "Welcome to SpikeZone"}
            </h1>

            <ul className="szac-hero-meta">
              {email && <li className="szac-chip">{email}</li>}
              {phone && (
                <li className="szac-chip">
                  {phone}
                  {user?.phone && (
                    <span className="szac-verified" title="Verified by OTP">
                      <FaCircleCheck aria-hidden="true" /> Verified
                    </span>
                  )}
                </li>
              )}
            </ul>
          </div>

          <Link to="/account/manage-account" className="szac-hero-cta">
            <FaUserPen aria-hidden="true" /> Edit profile
          </Link>
        </header>

        {incomplete && (
          <Link to="/account/manage-account" className="szac-nudge">
            <span className="szac-nudge-dot" aria-hidden="true" />
            <span>
              <strong>Finish setting up your account.</strong> Adding your name
              and email lets us send order confirmations and delivery updates.
            </span>
            <FaChevronRight className="szac-nudge-arrow" aria-hidden="true" />
          </Link>
        )}

        <h2 className="szac-section-title">Manage</h2>

        <div className="szac-grid">
          {SECTIONS.map((section) => (
            <Link key={section.to} to={section.to} className="szac-card">
              <span className={`szac-card-icon szac-tone-${section.tone}`} aria-hidden="true">
                {section.icon}
              </span>
              <span className="szac-card-body">
                <span className="szac-card-title">{section.title}</span>
                <span className="szac-card-desc">{section.desc}</span>
              </span>
              <FaChevronRight className="szac-card-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
