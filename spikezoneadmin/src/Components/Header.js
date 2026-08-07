import { Navbar, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Assets/css/header.css";
import { useNavigate, Link } from "react-router-dom";
import { FaExternalLinkAlt, FaUserCircle } from "react-icons/fa";
import logo from "../Assets/img/logo.png";

import { SITE_URL } from "../Utils/appConstant";

function Header({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout(); // clears storage AND updates Router state
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const initial = (user?.name || "A").charAt(0).toUpperCase();

  return (
    <Navbar className="adm-header" expand="lg">
      <div className="adm-header-inner">
        <Link to="/" className="adm-brand">
          <span className="adm-brand-logo">
            <img src={logo} alt="SpikeZone" />
          </span>
          <span className="adm-brand-text">
            SpikeZone <b>Admin</b>
          </span>
        </Link>

        <div className="adm-header-right">
          <a
            href={`${SITE_URL}/`}
            target="_blank"
            rel="noreferrer"
            className="adm-view-site"
          >
            <FaExternalLinkAlt /> View Website
          </a>

          <NavDropdown
            align="end"
            title={
              <span className="adm-user-chip">
                <span className="adm-avatar">{initial}</span>
                <span className="adm-user-name">{user?.name || "User"}</span>
              </span>
            }
            id="admin-user-dropdown"
          >
            <NavDropdown.Item disabled>
              <FaUserCircle className="me-2" />
              {user?.email}
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
          </NavDropdown>
        </div>
      </div>
    </Navbar>
  );
}

export default Header;
