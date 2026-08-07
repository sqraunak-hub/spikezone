import React from "react";
import { Container } from "react-bootstrap";
import {
  FaFeatherAlt,
  FaShieldAlt,
  FaTools,
  FaRupeeSign,
  FaLeaf,
  FaIndustry,
} from "react-icons/fa";
import "../Assets/CSS/home-modern.css";
import collageImg from "../Assets/IMG/collagetwo.png";

const FEATURES = [
  {
    icon: <FaFeatherAlt className="sz-feature-icon" />,
    title: "100% Humane",
    text: "Blunt-tip designs scare birds away without ever hurting them.",
  },
  {
    icon: <FaShieldAlt className="sz-feature-icon" />,
    title: "Built to Last",
    text: "Rust-proof steel and UV-treated polycarbonate survive years of sun and rain.",
  },
  {
    icon: <FaTools className="sz-feature-icon" />,
    title: "Easy DIY Installation",
    text: "Peel-and-stick or screw-fit in minutes — no professional needed.",
  },
  {
    icon: <FaRupeeSign className="sz-feature-icon" />,
    title: "Honest Pricing",
    text: "Factory-direct rates with bulk discounts for large projects.",
  },
  {
    icon: <FaLeaf className="sz-feature-icon" />,
    title: "Eco-Friendly",
    text: "Recyclable materials and zero chemicals — safe for kids and pets.",
  },
  {
    icon: <FaIndustry className="sz-feature-icon" />,
    title: "Industry Trusted",
    text: "Chosen by DMRC, PowerGrid, Berger and hundreds of societies.",
  },
];

export default function WhyUs() {
  return (
    <div className="sz-why">
      <Container>
        <div className="sz-why-wrap">
          <img
            src={collageImg}
            alt="SpikeZone products installed on AC units, ledges and rooftops"
            className="sz-why-img"
          />
          <div>
            <span className="sz-eyebrow">Why SpikeZone</span>
            <h2 className="sz-title">
              India&apos;s trusted bird control brand since 2015
            </h2>
            <p className="sz-sub">
              We manufacture humane bird deterrents that protect your home from
              droppings, nesting and damage — without harming a single bird.
            </p>
            <div className="sz-why-features">
              {FEATURES.map((f) => (
                <div className="sz-feature" key={f.title}>
                  {f.icon}
                  <div>
                    <h6>{f.title}</h6>
                    <p>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sz-stats">
          <div className="sz-stat">
            <h3>10+</h3>
            <p>Years of Manufacturing</p>
          </div>
          <div className="sz-stat">
            <h3>50,000+</h3>
            <p>Homes Protected</p>
          </div>
          <div className="sz-stat">
            <h3>4.7★</h3>
            <p>Average Rating</p>
          </div>
          <div className="sz-stat">
            <h3>25+</h3>
            <p>Cities Served</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
