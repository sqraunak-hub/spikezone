import React, { useRef } from "react";

export default function OrderLabel({ order }) {
  return (
    <div style={{ padding: "20px", width: "300px", fontSize: "14px" }}>
      <h4 style={{ marginBottom: "10px" }}>Order Label</h4>
      <p>
        <strong>Name:</strong> {order.user_details?.name}
      </p>
      <p>
        <strong>Phone:</strong> {order.user_details?.contact}
      </p>
      <p>
        <strong>Address:</strong>
      </p>
      <p style={{ whiteSpace: "pre-line" }}>
        {order.address_details?.address_line1}
        {"\n"}
        {order.address_details?.city}, {order.address_details?.state} -{" "}
        {order.address_details?.pincode}
      </p>
      <p>
        <strong>Amount:</strong> ₹{order.total_amount}
      </p>
    </div>
  );
}
