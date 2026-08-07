import React from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../Assets/CSS/home-modern.css";

export default function HomeCta() {
  return (
    <Container>
      <div className="sz-cta">
        <div>
          <h3>Not sure which product fits your problem?</h3>
          <p>
            Tell us about your balcony, ledge or rooftop — our team will suggest
            the right solution for free.
          </p>
        </div>
        <Link to="/contact" className="sz-cta-btn">
          Get Free Advice
        </Link>
      </div>
    </Container>
  );
}
