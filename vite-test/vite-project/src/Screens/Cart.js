import React, { useState } from "react";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import { ImCross } from "react-icons/im";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageTitle from "../Components/PageTitle";
import useCartStore from "../store/cartStore";
import { BsCheck } from "react-icons/bs";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import SEOHelmet from "../Components/SEOHelmet";
export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getTotalAmount } =
    useCartStore();
  const [pincode, setPincode] = useState("");
  const [pincodeValid, setPincodeValid] = useState(null);
  const [shipCost, setshipCost] = useState(0);
  const totalAmount = getTotalAmount();
  const Navigate = useNavigate();

  const handleQuantityChange = (id, quantity) => {
    if (quantity < 1) return;
    updateQuantity(id, quantity);
  };

  const handleCheckout = () => {
    if (totalAmount == 0) {
      alert("Please add items to cart first");
    } else {
      Navigate("/checkout");
    }
  };

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    axios
      .get(`https://api.postalpincode.in/pincode/${pincode}`)
      .then((response) => {
        const status = response.data[0].Status;
        if (status === "Success") {
          setPincodeValid(true);
        } else {
          setPincodeValid(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <SEOHelmet />
      <ToastContainer position="top-center" autoClose={5000} theme="light" />
      <PageTitle as="h2" title={"Your Selections"} />
      <Container className="cart-container mt-5">
        <Table hover className="table-container">
          <thead className="cart-table-head">
            <tr>
              <th>IMAGE</th>
              <th>TITLE</th>
              <th>QUANTITY</th>
              <th>PRICE</th>
              <th>SUBTOTAL</th>
              <th>REMOVE</th>
            </tr>
          </thead>
          <tbody className="cart-table-content">
            {cartItems.length > 0 ? (
              cartItems.map((cart) => (
                <tr key={cart.id}>
                  <td>
                    <img
                      src={cart.image1}
                      className="cart-image"
                      style={{ width: "10em" }}
                    />
                  </td>
                  <td>{cart.title}</td>
                  <td>
                    <input
                      type="number"
                      className="q-input"
                      value={cart.quantity}
                      onChange={(e) =>
                        handleQuantityChange(cart.id, parseInt(e.target.value))
                      }
                    />
                  </td>
                  <td>{cart.price}</td>
                  <td>{cart.price * cart.quantity}</td>
                  <td>
                    <Button
                      className="delete-btn"
                      onClick={() => removeFromCart(cart.id)}
                    >
                      <ImCross />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <h1>No Items in Cart</h1>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
      <Container>
        <Row className="mt-3">
          <Col md={8} sm={7} xs={12}>
            {" "}
          </Col>
          <Col md={4} sm={5} xs={12}>
            {" "}
            <div>
              <Link to="/products">
                <button className="cart-shop-btn">Add more products</button>
              </Link>
            </div>
            <div className="cart-summary mt-3">
              <div className="cart-subtotal">
                <p style={{ fontSize: "18px", fontWeight: 500 }}>Subtotal</p>
                <p style={{ fontSize: "18px", fontWeight: 500, color: "var(--szc-danger)" }}>
                  Rs.{totalAmount}/-
                </p>
              </div>
              <hr />
              <div className="cart-shipping">
                <span>Shipping</span>
                <form
                  className="cart-pincode mt-2"
                  onSubmit={handlePincodeSubmit}
                >
                  <input
                    type="number"
                    name="pincode"
                    className="cart-summary-pincode"
                    placeholder="Enter Your Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "black",
                      color: "white",
                      fontSize: "20px",
                    }}
                  >
                    <BsCheck />
                  </button>
                </form>
              </div>
              {pincodeValid !== null &&
                (pincodeValid ? (
                  <>
                    <span className="mt-1 text-success">Pincode validated</span>
                    <div className="shipping-content mt-3">
                      <p>Shipping Fee</p>
                      <p>+ Rs.{shipCost}/-</p>
                    </div>
                  </>
                ) : (
                  <span className="text-danger">
                    Please Enter a Valid Pincode Please
                  </span>
                ))}
              <div className="cart-total mt-5">
                <span>Total Payable</span>
                <span style={{ color: "var(--szc-danger)" }}>
                  Rs.{totalAmount + shipCost}/-
                </span>
              </div>
              <div className="checkout-btn-section mt-3">
                {pincodeValid ? (
                  <button className="abled-checkout" onClick={handleCheckout}>
                    Checkout
                  </button>
                ) : (
                  <button
                    className="disabled-checkout"
                    onClick={() => toast.error("Enter Pincode first")}
                  >
                    Checkout
                  </button>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
