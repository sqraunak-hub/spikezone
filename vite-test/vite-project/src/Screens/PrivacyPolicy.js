import React from "react";
import "../Assets/CSS/legal-pages.css";
export default function PrivacyPolicy() {
  return (
    <div className="container py-5 legal-page">
      <h2 className="mb-4">Privacy Policy</h2>
      <p>
        At <strong>SpikeZone</strong>, we value your privacy and are committed
        to protecting your personal data. This Privacy Policy explains how we
        collect, use, and safeguard your information when you visit our website.
      </p>

      <h4>1. Information We Collect</h4>
      <p>
        We collect information that you provide directly, such as name, email,
        shipping address, and payment details. We also collect non-personal
        information such as browser type, IP address, and pages visited.
      </p>

      <h4>2. How We Use Your Information</h4>
      <ul>
        <li>To process and deliver your orders</li>
        <li>To send order updates and promotional emails</li>
        <li>To improve website experience and customer service</li>
      </ul>

      <h4>3. Data Sharing</h4>
      <p>
        We do not sell or rent your personal data. We may share data with
        trusted service providers for payment processing, shipping, and
        marketing, under strict confidentiality agreements.
      </p>

      <h4>4. Cookies</h4>
      <p>
        Our website uses cookies to improve your browsing experience and analyze
        site traffic. You can control cookies through your browser settings.
      </p>

      <h4>5. Your Rights</h4>
      <p>
        You may request access, correction, or deletion of your personal data
        anytime by contacting us at <strong>support@spikezone.in</strong>.
      </p>

      <h4>6. Updates to Policy</h4>
      <p>
        This Privacy Policy may be updated occasionally. Please review it
        regularly.
      </p>

      <p>
        For questions, contact us at{" "}
        <a href="mailto:support@spikezone.in">support@spikezone.in</a>.
      </p>
    </div>
  );
}
