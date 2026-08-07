import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { Rating } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useUserStore from "../store/userStore";
import "../Assets/CSS/AddReview.css";
import PageTitle from "../Components/PageTitle";
import { CalendarIcon, Package2Icon, Star, IndianRupee } from "lucide-react";

import { API_BASE_URL } from "../Utils/appConstant";

const AddReview = () => {
  const { orderId, productId } = useParams();
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const navigate = useNavigate();
  const fetchUserProfile = useUserStore((state) => state.fetchUserProfile);
  const user = useUserStore((state) => state.user);

  //   useEffect(() => {
  //     const script = document.createElement("script");
  //     script.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
  //     script.onload = () => {
  //       console.log("Tailwind loaded");
  //     };
  //     document.head.appendChild(script);

  //     return () => {
  //       // Clean up
  //       document.head.removeChild(script);
  //     };
  //   }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get token from localStorage

    // Fetch order details
    axios
      .get(`/orders/${orderId}/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in the Authorization header
        },
      })
      .then((response) => {
        setOrder(response.data);
      })
      .catch((error) => {
        console.error("Error fetching order details:", error);
        toast.error("Failed to fetch order details.");
      });

    axios
      .get(`/products/${productId}/`)
      .then((response) => {
        setProduct(response.data);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
        toast.error("Failed to fetch product details.");
      });
  }, [orderId, productId]);

  const handleSubmitReview = async () => {
    if (rating === 0 || reviewText.trim() === "") {
      toast.error("Please provide a rating and a review.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Get token from localStorage

      await axios.post(
        `${API_BASE_URL}reviews/`,
        {
          user: user.id,
          order: orderId,
          product: productId,
          rating,
          review_text: reviewText,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include token in the Authorization header
          },
        }
      );
      toast.success("Review submitted successfully!");
      navigate("/orders"); // Redirect to orders page after submission
    } catch (error) {
      console.error("Error submitting review:", error.response.data[0]);
      toast.error(error.response.data[0]);
    }
  };

  if (!order || !product) {
    return (
      <div className="text-center my-5">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Write a Review" />
      <Container style={{ textAlign: "left" }} className="mt-5 main-container">
        <ToastContainer position="top-center" autoClose={5000} theme="light" />
        <Container className="order-details-container">
          <h3>Order Details</h3>
          <p className="text-muted">Review your purchase from this order.</p>
          <Row>
            <Col lg={3} md={12}>
              <img
                src={product.image1}
                alt={product.title}
                className="img-fluid rounded"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Col>
            <Col lg={9} md={12}>
              <Container>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{product.title}</h3>
                    <p className="font-medium mt-1">₹{product.price}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Package2Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Order Number:</span>
                      <span>{order.razorpay_order_id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Order Date:</span>
                      <span>{new Date(order.order_date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Container>
            </Col>
          </Row>
        </Container>
        <br></br>

        <Container className="review-form-container mt-4">
          <h3>Your Review</h3>
          <p className="text-muted">Share your experience with this product</p>
          <Container>
            <div className="space-y-2">
              <label className="font-medium">Rating</label>
              <div className="flex gap-1">
                <Rating
                  name="product-rating"
                  value={rating}
                  onChange={(event, newValue) => setRating(newValue)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="review" className="font-medium">
                Review
              </label>
              <Form.Control
                as="textarea"
                rows={5}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here..."
              />
            </div>
          </Container>
        </Container>
        {reviewText === "" || rating === 0 ? (
          <button
            className="mt-4 submit-review-btn"
            disabled
            onClick={handleSubmitReview}
          >
            Submit Review
          </button>
        ) : (
          <button
            className="mt-4 submit-review-btn"
            onClick={handleSubmitReview}
          >
            Submit Review
          </button>
        )}
      </Container>
    </>
  );
};

export default AddReview;
