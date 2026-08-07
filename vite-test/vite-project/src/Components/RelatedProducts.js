import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import ProductCard from "./ProductCard";
import "../Assets/CSS/home-modern.css";

export default function RelatedProducts({ categoryId, currentId }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    axios.get("products/").then((res) => {
      const all = res.data || [];
      let picks = all.filter(
        (p) => p.category_id === categoryId && p.id !== currentId
      );
      // top up with other products if the same category has too few
      if (picks.length < 4) {
        const others = all.filter(
          (p) => p.id !== currentId && !picks.some((x) => x.id === p.id)
        );
        picks = [...picks, ...others];
      }
      setRelated(picks.slice(0, 4));
    });
  }, [categoryId, currentId]);

  if (related.length === 0) return null;

  return (
    <div className="sz-section">
      <div className="sz-section-head">
        <div>
          <span className="sz-eyebrow">You May Also Like</span>
          <h2 className="sz-title">Related Products</h2>
        </div>
        <Link to="/products" className="sz-viewall">
          View All <FaArrowRight />
        </Link>
      </div>
      <div className="sz-prod-grid">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
}
