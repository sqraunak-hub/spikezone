import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import axios from "axios";
import "../Assets/CSS/home-modern.css";
import ProductCard from "./ProductCard";

export default function ProductShowcase() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("products/").then((res) => setProducts(res.data));
  }, []);

  if (products.length === 0) return null;

  return (
    <Container className="sz-section">
      <div className="sz-section-head">
        <div>
          <span className="sz-eyebrow">Full Catalogue</span>
          <h2 className="sz-title">Explore Our Range</h2>
          <p className="sz-sub">
            From stainless steel strips to complete balcony kits — everything
            you need for a bird-free home.
          </p>
        </div>
        <Link to="/products" className="sz-viewall">
          View All <FaArrowRight />
        </Link>
      </div>

      <div className="sz-prod-grid">
        {products.slice(0, 8).map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>

      {products.length > 8 && (
        <div className="text-center mt-4">
          <Link to="/products">
            <Button
              variant="outline-primary"
              style={{
                borderColor: "#1e9dcd",
                color: "#1e9dcd",
                borderRadius: "999px",
                fontWeight: 600,
                padding: "0.6rem 2rem",
              }}
            >
              See All {products.length} Products
            </Button>
          </Link>
        </div>
      )}
    </Container>
  );
}
