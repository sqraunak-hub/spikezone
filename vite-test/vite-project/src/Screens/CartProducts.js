import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import "../Assets/CSS/cart.css";
import Products from "./Products";
import { Link, useNavigate } from "react-router-dom";
import { ImCross } from "react-icons/im";
import Table from "react-bootstrap/Table";
import axios from "axios";
import { BsCheck } from "react-icons/bs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageTitle from "../Components/PageTitle";
export default function Cart(props) {
  const Navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState("");
  const [pincodeValid, setPincodeValid] = useState(null);
  const [shipCost, setshipCost] = useState(0);

  function calculateSubTotal(items) {
    return items.reduce((accumulator, currentProduct) => {
      return accumulator + currentProduct.productTotal;
    }, 0);
  }

  function updateCartItems(cart) {
    setCartItems(cart);
  }

  useEffect(() => {
    const localItems = JSON.parse(localStorage.getItem("cartItems"));
    setCartItems(localItems);
  }, []); // empty dependency array since we only want to run this once

  useEffect(() => {
    const timer = setTimeout(() => {
      const total = totalBillAmount(cartItems);
      setTotalAmount(total);
      setLoading(false);
    }, 2000); // wait for 2 seconds before calculating total amount

    return () => clearTimeout(timer);
  }, [cartItems]); // add cartItems to the dependency array to tr

  const totalBillAmount = (cartItems) => {
    setLoading(true);
    let total = 0;

    if (cartItems) {
      cartItems.forEach((product) => {
        total += product.price * product.quantity;
      });
      setLoading(false);
    }
    return total;
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
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <PageTitle as="h2" title={"Your Shopping Cart"} />
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
            {cartItems ? (
              <>
                {cartItems.map((cart) => (
                  <tr key={cart.id}>
                    <td style={{ width: "1%" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={cart.image1}
                          className="cart-image"
                          style={{
                            width: "10em",
                            borderRadius: "0px",
                          }}
                        />
                      </div>
                    </td>
                    <td>{cart.title}</td>
                    <td>
                      <form className="q-form">
                        <input
                          className="q-input"
                          type="number"
                          value={cart.quantity}
                        />
                      </form>
                    </td>
                    <td>{cart.price}</td>
                    <td>{cart.productTotal}</td>
                    <td>
                      <Button className="delete-btn">
                        <ImCross />
                      </Button>
                    </td>
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td colSpan={4}>
                  <h1>No Data</h1>
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
            Hello
          </Col>
          <Col md={4} sm={5} xs={12}>
            {" "}
            <div>
              <button className="cart-shop-btn">Continue Shopping</button>
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
