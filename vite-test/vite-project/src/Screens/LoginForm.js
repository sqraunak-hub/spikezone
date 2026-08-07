import React, { useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../Services/authService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useUserStore from "../store/userStore";

const LoginForm = ({ handleToggle }) => {
  const navigate = useNavigate();
  const [apiLoad, setApiLoad] = useState(false);
  const [formData, setFormData] = useState({
    emailLogin: "",
    passwordLogin: "",
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    setApiLoad(true);
    e.preventDefault();
    try {
      const { data, status } = await loginUser({
        email: formData.emailLogin,
        password: formData.passwordLogin,
      });

      if (status === 200) {
        let token = data.token.access;
        toast.success(data.msg);
        localStorage.setItem("token", token);

        useUserStore.getState().setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        });

        setApiLoad(false);
        navigate("/");
      }
    } catch (error) {
      setApiLoad(false);
    }
  };
  return (
    <>
      <ToastContainer />
      <div className="container login-container front login mt-5">
        <Form onSubmit={handleLoginSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              name="emailLogin"
              value={formData.emailLogin}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              name="passwordLogin"
              value={formData.passwordLogin}
              onChange={handleChange}
            />
          </Form.Group>

          {apiLoad ? (
            <button type="submit" className="form-submit mt-4" disabled>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </button>
          ) : (
            <button type="submit" className="form-submit mt-4">
              Login
            </button>
          )}

          <div className="register-btn-container mt-3">
            <Link to="#" className="forgot-pass-btn">
              <h5>Forgot Password ?</h5>
            </Link>
            <Link
              to="#"
              className="register-btn flipbutton"
              id="registerButton"
              onClick={handleToggle}
            >
              <h5>New ? Create New Account Now </h5>
            </Link>
          </div>
        </Form>
      </div>
    </>
  );
};

export default LoginForm;
