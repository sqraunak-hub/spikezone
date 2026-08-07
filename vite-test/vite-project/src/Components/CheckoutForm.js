import React, { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { MdEdit } from "react-icons/md";

export default function CheckoutForm({
  onAddressSubmit,
  address,
  isEditing,
  setIsEditing,
}) {
  const [formData, setFormData] = useState(
    address || {
      fullName: "",
      contact: "",
      address: "",
      state: "",
      city: "",
      pincode: "",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddressSubmit(formData);
    setIsEditing(false);
  };

  return (
    <>
      {isEditing ? (
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formFullName" className="mb-3">
                <div className="checkout-input">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                  <span className="password-login-span">Full Name</span>
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formContact" className="mb-3">
                <div className="checkout-input">
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />
                  <span className="password-login-span">Phone</span>
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group controlId="formAddress" className="mb-3">
                <div className="checkout-input">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                  <span className="password-login-span">Address</span>
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Group controlId="formCity" className="mb-3">
                <div className="checkout-input">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  <span className="password-login-span">City</span>
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formState" className="mb-3">
                <div className="checkout-input">
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                  <span className="password-login-span">State</span>
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formPincode" className="mb-3">
                <div className="checkout-input">
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                  <span className="password-login-span">Pincode</span>
                </div>
              </Form.Group>
            </Col>
          </Row>
          <div className="checkout-btn-section mt-3">
            <button
              className="abled-checkout address-add-chk-form"
              type="submit"
            >
              Add Address
            </button>
          </div>
        </Form>
      ) : (
        <div class="address-details-checkout">
          <p>
            <strong>Full Name:</strong> {formData.fullName}
          </p>
          <p>
            <strong>Phone:</strong> {formData.contact}
          </p>
          <p>
            <strong>Address:</strong> {formData.address}
          </p>
          <p>
            <strong>City:</strong> {formData.city}
          </p>
          <p>
            <strong>State:</strong> {formData.state}
          </p>
          <p>
            <strong>Pincode:</strong> {formData.pincode}
          </p>
          <button className=" chk-form-edt" onClick={() => setIsEditing(true)}>
            <span>
              <MdEdit />
            </span>
            <span>Edit Address</span>
          </button>
        </div>
      )}
    </>
  );
}
