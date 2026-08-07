import React, { useState, useEffect } from "react";
import "../Assets/CSS/header.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import logo from "../Assets/IMG/logo.png";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button, Form, Dropdown } from "react-bootstrap";
import Offcanvas from "react-bootstrap/Offcanvas";
import BasicTabs from "./BasicTabs";
import useUserStore from "../store/userStore";
import { Typography } from "@mui/material";
import axios from "axios";

function UserSvg() {
  return (
    <>
      <svg
        className="header-svg"
        width="30px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.5 21.0001H6.5C5.11929 21.0001 4 19.8808 4 18.5001C4 14.4194 10 14.5001 12 14.5001C14 14.5001 20 14.4194 20 18.5001C20 19.8808 18.8807 21.0001 17.5 21.0001Z"
          stroke="#1e9dcd"
          stroke-width="2.0"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
          stroke="#1e9dcd"
          stroke-width="2.0"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </>
  );
}

function MobileHeader() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isInput, setIsInput] = useState(false);
  const [IsLogin, setIsLogin] = useState(false);
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
  const checkLogin = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLogin(true);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signup");
  };
  useEffect(() => {
    // const token = localStorage.getItem(token);
    checkLogin();
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
            <Navbar.Brand className="nav-logo" href="#">
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
                            <Nav.Link className="sidebar-link">
                              <NavLink
                                onClick={hideMenu}
                                className="nav-link"
                                to={`/category/${category.category_name.replace(
                                  /\s+/g,
                                  ""
                                )}`}
                              >
                                <i className="fas fa-tag"></i>{" "}
                                {category.category_name}
                              </NavLink>
                            </Nav.Link>
                          </div>
                        ))}

                        <h4 className="list-head">More Links</h4>

                        <Nav.Link className="sidebar-link">
                          <NavLink
                            to="/cart"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <i className="fas fa-shopping-cart"></i> Cart
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link className="sidebar-link">
                          <NavLink
                            to="/wishlist"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <i className="fas fa-heart"></i> Wishlist
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link className="sidebar-link">
                          <NavLink
                            to="/orders"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <i className="fas fa-history"></i> Order History
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link className="sidebar-link">
                          <NavLink
                            to="/my-reviews"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <i className="fas fa-pen"></i> My Reviews
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link className="sidebar-link">
                          <NavLink
                            to="/account"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <i className="fas fa-user"></i> Profile / Account
                            Settings
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link className="sidebar-link">
                          <NavLink
                            to="/contact"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <i className="fas fa-headset"></i> Customer Support
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link className="sidebar-link">
                          <NavLink
                            to="/blogs"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            <i className="fas fa-pager"></i> Our Blogs
                          </NavLink>
                        </Nav.Link>
                      </>
                    }
                    itemTwo={
                      <>
                        <Nav.Link className="sidebar-link">
                          <NavLink
                            to="/"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            Home
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link className="sidebar-link">
                          <NavLink
                            to="/gallery"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            Gallery
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link className="sidebar-link">
                          <NavLink
                            to="/about"
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            About Us
                          </NavLink>
                        </Nav.Link>
                        <Nav.Link className="sidebar-link">
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
              {IsLogin ? (
                <Nav.Link className="d-inline-block">
                  <NavDropdown
                    title={<UserSvg />}
                    id="basic-nav-dropdown"
                    className="nav-dropdown-mobile"
                    trigger="hover"
                  >
                    <NavDropdown.Item className="disabled">
                      Welcome Back, User
                    </NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.1">
                      <Link to="/account">Manage Account</Link>
                    </NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">
                      <Link to="/">Your Orders</Link>
                    </NavDropdown.Item>
                    <NavDropdown.Item className="logout-btn" href="#action/3.3">
                      <Button className="btn-danger" onClick={handleLogout}>
                        Logout
                      </Button>
                    </NavDropdown.Item>
                  </NavDropdown>
                </Nav.Link>
              ) : (
                <Nav.Link className="d-inline-block">
                  <Link to="/signup">
                    <svg
                      className="header-svg"
                      width="30px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.5 21.0001H6.5C5.11929 21.0001 4 19.8808 4 18.5001C4 14.4194 10 14.5001 12 14.5001C14 14.5001 20 14.4194 20 18.5001C20 19.8808 18.8807 21.0001 17.5 21.0001Z"
                        stroke="#1e9dcd"
                        stroke-width="2.0"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                        stroke="#1e9dcd"
                        stroke-width="2.0"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </Link>
                </Nav.Link>
              )}

              <Nav.Link className="d-inline-block">
                <Link to="/wishlist">
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
              <Nav.Link className="d-inline-block">
                <Link to="/cart">
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
