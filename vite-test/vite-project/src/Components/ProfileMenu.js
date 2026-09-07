import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBoxOpen,
  FaHeart,
  FaLocationDot,
  FaPen,
  FaRightFromBracket,

} from "react-icons/fa6";

import useUserStore from "../store/userStore";
import { clearAuthSession } from "../Services/authService";
import "../Assets/CSS/profile-menu.css";

const MENU = [
  { to: "/account", label: "My Account", icon: <FaUser /> },
  { to: "/orders", label: "My Orders", icon: <FaBoxOpen /> },
  { to: "/account/manage-address", label: "Saved Addresses", icon: <FaLocationDot /> },
  { to: "/wishlist", label: "Wishlist", icon: <FaHeart /> },
  { to: "/my-reviews", label: "My Reviews", icon: <FaPen /> },
];

// Two letters from whatever the account actually has. A phone-first signup has
// no name until the profile is completed, so fall back through email and then
// the number rather than rendering an empty circle.
function initialsFor(user) {
  const name = (user?.name || "").trim();
  if (name) {
    const parts = name.split(/\s+/);
    return ((parts[0][0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  }
  const email = (user?.email || "").trim();
  if (email && !email.endsWith("@phone.spikezone.in")) return email.slice(0, 2).toUpperCase();
  const phone = (user?.phone || user?.contact || "").replace(/\D/g, "");
  if (phone) return phone.slice(-2);
  return "SZ";
}

// The generated address is ours, not something the customer chose, so it must
// never be shown back to them as if it were their email.
function subtitleFor(user) {
  const email = (user?.email || "").trim();
  if (email && !email.endsWith("@phone.spikezone.in")) return email;
  return user?.phone || user?.contact || "";
}

const ProfileToggle = React.forwardRef(function ProfileToggle(
  { onClick, user, loggedIn },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className="szpm-trigger"
      aria-label={loggedIn ? "Account menu" : "Sign in"}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {loggedIn ? (
        <span className="szpm-avatar szpm-avatar-sm">{initialsFor(user)}</span>
      ) : (
        <svg
          className="header-svg"
          width="30px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M17.5 21.0001H6.5C5.11929 21.0001 4 19.8808 4 18.5001C4 14.4194 10 14.5001 12 14.5001C14 14.5001 20 14.4194 20 18.5001C20 19.8808 18.8807 21.0001 17.5 21.0001Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
});

export default function ProfileMenu() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  // Driven by the store rather than a one-shot localStorage read, so the
  // header flips the moment someone signs in or out instead of only after a
  // full page reload.
  const loggedIn = Boolean(user);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/signup");
  };

  if (!loggedIn) {
    return (
      <Link to="/signup" className="szpm-trigger" aria-label="Sign in">
        <svg
          className="header-svg"
          width="30px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M17.5 21.0001H6.5C5.11929 21.0001 4 19.8808 4 18.5001C4 14.4194 10 14.5001 12 14.5001C14 14.5001 20 14.4194 20 18.5001C20 19.8808 18.8807 21.0001 17.5 21.0001Z"
            stroke="#1e9dcd"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
            stroke="#1e9dcd"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    );
  }

  const subtitle = subtitleFor(user);

  return (
    <Dropdown align="end" className="szpm">
      <Dropdown.Toggle as={ProfileToggle} user={user} loggedIn id="szpm-toggle" />

      <Dropdown.Menu className="szpm-menu" renderOnMount>
        <div className="szpm-head">
          <span className="szpm-avatar">{initialsFor(user)}</span>
          <div className="szpm-id">
            <span className="szpm-name">{user?.name?.trim() || "Your account"}</span>
            {subtitle && <span className="szpm-sub">{subtitle}</span>}
          </div>
        </div>

        {user?.phone && (
          <div className="szpm-badge-row">
            <span className="szpm-badge">Mobile verified</span>
          </div>
        )}

        <div className="szpm-items">
          {MENU.map((item) => (
            // as={Link} rather than an <a href> wrapping a <Link>: the old
            // markup nested two anchors, so the href="#action/..." fired and
            // the router never saw the navigation.
            <Dropdown.Item key={item.to} as={Link} to={item.to} className="szpm-item">
              <span className="szpm-item-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Dropdown.Item>
          ))}
        </div>

        <Dropdown.Divider className="szpm-divider" />

        <Dropdown.Item as="button" className="szpm-item szpm-signout" onClick={handleLogout}>
          <span className="szpm-item-icon" aria-hidden="true"><FaRightFromBracket /></span>
          Sign out
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
