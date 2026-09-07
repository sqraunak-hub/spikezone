import React from "react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

export const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<FaStar key={i} className="" style={{ color: "#FFD700" }} />);
    } else {
      stars.push(
        <FaRegStar key={i} className="" style={{ color: "#0000005d" }} />
      );
    }
  }

  return <div className="d-flex gap-1">{stars}</div>;
};

export const calculateAverageRating = (reviews) => {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (total / reviews.length).toFixed(1);
};

const ReviewList = ({ reviews }) => {
  const average = calculateAverageRating(reviews);

  return (
    <div className="mt-5">
      <h4>Customer Reviews</h4>
      <div className="d-flex align-items-center mb-3">
        {renderStars(Math.round(average))}
        <span className="ms-2 fw-bold">{average}</span>
        <span className="text-muted ms-2">({reviews.length} reviews)</span>
      </div>

      {reviews.map((review) => (
        <div
          key={review.id}
          className="border rounded p-3 mb-3 shadow-sm sz-review-card"
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <strong>{review.user_name}</strong>
              <div className="text-muted small">
                {formatDistanceToNow(new Date(review.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
            {renderStars(review.rating)}
          </div>
          <p className="mb-1">{review.review_text}</p>
        </div>
      ))}

      {reviews.length === 0 && <p>No reviews yet.</p>}
    </div>
  );
};
export default ReviewList;
