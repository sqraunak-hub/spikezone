import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaCartShopping,
  FaClockRotateLeft,
  FaDove,
  FaHeadset,
  FaHeart,
  FaLocationDot,
  FaMagnifyingGlass,
  FaNewspaper,
  FaPen,
  FaShieldHalved,
  FaTag,
  FaUser,
} from "react-icons/fa6";
import "../Assets/CSS/header.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import logo from "../Assets/IMG/logo.png";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import Offcanvas from "react-bootstrap/Offcanvas";
import BasicTabs from "./BasicTabs";
import ThemeToggle from "./ThemeToggle";
import ProfileMenu from "./ProfileMenu";
import useUserStore from "../store/userStore";
import { Typography } from "@mui/material";
import axios from "axios";
import { categoryPath } from "../Utils/appConstant";
import { categorySlug } from "../Utils/slugify";

function MobileHeader() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isInput, setIsInput] = useState(false);
  const [value, setValue] = React.useState("one");
  const fetchUserProfile = useUserStore((state) => state.fetchUserProfile);
  const user = useUserStore((state) => state.user);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  useEffect(() => {
    axios.get("uploadCategory/").then((response) => {
      setCategories(response.data);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `/products/search?query=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const showInput = () => {
    setIsInput(!isInput);
  };
  useEffect(() => {
    // const token = localStorage.getItem(token);
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    setIsSmallScreen(mediaQuery.matches);

    // Add event listener to update state when screen size changes
    const handleMediaQueryChange = (event) => setIsSmallScreen(event.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Remove event listener when component unmounts
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  const hideMenu = () => {
    setShowMenu(false);
  };

  return (
    <>
      {["false"].map((expand) => (
        <Navbar key={expand} bg="light" expand={expand} className="mb-3">
          <Container fluid>
            <Navbar.Toggle
              className="border-0 shadow-none outline-none"
              onClick={() => setShowMenu(true)}
              aria-controls={`offcanvasNavbar-expand-${expand}`}
            />
            <Navbar.Brand className="nav-logo" as="div">
              <Link to="/">
                <img src={logo} alt="logo" width="120" />
              </Link>
            </Navbar.Brand>

            <Navbar.Offcanvas
              show={showMenu}
              onHide={hideMenu}
              id={`offcanvasNavbar-expand-${expand}`}
              aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
              placement="start"
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title
                  closeButton
                  id={`offcanvasNavbarLabel-expand-${expand}`}
                >
                  Hello, {user ? user.name : "User"}
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="m-auto">
                  <h4 className="list-head">Explore Spikezone.in</h4>
                  <BasicTabs
                    itemOne={
                      <>
                        <h4 className="list-head">Shop by Category</h4>

                        {categories.map((category) => (
                          <div key={category.id} value={category.id}>
                            <Nav.Link as="div" className="sidebar-link">
                              <NavLink
                                onClick={hideMenu}
                                className="nav-link"
                                to={categoryPath(categorySlug(category))}
                              >
                                <FaTag />{" "}
                                {category.category_name}
                              </NavLink>
                            </Nav.Link>
                          </div>
                        ))}

                        <h4 className="list-head">Guides</h4>

                        {[
                          ["/bird-control/", <FaShieldHalved />, "Bird Control Products"],
                          ["/solutions/", <FaMagnifyingGlass />, "Problems by Surface"],
                          ["/applications/", <FaBuilding />, "Bird Control by Job"],
                          ["/bird-care/", <FaDove />, "Bird Care & Feeders"],
                          ["/locations/", <FaLocationDot />, "Cities We Supply"],
                        ].map(([to, icon, label]) => (
                          <Nav.Link as="div" className="sidebar-link" key={to}>
                            <NavLink
                              to={to}
                              className="nav-link"
                              onClick={hideMenu}
                            >
                              {icon} {label}
                            </NavLink>
                          </Nav.Link>
                        ))}

                        <h4 className="list-head">More Links</h4>

                        <Nav.Link as="div" className="sidebar-link">
                          <NavLink
                            to="/cart"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <FaCartShopping /> Cart
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link as="div" className="sidebar-link">
                          <NavLink
                            to="/wishlist"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <FaHeart /> Wishlist
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link as="div" className="sidebar-link">
                          <NavLink
                            to="/orders"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <FaClockRotateLeft /> Order History
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link as="div" className="sidebar-link">
                          <NavLink
                            to="/my-reviews"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <FaPen /> My Reviews
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link as="div" className="sidebar-link">
                          <NavLink
                            to="/account"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <FaUser /> Profile / Account
                            Settings
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link as="div" className="sidebar-link">
                          <NavLink
                            to="/contact"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <FaHeadset /> Customer Support
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link as="div" className="sidebar-link">
                          <NavLink
                            to="/blogs"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <FaNewspaper /> Our Blogs
                          </NavLink>
                        </Nav.Link>
                      </>
                    }
                    itemTwo={
                      <>
                        <Nav.Link as="div" className="sidebar-link">
                          <NavLink
                            to="/"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            Home
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link as="div" className="sidebar-link">
                          <NavLink
                            to="/gallery"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            Gallery
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link as="div" className="sidebar-link">
                          <NavLink
                            to="/about"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            About Us
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link as="div" className="sidebar-link">
                          <NavLink
                            to="/contact"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            Reach Us
                          </NavLink>
                        </Nav.Link>
                      </>
                    }
                  />
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
            {isSmallScreen ? (
              <Nav.Link>
                <svg
                  width="30px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={showInput}
                >
                  <path
                    d="M20 20L15.8033 15.8033C15.8033 15.8033 14 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5C18 11.0137 17.9484 11.5153 17.85 12"
                    stroke="#1e9dcd"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </Nav.Link>
            ) : (
              <Form
                className="d-flex"
                style={{ textAlign: "center" }}
                onSubmit={handleSearch}
              >
                <Form.Control
                  type="search"
                  placeholder="Search Spikezone"
                  className="me-2 shadow-none"
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline-dark" type="submit">
                  Search
                </Button>
              </Form>
            )}

            <Nav
              className="mr-5 nav-ex-link"
              style={{ display: "inline-block" }}
            >
              <Nav.Link
                as="span"
                className="d-inline-block sz-theme-toggle-wrap"
              >
                <ThemeToggle />
              </Nav.Link>

              {/* Signed-in vs signed-out lives inside ProfileMenu, off the user
                  store, so the header reacts to login/logout without a reload. */}
              <Nav.Link as="span" className="d-inline-block">
                <ProfileMenu />
              </Nav.Link>

              <Nav.Link as="span" className="d-inline-block">
                <Link to="/wishlist" aria-label="Wishlist">
                  <svg
                    className="header-svg"
                    width="30px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 20L4.3314 12.0474C3.47892 11.1633 3 9.96429 3 8.71405C3 6.11055 5.03517 4 7.54569 4C8.75128 4 9.90749 4.49666 10.76 5.38071L12 6.66667L13.24 5.38071C14.0925 4.49666 15.2487 4 16.4543 4C18.9648 4 21 6.11055 21 8.71405C21 9.96429 20.5211 11.1633 19.6686 12.0474L15.8343 16.0237"
                      stroke="#e11d48"
                      stroke-width="2.0"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </Link>
              </Nav.Link>
              <Nav.Link as="span" className="d-inline-block">
                <Link to="/cart" aria-label="Cart">
                  <svg
                    className="header-svg"
                    width="30px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.8264 20C18.9965 20 19.9167 18.9999 19.8195 17.8339L19.1528 9.83391C19.0664 8.79732 18.1999 8 17.1597 8H16M16 8H12M16 8L16 7C16 5.93913 15.5786 4.92172 14.8284 4.17157C14.0783 3.42143 13.0609 3 12 3C10.9391 3 9.92172 3.42143 9.17157 4.17157C8.42143 4.92172 8 5.93913 8 7L8 8M16 8L16 12M8 8H6.84027C5.80009 8 4.93356 8.79732 4.84718 9.83391L4.18051 17.8339C4.08334 18.9999 5.00352 20 6.1736 20H13M8 8L8 12"
                      stroke="#ff8a00"
                      stroke-width="2.0"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </Link>
              </Nav.Link>
            </Nav>
            {isInput ? (
              <Form className="d-flex" onSubmit={handleSearch}>
                <Form.Control
                  type="search"
                  placeholder="Search Spikezone"
                  className="me-2 sm-input"
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline-dark" type="submit">
                  Search
                </Button>
              </Form>
            ) : null}
          </Container>
        </Navbar>
      ))}
    </>
  );
}

export default MobileHeader;
