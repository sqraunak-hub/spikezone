import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useCartStore from "../store/cartStore";
import {
  Container,
  Row,
  Col,
  Button,
  Tabs,
  Tab,
  Spinner,
  Modal,
  Form,
} from "react-bootstrap";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../Components/Loader";
import "../Assets/CSS/ProductDetail.css";
import ReviewList from "../Components/ReviewList";
import { Heart } from "lucide-react";
import { Helmet } from "react-helmet";
import {
  FaShareAlt,
  FaCheck,
  FaShieldAlt,
  FaTruck,
  FaHandHoldingHeart,
  FaLock,
} from "react-icons/fa";
import { calculateAverageRating, renderStars } from "../Components/ReviewList";
import RelatedProducts from "../Components/RelatedProducts";

import { API_BASE_URL } from "../Utils/appConstant";

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, review_text: "" });
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/products/${slug}/`)
      .then((response) => {
        const productData = response.data || null;
        setProduct(productData);
        setLoading(false);

        if (productData?.id) {
          axios
            .get(`/reviews/?product_id=${productData.id}`)
            .then((res) => {
              setReviews(res.data || []);
            })
            .catch((err) => console.error("Error fetching reviews:", err));
        }
      })
      .catch(() => {
        setLoading(false);
        setProduct(null);
      });
  }, [slug]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (product?.id && token) {
      axios
        .get(`${API_BASE_URL}wishlist/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setWishlisted(res.data?.is_wishlisted || false);
        })
        .catch(() => {});
    }
  }, [product]);

  const currentUrl = window.location.href;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this product on SpikeZone",
          text: "Have a look at this awesome product!",
          url: currentUrl,
        })
        .catch((error) => console.error("Sharing failed", error));
    } else {
      navigator.clipboard.writeText(currentUrl);
      toast.info("Link copied to clipboard!");
    }
  };

  const handleAddReview = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}reviews/`,
        {
          product: product.id,
          rating: newReview.rating,
          review_text: newReview.review_text,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setReviews([...reviews, response.data]);
      toast.success("Review added successfully!");
      setShowReviewModal(false);
      setNewReview({ rating: 0, review_text: "" });
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Failed to add review. Please try again.");
    }
  };

  const handleBuyNow = async () => {
    setBuyNowLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    navigate("/checkout");
    setBuyNowLoading(false);
  };

  if (loading) return <Loader />;
  if (!product) return <p className="text-center mt-5">Product not found</p>;

  const images = ["image1", "image2", "image3", "image4", "image5"]
    .map((key) => product[key])
    .filter(Boolean)
    .map((img) => ({ original: img, thumbnail: img }));

  const bullets = [
    product.bullet_one,
    product.bullet_two,
    product.bullet_three,
    product.bullet_four,
    product.bullet_five,
  ].filter(Boolean);

  const price = parseInt(product.price, 10);
  const mrp = parseInt(product.max_price, 10);
  const hasDiscount = !isNaN(price) && !isNaN(mrp) && mrp > price;
  const discount = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleWishlistToggle = async () => {
    if (!product) return;
    setWishlistLoading(true);
    const token = localStorage.getItem("token");
    try {
      if (!wishlisted) {
        await axios.post(
          `${API_BASE_URL}wishlist/`,
          { product: product.id },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setWishlisted(true);
        toast.success("Added to wishlist!");
      } else {
        await axios.delete(
          `${API_BASE_URL}wishlist/${product.id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setWishlisted(false);
        toast.info("Removed from wishlist.");
      }
    } catch (error) {
      toast.error("Wishlist action failed.");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="szpd-page">
      <Helmet>
        <title>{product.title} - SpikeZone</title>
        <meta name="description" content={product.short_desc} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.short_desc} />
        {product.image1 && (
          <meta property="og:image" content={product.image1} />
        )}
        <link rel="canonical" href={`https://birdspikes.in/products/${slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.title} />
        <meta name="twitter:description" content={product.short_desc} />
        {product.image1 && (
          <meta name="twitter:image" content={product.image1} />
        )}
        <meta
          name="keywords"
          content={product.keywords || "SpikeZone, Products"}
        />
        <meta name="author" content="SpikeZone" />
      </Helmet>
      <ToastContainer position="top-center" autoClose={5000} theme="light" />
      {buyNowLoading && (
        <div className="loading-overlay">
          <div className="loader-content">
            <Spinner animation="border" variant="light" />
            <p className="mt-2 text-white">Processing your order...</p>
          </div>
        </div>
      )}

      <Container className="mt-4">
        {/* breadcrumb */}
        <nav className="szpd-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span className="szpd-breadcrumb-current">{product.title}</span>
        </nav>

        <div className="szpd-main">
          <Row className="g-4">
            {/* ---------- gallery ---------- */}
            <Col lg={6}>
              <div className="szpd-gallery">
                {hasDiscount && (
                  <span className="szpd-off-badge">-{discount}% OFF</span>
                )}
                <ImageGallery
                  items={images}
                  lazyLoad
                  showPlayButton={false}
                  showNav={images.length > 1}
                />
              </div>
            </Col>

            {/* ---------- info ---------- */}
            <Col lg={6}>
              <div className="szpd-info">
                <div className="szpd-toprow">
                  <span
                    className={`szpd-stock ${
                      product.inStock === false ? "out" : ""
                    }`}
                  >
                    {product.inStock === false ? "Out of Stock" : "In Stock"}
                  </span>
                  <div className="szpd-actions">
                    <button
                      className="szpd-icon-btn"
                      disabled={wishlistLoading}
                      onClick={handleWishlistToggle}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        fill={wishlisted ? "#e11d48" : "none"}
                        color="#e11d48"
                        size={18}
                      />
                    </button>
                    <button
                      className="szpd-icon-btn"
                      onClick={handleShare}
                      aria-label="Share product"
                    >
                      <FaShareAlt size={15} />
                    </button>
                  </div>
                </div>

                <h1 className="szpd-title">{product.title}</h1>

                <div className="szpd-meta">
                  <span>
                    By <strong>SpikeZone</strong>
                  </span>
                  <span className="szpd-meta-dot">•</span>
                  <span className="szpd-stars">
                    {renderStars(Math.round(calculateAverageRating(reviews)))}
                  </span>
                  <span className="szpd-rating-num">
                    {calculateAverageRating(reviews)} ({reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>

                <p className="szpd-shortdesc">{product.short_desc}</p>

                {/* price box */}
                <div className="szpd-pricebox">
                  <div className="szpd-priceline">
                    <span className="szpd-price">₹{product.price}</span>
                    {hasDiscount && (
                      <>
                        <span className="szpd-mrp">₹{product.max_price}</span>
                        <span className="szpd-save">Save {discount}%</span>
                      </>
                    )}
                  </div>
                  <p className="szpd-tax">
                    M.R.P: ₹{product.max_price}/- (inclusive of all taxes)
                  </p>
                </div>

                {/* qty + buttons */}
                <div className="szpd-buyrow">
                  <div className="szpd-qty">
                    <button
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                    >
                      −
                    </button>
                    <Form.Control
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) setQuantity(val);
                      }}
                    />
                    <button onClick={() => setQuantity((prev) => prev + 1)}>
                      +
                    </button>
                  </div>

                  <Button
                    className="szpd-cart-btn"
                    onClick={() => {
                      addToCart(product, quantity);
                      toast.success(
                        <span>
                          Item added to cart. <Link to="/cart">Go to Cart</Link>
                        </span>
                      );
                    }}
                  >
                    <i className="bi bi-cart3"></i> Add To Cart
                  </Button>

                  <Button
                    className="szpd-buy-btn"
                    onClick={async () => {
                      for (let i = 0; i < quantity; i++) {
                        addToCart(product);
                      }
                      await handleBuyNow();
                    }}
                  >
                    <i className="bi bi-lightning-charge-fill"></i> Buy Now
                  </Button>
                </div>

                {/* highlights */}
                {bullets.length > 0 && (
                  <div className="szpd-highlights">
                    <h6>Product Highlights</h6>
                    <ul>
                      {bullets.map((b, i) => (
                        <li key={i}>
                          <FaCheck /> <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* trust strip */}
                <div className="szpd-trust">
                  <div>
                    <FaHandHoldingHeart />
                    <span>100% Humane</span>
                  </div>
                  <div>
                    <FaTruck />
                    <span>Pan-India Delivery</span>
                  </div>
                  <div>
                    <FaShieldAlt />
                    <span>Quality Assured</span>
                  </div>
                  <div>
                    <FaLock />
                    <span>Secure Payments</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* ---------- description tabs ---------- */}
        <div className="szpd-tabs mt-5">
          <Tabs defaultActiveKey="description" className="mb-3">
            <Tab eventKey="description" title="Description">
              <p className="p-long-desc">{product.long_desc}</p>
            </Tab>
            <Tab eventKey="highlights" title="Highlights">
              <ul className="szpd-tab-bullets">
                {bullets.map((b, i) => (
                  <li key={i}>
                    <FaCheck /> {b}
                  </li>
                ))}
              </ul>
            </Tab>
            <Tab eventKey="shipping" title="Shipping & Returns">
              <div className="p-long-desc">
                <p>
                  <strong>Delivery:</strong> We deliver across India. Orders are
                  usually dispatched within 24–48 hours and delivered in 3–7
                  working days depending on your location.
                </p>
                <p>
                  <strong>Returns:</strong> If the product arrives damaged or
                  incorrect, raise a return request within 7 days of delivery.
                  See our{" "}
                  <Link to="/return-policy">Returns &amp; Refunds policy</Link>{" "}
                  for details.
                </p>
                <p>
                  <strong>Support:</strong> Need installation guidance? Call us
                  at +91 98731 99277 — our team helps you free of charge.
                </p>
              </div>
            </Tab>
          </Tabs>
        </div>

        <ReviewList reviews={reviews} />

        {/* ---------- related products ---------- */}
        <RelatedProducts categoryId={product.category} currentId={product.id} />
      </Container>

      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="5"
                value={newReview.rating}
                onChange={(e) =>
                  setNewReview({ ...newReview, rating: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newReview.review_text}
                onChange={(e) =>
                  setNewReview({ ...newReview, review_text: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddReview}>
            Submit Review
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductDetail;
