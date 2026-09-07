import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../Screens/Dashboard";
import Header from "../Components/Header";
import Sidenav from "../Components/Sidenav";
import Products from "../Screens/Products";
import Categories from "../Screens/Categories";
import Login from "../Screens/Login";
import PendingOrders from "../Screens/PendingOrders";
import CompletedOrders from "../Screens/CompletedOrder";
import Messages from "../Screens/Messages";
import Users from "../Screens/Users";
import Gallery from "../Screens/Gallery";
import Reviews from "../Screens/Reviews";
import MetaTags from "../Screens/MetaTags";
import Blogs from "../Screens/Blogs";
import BlogList from "../Screens/BlogList";
import EditBlog from "../Screens/EditBlog";
import EditProduct from "../Screens/EditProduct";

export default function Router() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token")); // Initialize based on token presence

  // Update login state dynamically
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    // Listen for changes to localStorage
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token from localStorage
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user"); // Clear user data from localStorage
    setIsLoggedIn(false); // Update login state
  };

  return (
    <BrowserRouter basename={process.env.REACT_APP_BASENAME || "/"}>
      {isLoggedIn && <Header onLogout={handleLogout} />}{" "}
      {/* Show Header if logged in */}
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Sidenav maincontent={<Dashboard />} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<Products />} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/editProduct/:id"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<EditProduct />} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/metatags"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<MetaTags />} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<Blogs />} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogList"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<BlogList />} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/editBlog/:id"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<EditBlog />} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<Gallery />} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<Reviews />} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pendingorders"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<PendingOrders />} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/completedorder"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<CompletedOrders />} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<Categories />} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<Users />} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <div style={{ display: "" }}>
                <Sidenav maincontent={<Messages />} />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
