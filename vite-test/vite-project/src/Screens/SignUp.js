import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import { Button, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../Services/authService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../Components/Loader";
import { jwtDecode } from "jwt-decode";
import logo from "../Assets/IMG/logo.png";
import ReactCardFlip from "react-card-flip";
import "../Assets/CSS/signup.css";
import OtpInput from "react18-otp-input";

import { API_BASE_URL } from "../Utils/appConstant";

export default function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiLoad, setApiLoad] = useState(false);
  const [isFlip, setIsFlip] = useState(false);
  const [conPass, setConPass] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    emailLogin: "",
    contact: "",
    address: "",
    state: "",
    city: "",
    postalcode: "",
    password: "",
    passwordLogin: "",
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const conPassChange = (e) => {
    setConPass(e.target.value);
  };

  const handleToggle = () => {
    setIsFlip(!isFlip);

    // Clear opposite form fields
    if (isFlip) {
      setFormData((prev) => ({
        ...prev,
        emailLogin: "",
        passwordLogin: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        name: "",
        email: "",
        contact: "",
        address: "",
        state: "",
        city: "",
        postalcode: "",
        password: "",
      }));
      setConPass("");
    }
  };

  const validateSignup = () => {
    if (!formData.name || !formData.email || !formData.password || !conPass) {
      toast.error("Please fill all required signup fields");
      return false;
    }
    if (formData.password !== conPass) {
      toast.error("Both passwords don't match");
      return false;
    }
    return true;
  };

  const validateLogin = () => {
    if (!formData.emailLogin || !formData.passwordLogin) {
      toast.error("Please enter login credentials");
      return false;
    }
    return true;
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setApiLoad(true);

    if (!validateSignup()) {
      setApiLoad(false);
      return;
    }

    fetch(`${API_BASE_URL}send-otp/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "OTP sent successfully") {
          toast.success("OTP sent to your email");
          setShowOtpModal(true);
        } else {
          toast.error(data.error || "Failed to send OTP");
        }
      })
      .catch(() =>
        toast.error(
          "Error while sending OTP, Please check your email or contact support."
        )
      )
      .finally(() => setApiLoad(false));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setApiLoad(true);

    if (!validateLogin()) {
      setApiLoad(false);
      return;
    }

    try {
      setTimeout(async () => {
        try {
          const { data, status } = await loginUser({
            email: formData.emailLogin,
            password: formData.passwordLogin,
          });

          if (status === 200) {
            const token = data.token.access;
            toast.success(data.msg);
            localStorage.setItem("token", token);
            navigate("/");

            const decoded = jwtDecode(token);
            const exp = decoded.exp * 1000;
            const now = Date.now();

            if (exp < now) logout();
            else setTimeout(logout, exp - now);
          }
        } catch (error) {
          toast.error(error?.response?.data?.errors || "Login failed");
        } finally {
          setApiLoad(false);
        }
      }, 2000);
    } catch (err) {
      toast.error("Unexpected error during login");
      setApiLoad(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    toast.info("Session expired. You have been logged out.");
    navigate("/signup");
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length < 6) {
      toast.error("Please enter a valid OTP");
      return;
    }

    setApiLoad(true);

    fetch(`${API_BASE_URL}verify-otp/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email, otp }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "OTP verified successfully") {
          registerUser(formData)
            .then((response) => {
              if (response.status === 201) {
                toast.success("Registered! You can now login.");
                setShowOtpModal(false);
                handleToggle();
              } else {
                toast.error("Registration failed");
              }
            })
            .catch((err) => {
              if (err.response) {
                const errors = err.response.data?.errors;

                if (errors && typeof errors === "object") {
                  Object.entries(errors).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                      messages.forEach((msg) =>
                        toast.error(`${field}: ${msg}`)
                      );
                    } else {
                      toast.error(`${field}: ${messages}`);
                    }
                  });
                } else {
                  toast.error(
                    err.response.data?.message || "Something went wrong"
                  );
                }
              } else if (err.request) {
                toast.error(
                  "Server not responding. Please check your connection."
                );
              } else {
                toast.error("An unexpected error occurred.");
              }
            });
        } else {
          toast.error(data.error || "OTP verification failed");
        }
      })
      .catch(() => toast.error("Error while verifying OTP"))
      .finally(() => setApiLoad(false));
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="auth-page">
          <span className="auth-blob one" aria-hidden="true"></span>
          <span className="auth-blob two" aria-hidden="true"></span>
          <ToastContainer
            position="top-center"
            autoClose={5000}
            theme="light"
          />
          <ReactCardFlip isFlipped={isFlip} flipDirection="horizontal">
            <div
              className="container login-container front login mt-5"
              key="front"
            >
              <div className="container form-im">
                <Link to="/">
                  <img src={logo} alt="logo" className="form-img" />
                </Link>
              </div>
              <div className="form-head">Login to Continue</div>
              <Container className="form-container-user mt-4 mb-1">
                <Form onSubmit={handleLoginSubmit} autoComplete="off">
                  <div className="login-body">
                    <div className="login-input">
                      <input
                        type="text"
                        name="emailLogin"
                        autoComplete="username"
                        className="email-login-input"
                        required
                        onChange={handleChange}
                        value={formData.emailLogin}
                      />
                      <span className="password-login-span">Email Address</span>
                    </div>
                    <div className="login-input">
                      <input
                        type="password"
                        name="passwordLogin"
                        autoComplete="current-password"
                        className="password-login-input"
                        required
                        onChange={handleChange}
                        value={formData.passwordLogin}
                      />
                      <span className="password-login-span">Password</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="form-submit mt-4"
                    disabled={apiLoad}
                  >
                    {apiLoad ? <Spinner animation="border" /> : "Login"}
                  </button>

                  <div className="register-btn-container mt-3">
                    <a href="#" className="forgot-pass-btn">
                      <h5>Forgot Password?</h5>
                    </a>
                    <a
                      href="#"
                      className="register-btn flipbutton"
                      onClick={handleToggle}
                    >
                      <h5>New? Create New Account Now</h5>
                    </a>
                  </div>
                </Form>
              </Container>
            </div>

            <div className="container back register mt-3" key="back">
              <div className="container form-im">
                <Link to="/">
                  <img src={logo} alt="logo" className="form-img" />
                </Link>
              </div>
              <div className="form-head">Create Your Account</div>
              <Container className="form-container-user mt-3 mb-3">
                <Form onSubmit={handleRegisterSubmit} autoComplete="off">
                  <Row>
                    <Col>
                      <FloatingLabel label="Full Name" className="mb-3">
                        <Form.Control
                          type="text"
                          name="name"
                          autoComplete="off"
                          onChange={handleChange}
                          value={formData.name}
                        />
                      </FloatingLabel>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <FloatingLabel label="Email address" className="mb-3">
                        <Form.Control
                          type="email"
                          name="email"
                          autoComplete="new-email"
                          onChange={handleChange}
                          value={formData.email}
                        />
                      </FloatingLabel>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <FloatingLabel label="Contact Number" className="mb-3">
                        <Form.Control
                          type="text"
                          name="contact"
                          autoComplete="off"
                          onChange={handleChange}
                          value={formData.contact}
                        />
                      </FloatingLabel>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <FloatingLabel label="Password" className="mb-3">
                        <Form.Control
                          type="password"
                          name="password"
                          autoComplete="new-password"
                          onChange={handleChange}
                          value={formData.password}
                        />
                      </FloatingLabel>
                    </Col>
                    <Col>
                      <FloatingLabel label="Confirm Password" className="mb-3">
                        <Form.Control
                          type="password"
                          name="con-password"
                          autoComplete="new-password"
                          onChange={conPassChange}
                          value={conPass}
                        />
                      </FloatingLabel>
                    </Col>
                  </Row>

                  <button
                    type="submit"
                    className="form-submit mt-4"
                    disabled={apiLoad}
                  >
                    {apiLoad ? <Spinner animation="border" /> : "Register"}
                  </button>

                  <div className="register-btn-container mt-3">
                    <a
                      href="#"
                      className="register-btn flipbutton"
                      onClick={handleToggle}
                    >
                      <h5>Already Registered? Login Now!</h5>
                    </a>
                  </div>
                </Form>
              </Container>
            </div>
          </ReactCardFlip>
        </div>
      )}
      {showOtpModal && (
        <div className="otp-modal">
          <div className="otp-box">
            <button
              onClick={() => setShowOtpModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h4>Email Verification</h4>
            <p>We've sent a 6-digit OTP to your email.</p>
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              isInputNum
              shouldAutoFocus
              inputStyle={{
                width: "3rem",
                height: "3rem",
                margin: "0 0.5rem",
                fontSize: "1.5rem",
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
              containerStyle={{
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            />
            <Button
              variant="primary"
              onClick={handleVerifyOtp}
              disabled={otp.length < 6}
              className="mb-3 otp-verify-btn"
            >
              Verify
            </Button>
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => setShowOtpModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6c63ff",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Change Email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
