import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Assets/CSS/ReviewsPage.css";

import { API_BASE_URL } from "../Utils/appConstant";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE_URL}user-reviews/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));

    axios
      .get(`${API_BASE_URL}products/`)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const getProductName = (productId) => {
    const prod = products.find((p) => p.id === productId);
    return prod ? prod.title : "";
  };

  const filteredReviews = reviews.filter((review) => {
    const productName = review.product_title || getProductName(review.product);
    const matchesSearch =
      (review.review_text || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.user_name || "").toLowerCase().includes(searchTerm.toLowerCase());

    let status = "published";
    if (review.status) status = review.status;

    const matchesFilter = filterStatus === "all" || status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>
        ★
      </span>
    ));
  };

  const getStatusBadge = (status) => {
    if (status === "published")
      return <span className="badge published">Published</span>;
    if (status === "pending")
      return <span className="badge pending">Pending</span>;
    if (status === "draft") return <span className="badge draft">Draft</span>;
    return null;
  };

  return (
    <div className="reviews-page">
      <div className="header">
        <h1>Your Reviews</h1>
        <p>Manage your feedback effortlessly</p>
        <button className="add-btn">+ Add New Review</button>
      </div>

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search your reviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Reviews</option>
          <option value="published">Published</option>
          <option value="pending">Pending</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="reviews-list">
        {loading ? (
          <div className="empty">Loading...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="empty">No reviews found matching your criteria.</div>
        ) : (
          filteredReviews.map((review) => {
            const productName =
              review.product_title || getProductName(review.product);
            return (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div>
                    <h3>{review.review_text.slice(0, 40) || "Review"}</h3>
                    <div className="rating-product">
                      <div className="stars">{renderStars(review.rating)}</div>
                      <span className="dot">•</span>
                      <span className="product">{productName}</span>
                    </div>
                    <div className="meta">
                      {getStatusBadge(review.status || "published")}
                      <span className="date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="review-content">{review.review_text}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
