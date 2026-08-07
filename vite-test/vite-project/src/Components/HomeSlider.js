import React from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaTruck, FaHandHoldingHeart, FaAward, FaHeadset } from "react-icons/fa";
import "../Assets/CSS/home-modern.css";
import bannerMain from "../Assets/IMG/banner_main.png";
import bannerMobile from "../Assets/IMG/banner_main_mb.png";

function HomeSlider() {
  return (
    <>
      <Link to="/products" className="sz-hero" aria-label="Shop bird control products">
        <img
          src={bannerMain}
          alt="Say goodbye to pest birds with SpikeZone bird nuisance solutions"
          className="sz-hero-desktop"
        />
        <img
          src={bannerMobile}
          alt="Say goodbye to pest birds with SpikeZone bird nuisance solutions"
          className="sz-hero-mobile"
        />
      </Link>

      <div className="sz-usp">
        <Container>
          <div className="sz-usp-inner">
            <div className="sz-usp-item">
              <FaTruck className="sz-usp-icon" />
              <div>
                <h6>Pan-India Delivery</h6>
                <p>Doorstep delivery across India</p>
              </div>
            </div>
            <div className="sz-usp-item">
              <FaHandHoldingHeart className="sz-usp-icon" />
              <div>
                <h6>100% Humane</h6>
                <p>Deters birds without harming them</p>
              </div>
            </div>
            <div className="sz-usp-item">
              <FaAward className="sz-usp-icon" />
              <div>
                <h6>Trusted Since 2015</h6>
                <p>Leading bird spike manufacturer</p>
              </div>
            </div>
            <div className="sz-usp-item">
              <FaHeadset className="sz-usp-icon" />
              <div>
                <h6>Expert Support</h6>
                <p>Free guidance for installation</p>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export default HomeSlider;
