import React from "react";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import {
  FaArrowRight,
  FaBuilding,
  FaWindowMaximize,
  FaBorderAll,
  FaHouse,
  FaSnowflake,
  FaSolarPanel,
  FaSignHanging,
  FaIndustry,
} from "react-icons/fa6";
import solarImg from "../Assets/IMG/use-solar-panels.jpg";
import acImg from "../Assets/IMG/use-ac-unit.jpg";
import "../Assets/CSS/home-usecases.css";

/**
 * Surfaces we supply for. Each tile links to the page that actually covers it.
 *
 * `img` is only set where a real photograph of that surface exists. The rest
 * render an icon tile rather than borrowing an unrelated photo - a picture of
 * spikes captioned "Solar Panels" would be worse than no picture.
 * Drop a file in Assets/IMG and add it here to upgrade a tile.
 */
const TILES = [
  {
    label: "Balcony & Railing",
    to: "/solutions/balcony-bird-problems/",
    icon: <FaBuilding />,
  },
  {
    label: "Window Ledge",
    to: "/solutions/window-sill-bird-problems/",
    icon: <FaWindowMaximize />,
  },
  {
    label: "Parapet Wall",
    to: "/solutions/parapet-bird-problems/",
    icon: <FaBorderAll />,
  },
  {
    label: "Rooftop",
    to: "/applications/rooftop/",
    icon: <FaHouse />,
  },
  {
    label: "AC Outdoor Unit",
    to: "/applications/ac-outdoor-unit/",
    icon: <FaSnowflake />,
    img: acImg,
  },
  {
    label: "Solar Panels",
    to: "/applications/solar-panels/",
    icon: <FaSolarPanel />,
    img: solarImg,
  },
  {
    label: "Signage & Boards",
    to: "/solutions/tube-light-bird-problems/",
    icon: <FaSignHanging />,
  },
  {
    label: "Industrial Areas",
    to: "/applications/warehouse/",
    icon: <FaIndustry />,
  },
];

export default function HomeUseCases() {
  return (
    <section className="szu">
      <Container>
        <div className="szu-head">
          <div>
            <span className="szc-eyebrow">Where it goes</span>
            <h2 className="szc-h2">Where can you use our solutions?</h2>
            <p className="szc-sub">
              Every surface birds land on needs a slightly different answer.
              Pick yours and we will tell you what fits.
            </p>
          </div>
          <Link to="/solutions/" className="szc-viewall">
            All Surfaces <FaArrowRight />
          </Link>
        </div>

        <div className="szu-grid">
          {TILES.map((t) => (
            <Link
              to={t.to}
              className={`szu-tile${t.img ? " szu-has-img" : ""}`}
              key={t.label}
            >
              {t.img ? (
                <img src={t.img} alt={t.label} loading="lazy" />
              ) : (
                <span className="szu-icon" aria-hidden="true">
                  {t.icon}
                </span>
              )}
              <span className="szu-label">{t.label}</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
