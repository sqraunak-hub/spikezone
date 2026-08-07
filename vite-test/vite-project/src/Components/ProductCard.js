import React from "react";
import "../Assets/CSS/Card.css";
import { Link } from "react-router-dom";
import { Rating } from "@mui/material";
import { FaArrowRight } from "react-icons/fa";

export default function ProductCard(props) {
  const { product } = props;
  if (!product) return null;

  const price = parseInt(product.price, 10);
  const mrp = parseInt(product.max_price, 10);
  const hasDiscount = !isNaN(price) && !isNaN(mrp) && mrp > price;
  const discount = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const rating = parseFloat(product.average_rating);

  return (
    <Link to={`/products/${product.slug}`} className="sz-pcard">
      <div className="sz-pcard-imgwrap">
        {hasDiscount && <span className="sz-pcard-badge">-{discount}%</span>}
        {product.isBest && <span className="sz-pcard-best">Bestseller</span>}
        <img src={product.image1} alt={product.title} loading="lazy" />
      </div>
      <div className="sz-pcard-body">
        {product.category_name && (
          <span className="sz-pcard-cat">{product.category_name}</span>
        )}
        <h3 className="sz-pcard-title">{product.title}</h3>
        {!isNaN(rating) && rating > 0 && (
          <div className="sz-pcard-rating">
            <Rating value={rating} precision={0.1} size="small" readOnly />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
        <p className="sz-pcard-desc">{product.short_desc}</p>
        <div className="sz-pcard-pricerow">
          <span className="sz-pcard-price">₹{product.price}</span>
          {hasDiscount && <span className="sz-pcard-mrp">₹{product.max_price}</span>}
        </div>
        <span className="sz-pcard-btn">
          View Product <FaArrowRight />
        </span>
      </div>
    </Link>
  );
}
