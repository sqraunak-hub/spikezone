import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../Services/AuthService";
import "../Assets/css/login.css";
import { toast } from "react-toastify";
import axios from "axios";
import logo from "../Assets/img/logo.png";

import { API_BASE_URL } from "../Utils/appConstant";

export default function Login({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({
    emailLogin: "",
    passwordLogin: "",
  });
  const [error, setError] = useState("");
  const [apiLoad, setApiLoad] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!formData.emailLogin || !formData.passwordLogin) {
      setError("Both fields are required.");
      return false;
    }
    setError("");
    return true;
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}profile/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new Error("Failed to fetch user profile.");
    }
  };

  const handleLoginSubmit = async (e) => {
    setApiLoad(true);
    e.preventDefault();

    if (!validate()) {
      setApiLoad(false);
      return;
    }

    try {
      const { data, status } = await loginUser({
        email: formData.emailLogin,
        password: formData.passwordLogin,
      });

      if (status === 200) {
        const token = data.token.access;

        // Fetch user profile to check if the user is an admin
        const userProfile = await fetchUserProfile(token);

        if (userProfile.is_admin) {
          toast.success("Login successful!");
          localStorage.setItem("token", token);
          // Kept so the session can renew itself: the access token expires
          // after 60 minutes and every save after that used to 401.
          if (data.token.refresh) {
            localStorage.setItem("refreshToken", data.token.refresh);
          }
          localStorage.setItem("user", JSON.stringify(userProfile));
          setApiLoad(false);
          if (setIsLoggedIn) setIsLoggedIn(true); // update Router state so Header shows without a refresh
          navigate("/");
        } else {
          setError("You are not authorized to access this application.");
          setApiLoad(false);
        }
      }
    } catch (error) {
      console.error(error);
      setError("Invalid credentials or failed to fetch user profile.");
      setApiLoad(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-art" aria-hidden="true">
        <span className="adm-login-blob one"></span>
        <span className="adm-login-blob two"></span>
      </div>
      <div className="login-container adm-login-card">
        <div className="adm-login-brand">
          <img src={logo} alt="SpikeZone" className="adm-login-logoimg" />
          <div>
            <h2>SpikeZone Admin</h2>
            <p>Sign in to manage your store</p>
          </div>
        </div>
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="emailLogin"
              placeholder="admin@spikezone.in"
              value={formData.emailLogin}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="passwordLogin"
              placeholder="••••••••"
              value={formData.passwordLogin}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={apiLoad} className="login-button">
            {apiLoad ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
