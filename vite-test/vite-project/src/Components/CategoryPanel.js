import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaArrowRight } from "react-icons/fa";
import { categoryPath } from "../Utils/appConstant";
import { categorySlug } from "../Utils/slugify";
import "../Assets/CSS/home-modern.css";
import catBirdSpikes from "../Assets/IMG/cat-birdspikes.jpg";
import catPigeonSpikes from "../Assets/IMG/cat-pigeonspikes.jpg";
import catMonkeySpikes from "../Assets/IMG/cat-monkey-spikes.jpg";
import catAntiBirdNet from "../Assets/IMG/cat-anti-bird-net.jpg";

/**
 * Keyed by slug, not by position. These used to be an array indexed with
 * `idx % 3`, so when a fourth category was added Monkey Spikes inherited the
 * combo artwork and Anti Bird Net wrapped back round to the bird-spike photo.
 * A category without an entry falls back rather than borrowing the wrong one.
 */
const CATEGORY_IMAGES = {
  "bird-spikes": catBirdSpikes,
  "pigeon-spikes": catPigeonSpikes,
  "monkey-spikes": catMonkeySpikes,
  "anti-bird-net": catAntiBirdNet,
};

export default function CategoryPanel() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("uploadCategory/").then((res) => setCategories(res.data));
    axios.get("products/").then((res) => setProducts(res.data));
  }, []);

  const productCount = (name) =>
    products.filter((p) => p.category_name === name).length;

  return (
    <Container className="sz-section">
      <div className="sz-section-head">
        <div>
          <span className="sz-eyebrow">Browse Collections</span>
          <h2 className="sz-title">Shop by Category</h2>
          <p className="sz-sub">
            Purpose-built protection for every surface — pick the range that
            fits your problem.
          </p>
        </div>
        <Link to="/products" className="sz-viewall">
          View All Products <FaArrowRight />
        </Link>
      </div>

      <div className="sz-cat-grid">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={categoryPath(categorySlug(cat))}
            className="sz-cat-tile"
          >
            <img
              src={CATEGORY_IMAGES[categorySlug(cat)] || catBirdSpikes}
              alt={cat.category_name}
              loading="lazy"
            />
            {productCount(cat.category_name) > 0 && (
              <span className="sz-cat-count">
                {productCount(cat.category_name)} Products
              </span>
            )}
            <div className="sz-cat-overlay">
              <h3>{cat.category_name}</h3>
              <span>
                Shop Now <FaArrowRight />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
