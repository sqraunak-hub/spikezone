import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaArrowRight } from "react-icons/fa";
import "../Assets/CSS/home-modern.css";
import catBirdSpikes from "../Assets/IMG/cat-birdspikes.png";
import catPigeonSpikes from "../Assets/IMG/cat-pigeonspikes.jpg";
import catCombos from "../Assets/IMG/cat-combos.jpg";

const CATEGORY_IMAGES = [catBirdSpikes, catPigeonSpikes, catCombos];

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
        {categories.map((cat, idx) => (
          <Link
            key={cat.id}
            to={`/category/${cat.category_name}`}
            className="sz-cat-tile"
          >
            <img
              src={CATEGORY_IMAGES[idx % CATEGORY_IMAGES.length]}
              alt={cat.category_name}
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
