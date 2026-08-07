import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import {
  FaFacebookF,
  FaTwitter,
  FaGoogle,
  FaInstagram,
  FaLinkedinIn,
  FaHome,
  FaEnvelope,
  FaPhoneAlt,
  FaPrint,
} from "react-icons/fa";
import "../Assets/CSS/Footer.css";
import logo from "../Assets/IMG/logo.png";
import rzpbadge from "../Assets/IMG/rzpbadge.png";

const SOCIALS = [
  { icon: <FaFacebookF />, href: "https://www.facebook.com/spikezoneltd/", label: "Facebook" },
  { icon: <FaTwitter />, href: "https://twitter.com/spikezoneltd", label: "Twitter" },
  { icon: <FaGoogle />, href: "https://g.co/kgs/aqvYBpW", label: "Google" },
  { icon: <FaInstagram />, href: "https://www.instagram.com/spikezone_birdspikes/", label: "Instagram" },
  { icon: <FaLinkedinIn />, href: "https://in.linkedin.com/company/spikezone-bird-spikes", label: "LinkedIn" },
];

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get("uploadCategory/").then((response) => {
      setCategories(response.data);
    });
  }, []);

  return (
    <footer className="sz-footer mt-5">
      {/* top wave separator */}
      <div className="sz-footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
          <path
            d="M0,50 C240,90 480,0 720,30 C960,60 1200,10 1440,45 L1440,0 L0,0 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* animated background shapes */}
      <div className="sz-footer-bg" aria-hidden="true">
        <span className="sz-blob sz-blob-1"></span>
        <span className="sz-blob sz-blob-2"></span>
        <span className="sz-blob sz-blob-3"></span>
        <span className="sz-ring sz-ring-1"></span>
        <span className="sz-ring sz-ring-2"></span>
        <span className="sz-dot sz-dot-1"></span>
        <span className="sz-dot sz-dot-2"></span>
        <span className="sz-dot sz-dot-3"></span>

        {/* flying birds */}
        <svg className="sz-bird sz-bird-1" viewBox="0 0 100 50">
          <path
            d="M5 25 Q25 5 50 22 Q75 5 95 25 Q75 18 50 30 Q25 18 5 25 Z"
            fill="currentColor"
          />
        </svg>
        <svg className="sz-bird sz-bird-2" viewBox="0 0 100 50">
          <path
            d="M5 25 Q25 5 50 22 Q75 5 95 25 Q75 18 50 30 Q25 18 5 25 Z"
            fill="currentColor"
          />
        </svg>
        <svg className="sz-bird sz-bird-3" viewBox="0 0 100 50">
          <path
            d="M5 25 Q25 5 50 22 Q75 5 95 25 Q75 18 50 30 Q25 18 5 25 Z"
            fill="currentColor"
          />
        </svg>

        {/* spike strip silhouette at the bottom */}
        <svg className="sz-spikes" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path
            d="M0,40 L10,8 L20,40 L30,8 L40,40 L50,8 L60,40 L70,8 L80,40 L90,8 L100,40 L110,8 L120,40 L130,8 L140,40 L150,8 L160,40 L170,8 L180,40 L190,8 L200,40 L210,8 L220,40 L230,8 L240,40 L250,8 L260,40 L270,8 L280,40 L290,8 L300,40 L310,8 L320,40 L330,8 L340,40 L350,8 L360,40 L370,8 L380,40 L390,8 L400,40 L410,8 L420,40 L430,8 L440,40 L450,8 L460,40 L470,8 L480,40 L490,8 L500,40 L510,8 L520,40 L530,8 L540,40 L550,8 L560,40 L570,8 L580,40 L590,8 L600,40 L610,8 L620,40 L630,8 L640,40 L650,8 L660,40 L670,8 L680,40 L690,8 L700,40 L710,8 L720,40 L730,8 L740,40 L750,8 L760,40 L770,8 L780,40 L790,8 L800,40 L810,8 L820,40 L830,8 L840,40 L850,8 L860,40 L870,8 L880,40 L890,8 L900,40 L910,8 L920,40 L930,8 L940,40 L950,8 L960,40 L970,8 L980,40 L990,8 L1000,40 L1010,8 L1020,40 L1030,8 L1040,40 L1050,8 L1060,40 L1070,8 L1080,40 L1090,8 L1100,40 L1110,8 L1120,40 L1130,8 L1140,40 L1150,8 L1160,40 L1170,8 L1180,40 L1190,8 L1200,40 L1210,8 L1220,40 L1230,8 L1240,40 L1250,8 L1260,40 L1270,8 L1280,40 L1290,8 L1300,40 L1310,8 L1320,40 L1330,8 L1340,40 L1350,8 L1360,40 L1370,8 L1380,40 L1390,8 L1400,40 L1410,8 L1420,40 L1430,8 L1440,40 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <Container className="sz-footer-content">
        <Row className="gy-4 pt-4">
          <Col lg={4} md={6}>
            <div className="sz-footer-brand">
              <img src={logo} alt="SpikeZone Logo" className="footer-logo mb-3" />
              <h6 className="sz-footer-head">SpikeZone by S.K Enterprises</h6>
              <p className="sz-footer-about">
                SpikeZone, originally owned by S.K Enterprises, was established
                in 2010 with the motive of providing safety from bird nuisance —
                selling humane bird-control products online and offline, all
                over the world.
              </p>
              <div className="sz-socials">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="sz-social-btn"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </Col>

          <Col lg={2} md={6} sm={6}>
            <h6 className="sz-footer-head">Products</h6>
            <ul className="sz-footer-links">
              {categories.slice(0, 3).map((category) => (
                <li key={category.id}>
                  <a href={`/category/${category.category_name}`}>
                    {category.category_name}
                  </a>
                </li>
              ))}
              <li>
                <a href="/products" className="sz-footer-more">
                  All Products →
                </a>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6} sm={6}>
            <h6 className="sz-footer-head">Useful Links</h6>
            <ul className="sz-footer-links">
              <li><a href="/blogs">Blogs</a></li>
              <li><a href="/gallery">Gallery</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/return-policy">Returns &amp; Refunds</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/contact">Help &amp; Support</a></li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h6 className="sz-footer-head">Contact</h6>
            <ul className="sz-footer-contact">
              <li>
                <FaHome /> <span>Mitraon, Najafgarh, Delhi - 110043</span>
              </li>
              <li>
                <FaEnvelope />{" "}
                <a href="mailto:support@spikezone.in">support@spikezone.in</a>
              </li>
              <li>
                <FaPhoneAlt /> <span>+91 98731 99277</span>
              </li>
              <li>
                <FaPrint /> <span>+91 9999492068</span>
              </li>
            </ul>
          </Col>
        </Row>

        <div className="sz-footer-bottom">
          <img
            src={rzpbadge}
            alt="Payments Powered by Razorpay"
            className="sz-rzp"
          />
          <div className="sz-copy">
            © {new Date().getFullYear()} SpikeZone{" "}
            <a href="https://spikezone.in/">spikezone.in</a> — All rights
            reserved
          </div>
        </div>
      </Container>
    </footer>
  );
}
