import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import PageTitle from "../Components/PageTitle";
import OrderSummary from "../Components/OrderSummary";
import ProductSuggestions from "../Components/ProductSuggestions";
// .checkout-container, .address-form, .addresses-list and .order-summary
// all live in this sheet. It only reached the page via OrderSummary, which
// is fragile - the screen that uses the classes should import them.
import "../Assets/CSS/checkout.css";
import "../Assets/CSS/ManageAddress.css";
import useCartStore from "../store/cartStore";
import useUserStore from "../store/userStore";
import useAddressStore from "../store/addressStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { SiRazorpay } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import { MdAdd } from "react-icons/md";
import Cookies from "js-cookie";
import SEOHelmet from "../Components/SEOHelmet";
import { API_BASE_URL } from "../Utils/appConstant";

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Load Razorpay's checkout script once, on demand. */
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  const existing = document.querySelector(`script[src="${RAZORPAY_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", () =>
        reject(new Error("Could not load the payment window."))
      );
    });
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = RAZORPAY_SRC;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Could not load the payment window."));
    document.body.appendChild(s);
  });
}


export default function Checkout() {
  const { cartItems, totalAmount, clearCart } = useCartStore();
  const cartCookiesItems = Cookies.get("cartItems") || [];

  const {
    addresses,
    loading,
    fetchAddresses,
    addAddress,
    selectedAddress,
    setSelectedAddress,
  } = useAddressStore();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    phone: "",
    address: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
  });
  const user = useUserStore((state) => state.user);

  const [payLoading, setPayLoading] = useState(false);

  const Navigate = useNavigate();

  useEffect(() => {
    fetchAddresses(user.id);
  }, [fetchAddresses, user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const addressData = {
        ...newAddress,
        user: user.id,
      };
      const savedAddress = await addAddress(addressData);
      setSelectedAddress(savedAddress);
      setShowAddressModal(false);
      setNewAddress({
        full_name: "",
        phone: "",
        address: "",
        address_line2: "",
        city: "",
        state: "",
        zip_code: "",
      });
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    setPayLoading(true);

    try {
      const orderData = {
        user: user.id,
        address: selectedAddress.id,
        items: cartItems.map((item) => ({
          product: item.id,
          quantity: item.quantity,
        })),
        delivery_status: "pending",
        payment_status: "pending",
      };
      const accessToken = localStorage.getItem("token");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const orderResponse = await axios.post(
        `${API_BASE_URL}orders/`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const orderId = orderResponse.data.id;

      const options = {
        key: orderResponse.data.key,
        amount: orderResponse.data.razorpay_amount,
        currency: "INR",
        name: "SpikeZone",
        description: "Order Payment",
        order_id: orderResponse.data.razorpay_order_id,
        handler: async function (razorpayResponse) {
          const accessToken = localStorage.getItem("token");
          if (!accessToken) {
            throw new Error("No access token found");
          }
          try {
            const verificationResponse = await axios.post(
              `${API_BASE_URL}orders/${orderId}/verify_payment/`,
              {
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (verificationResponse.data?.status === "success") {
              toast.success("Payment successful!");

              clearCart();
              Navigate("/orders");
              setPayLoading(false);
            } else {
              toast.error("Payment verification failed");
              setPayLoading(false);
            }
          } catch (error) {
            setPayLoading(false);
            toast.error(
              error.response?.data?.message || "Payment verification failed"
            );
          }
        },
        prefill: {
          name: selectedAddress.full_name,
          contact: selectedAddress.phone,
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {},
        },
      };

      // Razorpay's script used to load in index.html on every page, which cost
      // every visitor a third-party request for a checkout they may never
      // reach. It is fetched here instead, the first time someone pays.
      await loadRazorpay();

      const rzp = new window.Razorpay(options);
      rzp.open();
      setPayLoading(false);

      rzp.on("payment.failed", function (response) {
        toast.error("Payment failed. Please try again.");
      });
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    }
  };

  return (
    <>
      <SEOHelmet />
      <PageTitle title={"Checkout"} />
      <ToastContainer position="top-center" autoClose={5000} theme="light" />

      <div className="checkout-container mt-3">
        <Container>
          <Row>
            <Col sm={8}>
              <div className="address-form container">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="c-titles mb-0">Shipping Details</p>
                  <div className="d-flex justify-content-end mb-4">
                    <button
                      variant="primary"
                      onClick={() => setShowAddressModal(true)}
                      className="d-flex align-items-center gap-2 add-address-btn"
                    >
                      <MdAdd size={20} /> Add New Address
                    </button>
                  </div>
                </div>

                <p>Select a delivery or add a new</p>

                {loading ? (
                  <div>Loading addresses...</div>
                ) : (
                  <div className="addresses-list">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`address-card p-3 mb-3 border rounded ${
                          selectedAddress?.id === address.id
                            ? "border-primary"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedAddress(address);
                        }}
                      >
                        <p className="mb-1 fw-bold">{address.full_name}</p>
                        <p className="mb-1">{address.phone}</p>
                        <p className="mb-1">
                          {address.address}
                          {address.address_line2 &&
                            `, ${address.address_line2}`}
                        </p>
                        <p className="mb-1">
                          {address.city}, {address.state} - {address.zip_code}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
            <Col sm={4}>
              <div className="order-summary container">
                <p className="c-titles">Order Summary</p>
                <OrderSummary cartItems={cartItems} totalAmount={totalAmount} />
                <button
                  className={
                    selectedAddress ? "abled-checkout" : "disabled-checkout"
                  }
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddress}
                >
                  {!payLoading ? (
                    <>
                      Proceed to Pay{"   "} <SiRazorpay />
                    </>
                  ) : (
                    <>
                      <Spinner />
                    </>
                  )}
                </button>
                <div
                  className="d-flex align-items-center justify-content-center mt-3"
                  style={{ scale: "0.7" }}
                >
                  <span className="me-2">Pay Securely with</span>
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsGIDjd0ARrzXv6HnE5BpNhZTEoQrRy-_HUA&s"
                    alt="Razorpay"
                    style={{ height: "20px", width: "auto" }}
                  />
                </div>
              </div>
            </Col>
          </Row>

          <ProductSuggestions
            title="Complete your setup"
            subtitle="Shoppers who ordered these items usually needed one of these too."
          />
        </Container>
      </div>

      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddAddress}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.full_name}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, full_name: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={newAddress.phone}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, phone: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.address}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    address: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address Line 2</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.address_line2}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    address_line2: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>ZIP Code</Form.Label>
              <Form.Control
                type="text"
                value={newAddress.zip_code}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    zip_code: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Save Address
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
