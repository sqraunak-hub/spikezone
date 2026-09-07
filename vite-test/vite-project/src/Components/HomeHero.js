import React from "react";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import {
  FaArrowRight,
  FaCity,
  FaUsers,
  FaThLarge,
  FaHandHoldingHeart,
} from "react-icons/fa";
// The supplied banner carries its headline, sub-heading and four badges as
// baked-in pixels, so nothing is overlaid on it and it is not dimmed.
//   hero-banner.jpg         2048x768, the full artwork (desktop)
//   hero-banner-mobile.jpg  the right-hand crop - bird and spike run only,
//                           because that text is ~10px tall on a phone
import heroDesktop from "../Assets/IMG/hero-banner.jpg";
import heroMobile from "../Assets/IMG/hero-banner-mobile.jpg";
import "../Assets/CSS/home-hero.css";

const STATS = [
  { icon: <FaCity />, value: "25+", label: "Cities Served" },
  { icon: <FaUsers />, value: "50,000+", label: "Homes Protected" },
  { icon: <FaThLarge />, value: "137", label: "Guides Published" },
  { icon: <FaHandHoldingHeart />, value: "100%", label: "Humane Solutions" },
];

export default function HomeHero() {
  return (
    <section className="szh-hero">
      <div className="szh-banner">
        <picture>
          <source media="(max-width: 768px)" srcSet={heroMobile} />
          <img
            src={heroDesktop}
            alt="Bird control spikes fitted along a parapet wall, deterring a landing pigeon"
            fetchPriority="high"
          />
        </picture>
      </div>

      {/*
        The banner shows this wording as artwork, which a crawler and a screen
        reader cannot read, and the phone crop drops it entirely. So it is real
        text either way - visible on small screens, assistive-only on desktop.
      */}
      <Container>
        <div className="szh-copy">
          <h1>Keep Birds Away</h1>
          <p>
            A humane, safe and long-lasting solution — bird control spikes for a
            cleaner, healthier space.
          </p>
        </div>

        <div className="szh-below">
          <div className="szh-hero-cta">
            <Link to="/products" className="szc-btn">
              Explore Products <FaArrowRight />
            </Link>
            <Link to="/bird-control/" className="szh-ghost">
              How It Works
            </Link>
          </div>

          <aside className="szh-stats" aria-label="Company at a glance">
            {STATS.map((s) => (
              <div className="szh-stat" key={s.label}>
                <span className="szh-stat-icon">{s.icon}</span>
                <div>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </Container>
    </section>
  );
}
