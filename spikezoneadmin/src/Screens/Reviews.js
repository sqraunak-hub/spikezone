import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { MdInfo, MdDelete, MdEdit } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { API_BASE_URL } from "../Utils/appConstant";

function showApiErrors(error) {
  if (error?.response?.data) {
    const data = error.response.data;
    Object.keys(data).forEach((key) => {
      const val = data[key];
      if (Array.isArray(val)) {
        val.forEach((msg) => toast.error(`${key}: ${msg}`));
      } else {
        toast.error(`${key}: ${val}`);
      }
    });
  } else if (error?.message) {
    toast.error(error.message);
  } else {
    toast.error("An unknown error occurred.");
  }
}

export function ReviewsContent() {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Add Review Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addReviewData, setAddReviewData] = useState({
    product: "",
    rating: "",
    review_text: "",
    name: "",
  });
  const [addReviewErrors, setAddReviewErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editReviewData, setEditReviewData] = useState({
    product: "",
    rating: "",
    review_text: "",
    name: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editReviewErrors, setEditReviewErrors] = useState({});

  // Fetch all products for dropdown
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}products/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProducts(response.data);
    } catch (error) {
      showApiErrors(error);
    }
  };

  // Fetch reviews from the API
  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}reviews/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const reviewsData = await Promise.all(
        response.data.map(async (review) => {
          const productResponse = await axios.get(
            `${API_BASE_URL}products/${review.product}/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const userResponse = await axios.get(
            `${API_BASE_URL}profile/?id=${review.user}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return {
            ...review,
            product: productResponse.data,
            user: userResponse.data,
          };
        })
      );

      setReviews(reviewsData);
    } catch (error) {
      showApiErrors(error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  const handleInfo = (review) => {
    setSelectedReview(review);
    setShowInfoModal(true);
  };

  const handleAddReviewChange = (e) => {
    const { name, value } = e.target;
    setAddReviewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateAddReview = () => {
    const errors = {};
    if (!addReviewData.product) errors.product = "Product is required";
    if (!addReviewData.rating) errors.rating = "Rating is required";
    if (!addReviewData.review_text)
      errors.review_text = "Review text is required";
    if (!addReviewData.name) errors.name = "Name is required";
    setAddReviewErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!validateAddReview()) {
      toast.error("Please fill all required fields!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}admin/add-review/`,
        {
          product: addReviewData.product,
          rating: addReviewData.rating,
          review_text: addReviewData.review_text,
          name: addReviewData.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Review added successfully!");
      setShowAddModal(false);
      setAddReviewData({ product: "", rating: "", review_text: "", name: "" });
      fetchReviews();
    } catch (error) {
      showApiErrors(error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}reviews/${reviewId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Review deleted successfully!");
      fetchReviews();
    } catch (error) {
      showApiErrors(error);
    }
  };

  const handleEditReview = (review) => {
    setEditReviewId(review.id);
    setEditReviewData({
      product: review.product?.id || "",
      rating: review.rating || "",
      review_text: review.review_text || "",
      name: review.user?.name || "",
    });
    setShowEditModal(true);
    setEditReviewErrors({});
  };

  // Handle edit review input change
  const handleEditReviewChange = (e) => {
    const { name, value } = e.target;
    setEditReviewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate edit review
  const validateEditReview = () => {
    const errors = {};
    if (!editReviewData.product) errors.product = "Product is required";
    if (!editReviewData.rating) errors.rating = "Rating is required";
    if (!editReviewData.review_text)
      errors.review_text = "Review text is required";
    if (!editReviewData.name) errors.name = "Name is required";
    setEditReviewErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!validateEditReview()) {
      toast.error("Please fill all required fields!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}reviews/${editReviewId}/`,
        {
          product: editReviewData.product,
          rating: editReviewData.rating,
          review_text: editReviewData.review_text,
          name: editReviewData.name,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Review updated successfully!");
      setShowEditModal(false);
      fetchReviews();
    } catch (error) {
      showApiErrors(error);
    }
  };

  return (
    <>
      <Container className="mt-5 shadow cat-container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Reviews</h3>
          <Button className="p-2" onClick={() => setShowAddModal(true)}>
            + Add Review
          </Button>
        </div>
        <hr />
        <Table striped bordered hover className="shadow">
          <thead>
            <tr>
              <th>#</th>
              <th>Product Image</th>
              <th>Rating</th>
              <th>Review</th>
              <th>User Name</th>
              <th>Order ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review, index) => (
              <tr key={review.id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={review.product.image1}
                    alt={review.product.title}
                    style={{ width: "100px", height: "100px" }}
                  />
                </td>
                <td>{review.rating}</td>
                <td>{review.review_text}</td>
                <td>{review.user.name}</td>
                <td>{review.razorpay_order_id}</td>
                <td>
                  <Button
                    variant="info"
                    style={{ color: "white", marginRight: "8px" }}
                    onClick={() => handleInfo(review)}
                  >
                    <MdInfo style={{ color: "white" }} />
                  </Button>

                  <Button
                    variant="danger"
                    style={{ color: "white" }}
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    <MdDelete style={{ color: "white" }} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddReview}>
            <Form.Group>
              <Form.Label>Product</Form.Label>
              <Form.Select
                name="product"
                value={addReviewData.product}
                onChange={handleAddReviewChange}
                style={{ borderColor: addReviewErrors.product ? "red" : "" }}
              >
                <option value="">Select a Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.slug}
                  </option>
                ))}
              </Form.Select>
              {addReviewErrors.product && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {addReviewErrors.product}
                </p>
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label>Rating</Form.Label>
              <Form.Select
                name="rating"
                value={addReviewData.rating}
                onChange={handleAddReviewChange}
                style={{ borderColor: addReviewErrors.rating ? "red" : "" }}
              >
                <option value="">Select Rating</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Form.Select>
              {addReviewErrors.rating && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {addReviewErrors.rating}
                </p>
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={addReviewData.name}
                onChange={handleAddReviewChange}
                style={{
                  borderColor: addReviewErrors.name ? "red" : "",
                }}
                placeholder="Enter reviewer name"
              />
              {addReviewErrors.name && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {addReviewErrors.name}
                </p>
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label>Review Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="review_text"
                value={addReviewData.review_text}
                onChange={handleAddReviewChange}
                style={{
                  borderColor: addReviewErrors.review_text ? "red" : "",
                }}
              />
              {addReviewErrors.review_text && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {addReviewErrors.review_text}
                </p>
              )}
            </Form.Group>
            <hr />
            <Button
              type="submit"
              className="pro-submit"
              style={{ width: "100%" }}
            >
              Add Review
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Review Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateReview}>
            <Form.Group>
              <Form.Label>Product</Form.Label>
              <Form.Select
                name="product"
                value={editReviewData.product}
                onChange={handleEditReviewChange}
                style={{ borderColor: editReviewErrors.product ? "red" : "" }}
              >
                <option value="">Select a Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.slug}
                  </option>
                ))}
              </Form.Select>
              {editReviewErrors.product && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {editReviewErrors.product}
                </p>
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label>Rating</Form.Label>
              <Form.Select
                name="rating"
                value={editReviewData.rating}
                onChange={handleEditReviewChange}
                style={{ borderColor: editReviewErrors.rating ? "red" : "" }}
              >
                <option value="">Select Rating</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Form.Select>
              {editReviewErrors.rating && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {editReviewErrors.rating}
                </p>
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editReviewData.name}
                onChange={handleEditReviewChange}
                style={{
                  borderColor: editReviewErrors.name ? "red" : "",
                }}
                placeholder="Enter reviewer name"
              />
              {editReviewErrors.name && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {editReviewErrors.name}
                </p>
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label>Review Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="review_text"
                value={editReviewData.review_text}
                onChange={handleEditReviewChange}
                style={{
                  borderColor: editReviewErrors.review_text ? "red" : "",
                }}
              />
              {editReviewErrors.review_text && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {editReviewErrors.review_text}
                </p>
              )}
            </Form.Group>
            <hr />
            <Button
              type="submit"
              className="pro-submit"
              style={{ width: "100%" }}
            >
              Update Review
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Info Modal */}
      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Review Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReview && (
            <div>
              <h5>Product Details</h5>
              <p>
                <strong>Title:</strong> {selectedReview.product.title}
              </p>
              <p>
                <strong>Price:</strong> ₹{selectedReview.product.price}
              </p>
              <hr />
              <h5>User Details</h5>
              <p>
                <strong>Name:</strong> {selectedReview.user.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedReview.user.email}
              </p>
              <hr />

              <h5>Review Details</h5>
              <p>
                <strong>Review:</strong> {selectedReview.review_text}
              </p>
              <p>
                <strong>Rating:</strong> {selectedReview.rating}/5
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedReview.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInfoModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default function Reviews() {
  return <ReviewsContent />;
}
