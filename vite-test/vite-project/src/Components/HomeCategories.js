import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import {
  FaArrowRight,
  FaChevronDown,
  FaDove,
  FaBorderAll,
  FaScrewdriverWrench,
  FaTableCellsLarge,
  FaLayerGroup,
  FaLocationDot,
  FaCircleQuestion,
} from "react-icons/fa6";
import { GiMonkey } from "react-icons/gi";
import spikesImg from "../Assets/IMG/cat-birdspikes.jpg";
import monkeyImg from "../Assets/IMG/cat-monkey-spikes.jpg";
import netImg from "../Assets/IMG/cat-anti-bird-net.jpg";
import "../Assets/CSS/home-categories.css";
import { FAMILIES } from "../Utils/productFamilies";

/**
 * A card is a compact summary; clicking it opens that family's link panel
 * below the row, one at a time.
 *
 * The links come from Utils/productFamilies.js, shared with the top menu — the
 * panel shows all six groups, the menu shows the first four. Icons and photos
 * stay here because assets and components do not belong in a data module.
 *
 * All three panels stay in the DOM and are hidden with CSS rather than being
 * conditionally rendered: these ~110 links are the internal linking into the
 * 137 guides, and a panel that only exists after a click is a panel a crawler
 * never sees.
 */
const FAMILY_ICONS = {
  "bird-spikes": <FaDove />,
  "monkey-spikes": <GiMonkey />,
  "anti-bird-net": <FaBorderAll />,
};

const FAMILY_IMAGES = {
  "bird-spikes": spikesImg,
  "monkey-spikes": monkeyImg,
  "anti-bird-net": netImg,
};

const GROUP_ICONS = {
  "bird-control": <FaDove />,
  solution: <FaScrewdriverWrench />,
  application: <FaTableCellsLarge />,
  location: <FaLocationDot />,
  types: <FaLayerGroup />,
  faqs: <FaCircleQuestion />,
};

export default function HomeCategories() {
  const [openId, setOpenId] = useState(null);

  return (
    <section className="szcat">
      <Container>
        <div className="szcat-grid">
          {FAMILIES.map((f) => {
            const open = openId === f.id;
            return (
              <article
                className={`szcat-card szcat-h${f.hue}${
                  open ? " is-open" : ""
                }`}
                key={f.id}
              >
                <button
                  type="button"
                  className="szcat-toggle"
                  onClick={() => setOpenId(open ? null : f.id)}
                  aria-expanded={open}
                  aria-controls={`szcat-panel-${f.id}`}
                >
                  <span className="szcat-icon" aria-hidden="true">
                    {FAMILY_ICONS[f.id]}
                  </span>
                  <span className="szcat-copy">
                    <span className="szcat-name">{f.title}</span>
                    <span className="szcat-blurb">{f.blurb}</span>
                  </span>
                  <span className="szcat-media" aria-hidden="true">
                    <img src={FAMILY_IMAGES[f.id]} alt="" loading="lazy" />
                  </span>
                  {/* the affordance is the whole card, so this is a span
                      inside the button rather than a nested control */}
                  <span className="szcat-cta">
                    Explore {f.title}
                    <FaChevronDown />
                  </span>
                </button>
              </article>
            );
          })}
        </div>

        {/* One panel per family, all present in the DOM; CSS shows the open one. */}
        {FAMILIES.map((f) => (
          <div
            className={`szcat-panel szcat-h${f.hue}${
              openId === f.id ? " is-open" : ""
            }`}
            id={`szcat-panel-${f.id}`}
            key={f.id}
            role="region"
            aria-label={`${f.title} links`}
          >
            <div className="szcat-banner">
              <span className="szcat-banner-shield" aria-hidden="true">
                {FAMILY_ICONS[f.id]}
              </span>
              <span className="szcat-banner-id">
                <span className="szcat-banner-name">{f.title}</span>
                <span className="szcat-banner-eyebrow">Complete Guide</span>
              </span>
              <span className="szcat-banner-copy">
                <span className="szcat-banner-tag">
                  {f.tagline[0]}
                  <strong>{f.tagline[1]}</strong>
                </span>
                <span className="szcat-banner-trust">
                  {f.trust.map((w) => (
                    <span key={w}>{w}</span>
                  ))}
                </span>
              </span>
              <Link to={f.to} className="szcat-banner-link">
                Full guide <FaArrowRight />
              </Link>
              <span className="szcat-banner-art" aria-hidden="true">
                <img src={FAMILY_IMAGES[f.id]} alt="" loading="lazy" />
              </span>
            </div>

            <div className="szcat-cols">
              {f.groups.map((g) => (
                <div className="szcat-col" key={g.id}>
                  <div className="szcat-col-head">
                    <span className="szcat-col-icon" aria-hidden="true">
                      {GROUP_ICONS[g.id]}
                    </span>
                    <span className="szcat-col-titles">
                      <span className="szcat-col-name">{g.heading}</span>
                      <span className="szcat-col-sub">{g.sub}</span>
                    </span>
                  </div>

                  <div className="szcat-col-body">
                    <ul>
                      {g.links.map((l) => (
                        <li key={l.to + l.label}>
                          <Link to={l.to}>
                            <span className="szcat-dot" aria-hidden="true">
                              {GROUP_ICONS[g.id]}
                            </span>
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link className="szcat-all" to={g.all.to}>
                      {g.all.label} <FaArrowRight />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
