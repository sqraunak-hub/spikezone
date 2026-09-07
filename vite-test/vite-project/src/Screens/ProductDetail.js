import React, { useState, useEffect } from "react";
import { FaBolt, FaCartShopping } from "react-icons/fa6";
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
import NotFound from "../Components/NotFound";
import "../Assets/CSS/ProductDetail.css";
import { Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  FaShareAlt,
  FaCheck,
  FaShieldAlt,
  FaTruck,
  FaHandHoldingHeart,
  FaLock,
  FaEye,
  FaSun,
  FaTools,
  FaBuilding,
  FaChevronRight,
  FaStar,
} from "react-icons/fa";
import { calculateAverageRating, renderStars } from "../Components/ReviewList";
import RelatedProducts from "../Components/RelatedProducts";

import { API_BASE_URL, SITE_URL, categoryPath } from "../Utils/appConstant";
import { slugify } from "../Utils/slugify";
import useSeo from "../Utils/useSeo";

// The five highlight bullets are free text typed in the admin, so the icon
// beside each one is chosen from what the line is actually about rather than
// by position - "UV-resistant" gets a sun whichever slot it sits in. Anything
// that matches nothing falls back to a plain tick.
const FEATURE_ICONS = [
  [/clear|transparent|invisible|visib|view|blend|discreet/i, FaEye],
  [/\buv\b|sun|weather|rain|yellow|fade|heat/i, FaSun],
  [/rust|steel|unbreak|durable|proof|strong|premium|quality/i, FaShieldAlt],
  [/humane|safe|harm|blunt|gentle|bird.?friendly/i, FaHandHoldingHeart],
  [/install|diy|fit|screw|cable tie|adhesive|tape|mount/i, FaTools],
  [/balcon|ledge|roof|window|sill|a\/?c\b|parapet|railing|wall|surface/i, FaBuilding],
];

const featureIcon = (text) => {
  const hit = FEATURE_ICONS.find(([re]) => re.test(text || ""));
  const Icon = hit ? hit[1] : FaCheck;
  return <Icon />;
};

// Initials for the review avatar: "Neha Gupta" -> "NG".
const initials = (name) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const ProductDetail = () => {
  const { categorySlug, productSlug } = useParams();
  const slug = productSlug;
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
  const [categories, setCategories] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // The product detail endpoint returns `category` as a bare id and no
  // category_name (the list endpoint does send the name - detail does not),
  // so the canonical cannot be built from the product alone.
  useEffect(() => {
    axios
      .get("uploadCategory/")
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

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

  // Every product is reachable under any category path - /products/bird-spikes/
  // <net-slug> renders the net just as happily as the right path does. Building
  // the canonical from the URL made each of those self-canonical, so one
  // product became four competing URLs. Resolve the product's real category
  // instead and point them all at the one correct URL. Until the category list
  // arrives the URL's own slug is used, which is right for a correct URL and no
  // worse than before for a wrong one.
  const trueCategory = categories.find((c) => c.id === product?.category);
  const canonicalCategory = trueCategory
    ? slugify(trueCategory.category_name)
    : categorySlug;
  const canonicalUrl =
    product && canonicalCategory
      ? `${SITE_URL}/products/${canonicalCategory}/${slug}`
      : undefined;

  useSeo({
    title: product ? `${product.title} - SpikeZone` : undefined,
    description: product?.short_desc,
    canonical: canonicalUrl,
    image: product?.image1,
    keywords: product?.keywords || "SpikeZone, Products",
    type: "product",
  });

  // Product JSON-LD. The site ships Organization and WebSite schema and the
  // content pages ship BreadcrumbList, but the product pages - the only pages
  // with a price - had none, so results showed no price, no availability and
  // no stars. Every value below comes from the API: nothing is invented, and
  // aggregateRating is omitted entirely rather than faked when a product has
  // no reviews yet.
  useEffect(() => {
    const ID = "sz-product-schema";
    const existing = document.getElementById(ID);
    if (!product || !canonicalUrl) {
      if (existing) existing.parentNode.removeChild(existing);
      return undefined;
    }

    const images = ["image1", "image2", "image3", "image4", "image5"]
      .map((key) => product[key])
      .filter(Boolean);

    const el = existing || document.createElement("script");
    el.id = ID;
    el.type = "application/ld+json";
    // Product and BreadcrumbList go out together in one array - the content
    // pages already ship a breadcrumb trail and the product pages, which sit
    // two levels deep, had none, so their results showed a bare URL.
    const trail = [
      { name: "Home", item: `${SITE_URL}/` },
      { name: "Products", item: `${SITE_URL}/products` },
      trueCategory && {
        name: trueCategory.category_name,
        item: `${SITE_URL}/products/${canonicalCategory}`,
      },
      { name: product.title, item: canonicalUrl },
    ].filter(Boolean);

    el.textContent = JSON.stringify([{
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${canonicalUrl}#product`,
      name: product.title,
      description: product.short_desc || undefined,
      image: images.length ? images : undefined,
      sku: product.product_sku || undefined,
      brand: { "@type": "Brand", name: "SpikeZone" },
      offers: {
        "@type": "Offer",
        url: canonicalUrl,
        priceCurrency: "INR",
        price: String(product.price),
        availability: product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: { "@id": `${SITE_URL}/#organization` },
      },
      aggregateRating: reviews.length
        ? {
            "@type": "AggregateRating",
            ratingValue: String(calculateAverageRating(reviews)),
            reviewCount: reviews.length,
            bestRating: "5",
            worstRating: "1",
          }
        : undefined,
    }, {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: trail.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.item,
      })),
    }]);
    if (!existing) document.head.appendChild(el);
    return () => {
      const node = document.getElementById(ID);
      if (node) node.parentNode.removeChild(node);
    };
  }, [product, canonicalUrl, canonicalCategory, trueCategory, reviews]);

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
  // A retired or renamed slug used to render one unstyled line under the
  // home page's title, with nothing telling a crawler the page was dead.
  // NotFound carries "noindex, follow" and its own title.
  if (!product) return <NotFound />;

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
      {/* head tags are applied by the useSeo hook above */}
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
          {product.category_name && (
            <>
              <span>/</span>
              <Link to={categoryPath(categorySlug || slugify(product.category_name))}>
                {product.category_name}
              </Link>
            </>
          )}
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
                    <FaCartShopping /> Add To Cart
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
                    <FaBolt /> Buy Now
                  </Button>
                </div>

                {/* highlights, shown as the icon row from the product design */}
                {bullets.length > 0 && (
                  <div className="szpd-features">
                    {bullets.map((b, i) => (
                      <div className="szpd-feature" key={i}>
                        <span className="szpd-feature-icon">{featureIcon(b)}</span>
                        <span className="szpd-feature-text">{b}</span>
                      </div>
                    ))}
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
                  at +91 99909 55869 — our team helps you free of charge.
                </p>
              </div>
            </Tab>
          </Tabs>
        </div>

        {/* ---------- customer reviews ---------- */}
        <div className="szpd-reviews">
          <h4 className="szpd-reviews-title">Customer Reviews</h4>

          {reviews.length === 0 ? (
            <p className="szpd-reviews-empty">
              No reviews yet - be the first to review this product.
            </p>
          ) : (
            <div className="szpd-reviews-grid">
              <aside className="szpd-review-summary">
                <div className="szpd-review-avg">
                  {calculateAverageRating(reviews)}
                </div>
                <div className="szpd-review-stars">
                  {renderStars(Math.round(calculateAverageRating(reviews)))}
                </div>
                <p className="szpd-review-count">
                  Based on {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </p>

                {/* Distribution, counted from the same reviews the list shows -
                    no separate source, so the bars can never disagree with it. */}
                <div className="szpd-review-bars">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const n = reviews.filter(
                      (r) => Math.round(r.rating) === star
                    ).length;
                    const pct = Math.round((n / reviews.length) * 100);
                    return (
                      <div className="szpd-review-bar" key={star}>
                        <span className="szpd-review-bar-label">{star}</span>
                        <FaStar className="szpd-review-bar-star" />
                        <span className="szpd-review-bar-track">
                          <span
                            className="szpd-review-bar-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                        <span className="szpd-review-bar-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </aside>

              <div className="szpd-review-list">
                {(showAllReviews ? reviews : reviews.slice(0, 3)).map((r) => (
                  <div className="szpd-review-card" key={r.id}>
                    <span className="szpd-review-avatar">
                      {initials(r.user_name)}
                    </span>
                    <div className="szpd-review-body">
                      <div className="szpd-review-head">
                        <strong>{r.user_name}</strong>
                        <span className="szpd-review-date">
                          {formatDistanceToNow(new Date(r.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p>{r.review_text}</p>
                    </div>
                    <span className="szpd-review-card-stars">
                      {renderStars(r.rating)}
                    </span>
                  </div>
                ))}

                {reviews.length > 3 && !showAllReviews && (
                  <button
                    type="button"
                    className="szpd-review-more"
                    onClick={() => setShowAllReviews(true)}
                  >
                    View All Reviews <FaChevronRight />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

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
