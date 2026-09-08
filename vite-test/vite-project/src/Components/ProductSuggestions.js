import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import axios from "axios";

import ProductCard from "./ProductCard";
import useCartStore from "../store/cartStore";
import "../Assets/CSS/product-suggestions.css";

/**
 * "You may also like" strip for the cart and checkout pages.
 *
 * Both pages are mostly empty space beside a narrow column, and a shopper who
 * has not finished deciding has nothing to look at. This fills that space with
 * something useful rather than decoration.
 *
 * Anything already in the cart is filtered out - suggesting what someone has
 * just added reads as a broken recommendation.
 */
export default function ProductSuggestions({
  title = "You may also like",
  subtitle = "Customers often pair these with what you have chosen.",
  limit = 4,
}) {
  const cartItems = useCartStore((state) => state.cartItems);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    axios
      .get("products/")
      .then((res) => {
        if (!cancelled) setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        // A failed suggestion fetch must never take the cart down with it -
        // the component just renders nothing.
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const inCart = new Set((cartItems || []).map((item) => item.id));
  const suggestions = products
    .filter((p) => !inCart.has(p.id) && p.inStock !== false)
    // Bestsellers first, so the strip leads with what actually sells.
    .sort((a, b) => Number(Boolean(b.isBest)) - Number(Boolean(a.isBest)))
    .slice(0, limit);

  if (loading) {
    return (
      <Container className="szsg">
        <div className="szsg-loading">
          <Spinner animation="border" role="status" size="sm" />
        </div>
      </Container>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <Container className="szsg">
      <div className="szsg-head">
        <div>
          <span className="szsg-eyebrow">Recommended</span>
          <h2 className="szsg-title">{title}</h2>
          <p className="szsg-sub">{subtitle}</p>
        </div>
        <Link to="/products" className="szsg-viewall">
          View all products <FaArrowRight aria-hidden="true" />
        </Link>
      </div>

      <div className="szsg-grid">
        {suggestions.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Container>
  );
}
