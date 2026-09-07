import React from "react";
import "../Assets/CSS/legal-pages.css"; // or wherever your CSS is
import useSeo from "../Utils/useSeo";
import { SITE_URL } from "../Utils/appConstant";

export default function TermsAndCondition() {
  useSeo({
    title: "Terms & Conditions | SpikeZone",
    description:
      "The terms that apply when you buy bird control products from SpikeZone.",
    canonical: `${SITE_URL}/terms`,
  });

  return (
    <div className="legal-page">
      <h2 className="mb-4">Terms and Conditions</h2>

      <p>
        Welcome to <strong>SpikeZone</strong>. By using our website, you agree
        to the following terms and conditions. Please read them carefully.
      </p>

      <h4>1. Use of Website</h4>
      <p>
        By accessing or purchasing from our website, you agree to comply with
        all applicable laws and our policies. You may not use our site for any
        fraudulent or unauthorized activity.
      </p>

      <h4>2. Product Information</h4>
      <p>
        We strive to provide accurate product descriptions and pricing. In case
        of errors, we reserve the right to update or cancel orders.
      </p>

      <h4>3. Orders and Payments</h4>
      <p>
        All orders are subject to availability and payment verification. We
        accept secure online payments via various trusted methods.
      </p>

      <h4>4. Shipping</h4>
      <p>
        We ship across India. Delivery times may vary based on your location.
        Delays due to courier or unforeseen events are not under our control.
      </p>

      <h4>5. Limitation of Liability</h4>
      <p>
        SpikeZone is not liable for indirect damages arising from use of
        products. All claims must be raised within 7 days of product delivery.
      </p>

      <h4>6. Changes to Terms</h4>
      <p>
        We may update these terms without prior notice. Continued use of the
        site implies acceptance of changes.
      </p>

      <p>
        For queries, please contact us at{" "}
        <a href="mailto:support@spikezone.in">support@spikezone.in</a>.
      </p>
    </div>
  );
}
