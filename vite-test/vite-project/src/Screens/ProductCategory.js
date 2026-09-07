import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container, Accordion } from "react-bootstrap";
import {
  FaArrowRight,
  FaShieldAlt,
  FaTruck,
  FaHandHoldingHeart,
} from "react-icons/fa";
import ProductCard from "../Components/ProductCard";
import Loader from "../Components/Loader";
import NotFound from "../Components/NotFound";
import { SITE_URL } from "../Utils/appConstant";
import { findCategoryBySlug, productInCategory } from "../Utils/slugify";
import useSeo from "../Utils/useSeo";
import { CATEGORY_CONTENT, fallbackContent } from "../Utils/categoryContent";
import catBirdSpikes from "../Assets/IMG/cat-birdspikes.jpg";
import catPigeonSpikes from "../Assets/IMG/cat-pigeonspikes.jpg";
import catCombos from "../Assets/IMG/cat-combos.jpg";
import "../Assets/CSS/category-landing.css";

const TRUST = [
  { icon: <FaHandHoldingHeart />, label: "100% Humane" },
  { icon: <FaShieldAlt />, label: "Rust-proof Build" },
  { icon: <FaTruck />, label: "Pan-India Delivery" },
];

const CATEGORY_IMAGES = {
  "bird-spikes": catBirdSpikes,
  "pigeon-spikes": catPigeonSpikes,
  "combos-kits": catCombos,
};

export default function ProductCategory() {
  const { categorySlug } = useParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([axios.get("uploadCategory/"), axios.get("products/")])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data || []);
        setProducts(prodRes.data || []);
      })
      .catch(() => {
        setCategories([]);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Derived before the early returns so the hook order stays stable.
  const category = findCategoryBySlug(categories, categorySlug);
  const name = category?.category_name || "";
  const content = category
    ? CATEGORY_CONTENT[categorySlug] || fallbackContent(name)
    : null;
  const canonical = `${SITE_URL}/products/${categorySlug}`;
  const heroImage = CATEGORY_IMAGES[categorySlug];

  useSeo({
    title: content?.metaTitle,
    description: content?.metaDescription,
    canonical: content ? canonical : undefined,
    image: heroImage ? `${SITE_URL}${heroImage}` : undefined,
  });

  // BreadcrumbList, matching what the content pages already emit. Without it a
  // category result shows the bare URL instead of "Home > Products > ...".
  useEffect(() => {
    const ID = "sz-category-schema";
    const existing = document.getElementById(ID);
    if (!category) {
      if (existing) existing.parentNode.removeChild(existing);
      return undefined;
    }
    const el = existing || document.createElement("script");
    el.id = ID;
    el.type = "application/ld+json";
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "Home", item: `${SITE_URL}/` },
        { name: "Products", item: `${SITE_URL}/products` },
        { name, item: canonical },
      ].map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.item,
      })),
    });
    if (!existing) document.head.appendChild(el);
    return () => {
      const node = document.getElementById(ID);
      if (node) node.parentNode.removeChild(node);
    };
  }, [category, name, canonical]);

  if (loading) return <Loader />;

  // Unknown slug -> real 404 instead of an empty "no products" page.
  if (!category) return <NotFound />;

  const items = products.filter((p) => productInCategory(p, name));

  return (
    <>
      {/* ---------- Hero ---------- */}
      <div className="szc-hero">
        <Container>
          <nav className="szc-crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="szc-crumb-sep">/</span>
            <Link to="/products">Products</Link>
            <span className="szc-crumb-sep">/</span>
            <span className="szc-crumb-current">{name}</span>
          </nav>

          <div className="szc-hero-grid">
            <div className="szc-hero-copy">
              <span className="szc-eyebrow">{content.eyebrow}</span>
              <h1 className="szc-h1">{content.heading}</h1>
              <p className="szc-tagline">{content.tagline}</p>

              <div className="szc-trust">
                {TRUST.map((t) => (
                  <span className="szc-trust-chip" key={t.label}>
                    {t.icon} {t.label}
                  </span>
                ))}
              </div>
            </div>

            {heroImage && (
              <div className="szc-hero-media">
                <div className="szc-hero-frame">
                  <img src={heroImage} alt={name} />
                </div>
                {items.length > 0 && (
                  <div className="szc-hero-badge">
                    <strong>{items.length}</strong>
                    <span>
                      {items.length === 1 ? "Product" : "Products"} in range
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* ---------- Intro copy ---------- */}
      <Container className="szc-intro">
        <div className="szc-intro-rule" aria-hidden="true" />
        <div className="szc-intro-body">
          {content.intro.map((para, i) => (
            <p key={i} className={i === 0 ? "szc-lead" : undefined}>
              {para}
            </p>
          ))}
        </div>
      </Container>

      {/* ---------- Products ---------- */}
      <Container className="szc-section">
        <div className="szc-head">
          <div>
            <span className="szc-eyebrow">Shop the range</span>
            <h2 className="szc-h2">{name}</h2>
            <p className="szc-sub">{content.gridSub}</p>
          </div>
          <Link to="/products" className="szc-viewall">
            All Products <FaArrowRight />
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="szc-prod-grid">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="szc-empty">
            <p>No products in this category yet — check back soon.</p>
            <Link to="/products" className="szc-btn">
              Browse all products <FaArrowRight />
            </Link>
          </div>
        )}
      </Container>

      {/* ---------- Buying guide ---------- */}
      <section className="szc-guide">
        <Container>
          <div className="szc-head szc-head-center">
            <div>
              <span className="szc-eyebrow szc-eyebrow-light">Buying guide</span>
              <h2 className="szc-h2 szc-h2-light">{content.guideTitle}</h2>
              <p className="szc-sub szc-sub-light">{content.guideSub}</p>
            </div>
          </div>
          <div className="szc-guide-grid">
            {content.guide.map((g, i) => (
              <div className="szc-guide-card" key={g.title}>
                <span className="szc-guide-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{g.title}</h3>
                <p>{g.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- FAQ ---------- */}
      <Container className="szc-section">
        <div className="szc-head">
          <div>
            <span className="szc-eyebrow">Need help?</span>
            <h2 className="szc-h2">Frequently Asked Questions</h2>
            <p className="szc-sub">
              Everything customers ask us before ordering {name.toLowerCase()}.
            </p>
          </div>
        </div>
        <Accordion defaultActiveKey="0" className="szc-faq">
          {content.faqs.map((f, i) => (
            <Accordion.Item eventKey={String(i)} key={f.q}>
              <Accordion.Header>{f.q}</Accordion.Header>
              <Accordion.Body>{f.a}</Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>

      {/* ---------- CTA ---------- */}
      <section className="szc-cta">
        <Container>
          <span className="szc-eyebrow szc-eyebrow-light">Free consultation</span>
          <h2>Not sure which product fits your problem?</h2>
          <p>
            Tell us about your balcony, ledge or rooftop — our team will suggest
            the right solution at no cost.
          </p>
          <Link to="/contact" className="szc-btn">
            Get Free Advice <FaArrowRight />
          </Link>
        </Container>
      </section>
    </>
  );
}
