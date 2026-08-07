import React, { useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../Services/authService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupForm = ({ handleToggle }) => {
  const navigate = useNavigate();
  const [apiLoad, setApiLoad] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    state: "",
    city: "",
    postalcode: "",
    password: "",
    conPassword: "",
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleRegisterSubmit = async (e) => {
    // Handle register submit logic
  };

  return (
    <>
      <ToastContainer />
      <div className="container back register mt-3">
        <Form onSubmit={handleRegisterSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formContact">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your contact number"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formAddress">
            <Form.Label>Full Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Other form fields go here */}

          {apiLoad ? (
            <button type="submit" className="form-submit mt-4" disabled>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </button>
          ) : (
            <button type="submit" className="form-submit mt-4">
              Register
            </button>
          )}

          <div className="register-btn-container mt-3">
            <Link
              to="#"
              className="register-btn flipbutton"
              id="loginButton"
              onClick={handleToggle}
            >
              <h5>Already Registered ? Login Now ! </h5>
            </Link>
          </div>
        </Form>
      </div>
    </>
  );
};

export default SignupForm;
