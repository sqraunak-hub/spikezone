import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import axios from "axios";
import {
  FaArrowRight,
  FaShieldAlt,
  FaTruck,
  FaHandHoldingHeart,
} from "react-icons/fa";
import ProductCard from "../Components/ProductCard";
import Loader from "../Components/Loader";
import NotFound from "../Components/NotFound";
import { SITE_URL, categoryPath } from "../Utils/appConstant";
import { slugify } from "../Utils/slugify";
import useSeo from "../Utils/useSeo";
import {
  findContentPage,
  gridHeading,
  groupByCategory,
  loadContentIndex,
  loadFragment,
  matchProducts,
  normalizePath,
  productIntent,
} from "../Utils/contentPages";
import catBirdSpikes from "../Assets/IMG/cat-birdspikes.jpg";
import catPigeonSpikes from "../Assets/IMG/cat-pigeonspikes.jpg";
import catCombos from "../Assets/IMG/cat-combos.jpg";
import birdcat from "../Assets/IMG/birdcat.jpg";
import monkeycat from "../Assets/IMG/monkeycat.jpg";
import "../Assets/CSS/content-body.css";
import "../Assets/CSS/content-page.css";

const TRUST = [
  { icon: <FaHandHoldingHeart />, label: "100% Humane" },
  { icon: <FaShieldAlt />, label: "Direct Manufacturer" },
  { icon: <FaTruck />, label: "Pan-India Delivery" },
];

const HERO_IMAGES = {
  "bird-spikes": catBirdSpikes,
  "pigeon-spikes": catPigeonSpikes,
  "monkey-spikes": monkeycat,
  "anti-bird-net": birdcat,
  "bird-feeders": birdcat,
  "bird-food-feeders": birdcat,
  "bird-water-feeders": birdcat,
};

const CRUMB_LABELS = {
  "bird-control": "Bird Control",
  "bird-care": "Bird Care",
  locations: "Locations",
  solutions: "Solutions",
  applications: "Applications",
};

const crumbs = (url) => {
  const parts = url.split("/").filter(Boolean);
  let acc = "";
  return parts.map((part, i) => {
    acc += `/${part}`;
    return {
      to: `${acc}/`,
      label:
        CRUMB_LABELS[part] ||
        part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      last: i === parts.length - 1,
    };
  });
};

/**
 * The fragments ship their own <section class="hero"> and <section
 * class="final-cta">. Pull those out so they can be rendered in full-width
 * bands instead of sitting inside the article column - and so the page does
 * not end up with two <h1>s.
 */
const splitFragment = (raw) => {
  if (!raw) return { hero: "", body: "", cta: "" };
  const doc = new DOMParser().parseFromString(
    `<div id="wrap">${raw}</div>`,
    "text/html"
  );
  const wrap = doc.getElementById("wrap");

  const heroEl = wrap.querySelector("section.hero");
  const ctaEl = wrap.querySelector("section.final-cta");
  const hero = heroEl ? heroEl.innerHTML : "";
  const cta = ctaEl ? ctaEl.innerHTML : "";
  if (heroEl) heroEl.remove();
  if (ctaEl) ctaEl.remove();

  return { hero, body: wrap.innerHTML, cta };
};

export default function ContentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const [entry, setEntry] = useState(undefined); // undefined = loading, null = 404
  const [raw, setRaw] = useState("");
  const [products, setProducts] = useState([]);

  const url = normalizePath(location.pathname);

  // The fragments carry an id on every h2/h3, and the home page links straight
  // at them (#types-of-bird-spikes, #frequently-asked-questions). The target
  // only exists once the fragment is injected, so the scroll waits for `raw`.
  useEffect(() => {
    if (!raw || !location.hash) return undefined;
    const id = decodeURIComponent(location.hash.slice(1));
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      // instant, not smooth: these guides run to 13,000px, and animating a
      // 7,000px jump just makes the visitor watch the page fly past
      if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
    }, 60);
    return () => window.clearTimeout(t);
  }, [raw, location.hash]);

  useEffect(() => {
    let cancelled = false;
    setEntry(undefined);
    setRaw("");
    // A hash means the visitor asked for a section, so leave the scroll to the
    // effect above rather than yanking them to the top first.
    if (!location.hash) window.scrollTo(0, 0);

    // An empty index means the manifest fetch failed, not that the page is
    // missing — showing a 404 for a network blip would be wrong. Retry once
    // before giving up (loadContentIndex drops its cache on failure).
    const resolve = (retry) =>
      loadContentIndex().then((index) => {
        if (cancelled) return;
        if (!index.length && retry) {
          window.setTimeout(() => resolve(false), 600);
          return;
        }
        const found = findContentPage(index, location.pathname);
        setEntry(found);
        if (found) {
          loadFragment(found.path).then((text) => {
            if (!cancelled) setRaw(text);
          });
        }
      });

    resolve(true);

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    axios
      .get("products/")
      .then((res) => {
        if (!cancelled) setProducts(res.data || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Anchors inside the injected HTML are plain <a>; route them through the
  // router so they do not trigger a full page reload.
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return undefined;
    const onClick = (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/") || a.target === "_blank") return;
      e.preventDefault();
      navigate(href);
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [raw, navigate]);

  const { hero, body, cta } = useMemo(() => splitFragment(raw), [raw]);

  useSeo({
    title: entry?.title,
    description: entry?.description,
    canonical: entry ? `${SITE_URL}${entry.url}` : undefined,
    type: "article",
  });

  // BreadcrumbList mirroring the visible trail, so the result shows
  // "Bird Control › Bird Spikes" instead of a bare URL.
  useEffect(() => {
    const ID = "sz-breadcrumb-schema";
    const existing = document.getElementById(ID);
    if (!entry) {
      if (existing) existing.parentNode.removeChild(existing);
      return undefined;
    }
    const parts = crumbs(entry.url);
    const el = existing || document.createElement("script");
    el.id = ID;
    el.type = "application/ld+json";
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        ...parts.map((c, i) => ({
          "@type": "ListItem",
          position: i + 2,
          name: c.label,
          item: `${SITE_URL}${c.to}`,
        })),
      ],
    });
    if (!existing) document.head.appendChild(el);
    return () => {
      const node = document.getElementById(ID);
      if (node) node.parentNode.removeChild(node);
    };
  }, [entry]);

  if (entry === undefined) return <Loader />;
  if (entry === null) return <NotFound />;

  const { reason } = matchProducts(products, url, 4);
  const heading = gridHeading(url, reason, entry.h1);
  const groups = groupByCategory(products, url, 4);
  const trail = crumbs(url);
  const intent = productIntent(url);
  const heroImage = intent ? HERO_IMAGES[intent.slug] : catCombos;
  const ctaHasButton = /class="[^"]*\bbtn\b/.test(cta);

  return (
    <div ref={pageRef} className="szcp">
      {/* ---------------- hero ---------------- */}
      <div className="szcp-hero">
        <Container>
          <nav className="szcp-crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            {trail.map((c) => (
              <React.Fragment key={c.to}>
                <span className="szcp-sep">/</span>
                {c.last ? (
                  <span className="szcp-current">{c.label}</span>
                ) : (
                  <Link to={c.to}>{c.label}</Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          <div className="szcp-hero-grid">
            <div
              className="szcp-hero-copy sz-content"
              dangerouslySetInnerHTML={{ __html: hero }}
            />
            {heroImage && (
              <div className="szcp-hero-media">
                <div className="szcp-hero-frame">
                  <img src={heroImage} alt={entry.h1} loading="eager" />
                </div>
                <div className="szcp-hero-badge">
                  <strong>{entry.words.toLocaleString()}</strong>
                  <span>word guide</span>
                </div>
              </div>
            )}
          </div>

          <div className="szcp-trust">
            {TRUST.map((t) => (
              <span className="szcp-chip" key={t.label}>
                {t.icon} {t.label}
              </span>
            ))}
          </div>
        </Container>
      </div>

      {/* ---------------- Shop Now ---------------- */}
      {groups.length > 0 && (
        <Container className="szcp-shop">
          <div className="szcp-shop-head">
            <div>
              <span className="szc-eyebrow">Shop Now</span>
              <h2 className="szc-h2">{heading.title}</h2>
              <p className="szc-sub">
                Buy direct from the manufacturer — factory pricing, pan-India
                delivery, free shipping above ₹999.
              </p>
            </div>
            <Link to="/products" className="szc-viewall">
              All Products <FaArrowRight />
            </Link>
          </div>

          {groups.map((group) => (
            <section className="szcp-cat" key={group.name}>
              <div className="szcp-cat-head">
                <h3>
                  {group.name}
                  {group.relevant && (
                    <span className="szcp-cat-tag">On this page</span>
                  )}
                </h3>
                <Link to={categoryPath(slugify(group.name))}>
                  View all <FaArrowRight />
                </Link>
              </div>
              <div className="szcp-grid">
                {group.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          ))}
        </Container>
      )}

      {/* ---------------- article ---------------- */}
      <Container>
        <div
          className="sz-content szcp-body"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </Container>

      {/* ---------------- closing CTA ---------------- */}
      <section className="szcp-cta">
        <Container>
          <span className="szc-eyebrow szc-eyebrow-light">
            Free consultation
          </span>
          {cta ? (
            <div
              className="sz-content szcp-cta-body"
              dangerouslySetInnerHTML={{ __html: cta }}
            />
          ) : (
            <>
              <h2>Tell us about your site and we will size it for you</h2>
              <p>
                Send measurements or photos and our team will tell you exactly
                what you need — at no cost.
              </p>
            </>
          )}
          {/* The fragment usually ends with its own buttons; only add one when
              it does not, so their links are not lost or duplicated. */}
          {!ctaHasButton && (
            <Link to="/contact" className="szc-btn">
              Get Free Advice <FaArrowRight />
            </Link>
          )}
        </Container>
      </section>
    </div>
  );
}
