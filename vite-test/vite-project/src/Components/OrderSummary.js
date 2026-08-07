import React from "react";
import { Container } from "react-bootstrap";
import useCartStore from "../store/cartStore";
import "../Assets/CSS/checkout.css";

export default function OrderSummary() {
  const { cartItems, getTotalAmount } = useCartStore();
  const shipCost = 0;
  const totalAmount = getTotalAmount();

  return (
    <Container>
      {cartItems.length > 0 ? (
        cartItems.map((cart) => (
          <div key={cart.id} className="os-pr-sec">
            <div className="os-pr-sec-item">
              <img src={cart.image1} alt={cart.title} />
            </div>
            <div className="os-pr-sec-item">
              <p style={{ fontWeight: "bold" }}>{cart.title}</p>
            </div>
            <div className="os-pr-sec-item">{cart.quantity}</div>
            <div className="os-pr-sec-item">Rs.{cart.price}/-</div>
          </div>
        ))
      ) : (
        <h1>No Data</h1>
      )}

      <div className="os-rt-sec mt-5">
        <div className="os-rt-nm">
          <p>Items Subtotal:</p>
          <p>Shipping:</p>
          <p>Amount to be paid:</p>
        </div>
        <div className="os-rt-vl">
          <p>Rs.{totalAmount}/-</p>
          <p>Rs.{shipCost}/-</p>
          <p>Rs.{totalAmount + shipCost}/-</p>
        </div>
      </div>
    </Container>
  );
}
