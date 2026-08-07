import React from "react";
import "../Assets/CSS/legal-pages.css";
export default function ReturnRefundPolicy() {
  return (
    <div className="container py-5 legal-page">
      <h2 className="mb-4">Returns & Refund Policy</h2>

      <p>
        Thank you for shopping with <strong>SpikeZone</strong>. We aim to ensure
        your satisfaction with every purchase.
      </p>

      <h4>1. Returns</h4>
      <p>
        Currently, we do not support direct returns via the website. If you wish
        to return a product, please email us at{" "}
        <a href="mailto:returns_refunds@spikezone.in">
          returns_refunds@spikezone.in
        </a>{" "}
        within 7 days of delivery. Our team will guide you through the process.
      </p>

      <h4>2. Refunds</h4>
      <p>
        Once your return is approved and we receive the product, your refund
        will be processed within 5-7 working days to the original payment
        method.
      </p>

      <h4>3. Non-Returnable Items</h4>
      <ul>
        <li>Items damaged due to misuse or wear and tear</li>
        <li>Custom orders or modified products</li>
        <li>Products returned after 7 days</li>
      </ul>

      <h4>4. Exchanges</h4>
      <p>
        Currently, we do not offer direct product exchanges. You may initiate a
        return and place a new order.
      </p>

      <h4>5. Contact Us</h4>
      <p>
        For any issues related to returns or refunds, feel free to reach out at{" "}
        <a href="mailto:returns_refunds@spikezone.in">
          returns_refunds@spikezone.in
        </a>
        .
      </p>
    </div>
  );
}
