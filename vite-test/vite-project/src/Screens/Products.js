import React, { useEffect, useState, createContext } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import BestSellers from "../Components/BestSellers";
import ProductCard from "../Components/ProductCard";
import PageTitle from "../Components/PageTitle";
import { Link, useSearchParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { calculateAverageRating } from "../Components/ReviewList";
import SEOHelmet from "../Components/SEOHelmet";

export default function Products() {
  const [productData, setProductData] = useState([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("query");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  const categories = [...new Set(productData.map((p) => p.category_name))];
  // const materials = [...new Set(productData.map((p) => p.material))];
  const ratings = [5, 4, 3, 2, 1];

  useEffect(() => {
    axios
      .get("/products/")
      .then((response) => {
        const productsWithRatings = response.data.map((product) => {
          const averageRating = calculateAverageRating(product.reviews || []);
          console.log("ratings", product);
          return { ...product, averageRating };
        });
        setProductData(productsWithRatings);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      try {
        let response;
        if (searchQuery) {
          response = await axios.get("products/");
          const filteredProducts = response.data.filter(
            (product) =>
              product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.long_desc
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
          );
          setProductData(filteredProducts);
        } else {
          response = await axios.get("products/");
          setProductData(response.data);
          console.log("Products fetched:", response.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  function addToCart(products, quantity) {
    const existingItem = cart.find((item) => item.id === products.id);
    if (existingItem) {
      const updatedCart = cart.map((item) => {
        if (item.id === products.id) {
          return {
            ...item,
            quantity: item.quantity + 1,
            productTotal: (item.quantity + 1) * item.price,
          };
        } else {
          return item;
        }
      });

      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        { ...products, quantity: 1, productTotal: products.price },
      ]);
    }
    Cookies.set("cartItems", JSON.stringify(cart));
    const cartItems = Cookies.get("cartItems") || [];

    if (cartItems) {
      const parsedItem = JSON.parse(cartItems);
    }
  }

  const handleMaterialChange = (material, checked) => {
    if (checked) {
      setSelectedMaterials([...selectedMaterials, material]);
    } else {
      setSelectedMaterials(selectedMaterials.filter((m) => m !== material));
    }
  };
  const handleCategoryChange = (value, checked) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, value] : prev.filter((c) => c !== value)
    );
  };

  const handleRatingChange = (value, checked) => {
    setSelectedRatings((prev) =>
      checked ? [...prev, value] : prev.filter((r) => r !== value)
    );
  };

  const filteredProducts = productData.filter((product) => {
    const matchCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category_name);
    const matchMaterial =
      selectedMaterials.length === 0 ||
      selectedMaterials.includes(product.material);
    const matchRating =
      selectedRatings.length === 0 ||
      selectedRatings.some((r) => Math.floor(product.averageRating) >= r);
    const inPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];

    return matchCategory && matchMaterial && matchRating && inPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return a.title.localeCompare(b.title);
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <>
      <SEOHelmet />
      <PageTitle
        title={
          searchQuery
            ? `Search Results for "${searchQuery}"`
            : "Discover Our Range"
        }
      />
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : searchQuery && productData.length === 0 ? (
        <div className="text-center my-5">
          <h3>No products found for "{searchQuery}"</h3>
          <Link to="/products" className="btn btn-primary mt-3">
            View All Products
          </Link>
        </div>
      ) : (
        <>
          <Row className="g-4">
            {/* Left Filter Sidebar */}
            {/* Filter Sidebar */}
            <Col lg={3} className="d-none d-lg-block">
              <div
                className="p-3 shadow-sm rounded"
                style={{ backgroundColor: "#f9f9f9" }}
              >
                <h5 className="fw-bold mb-3">Filters</h5>

                {/* Price Filter */}
                <div className="mb-3">
                  <h6>Price</h6>
                  <input
                    type="range"
                    className="form-range"
                    min={0}
                    max={50000}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([0, parseInt(e.target.value)])
                    }
                  />
                  <div>₹0 – ₹{priceRange[1]}</div>
                </div>

                {/* Category */}
                <div className="mb-3">
                  <h6>Category</h6>
                  {categories.map((cat) => (
                    <div className="form-check" key={cat}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={cat}
                        id={`cat-${cat}`}
                        checked={selectedCategories.includes(cat)}
                        onChange={(e) =>
                          handleCategoryChange(e.target.value, e.target.checked)
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`cat-${cat}`}
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Material */}
                <div className="mb-3">
                  <h6>Material</h6>
                  {["Plastic", "Stainless Steel"].map((material) => (
                    <div className="form-check" key={material}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={material}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedMaterials((prev) =>
                            checked
                              ? [...prev, material]
                              : prev.filter((m) => m !== material)
                          );
                        }}
                        checked={selectedMaterials.includes(material)}
                      />
                      <label className="form-check-label">{material}</label>
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-secondary w-100"
                  onClick={() => {
                    setSelectedMaterials([]);
                    setSelectedCategories([]);
                    setSelectedRatings([]);
                    setPriceRange([0, 50000]);
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </Col>

            <Col lg={9}>
              <Row>
                <Col>
                  <div className="d-lg-none text-start mb-3">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setShowMobileFilters(true)}
                    >
                      Filters ☰
                    </button>
                  </div>
                </Col>
                <Col>
                  <div className="d-flex justify-content-end align-items-center mb-3">
                    <label htmlFor="sortSelect" className="me-2 fw-semibold">
                      Sort By:
                    </label>
                    <select
                      id="sortSelect"
                      className="form-select w-auto"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="default">Default</option>
                      <option value="name-asc">Name (A–Z)</option>
                      <option value="price-low-high">
                        Price (Low to High)
                      </option>
                      <option value="price-high-low">
                        Price (High to Low)
                      </option>
                    </select>
                  </div>
                </Col>
              </Row>

              <Row xs={1} sm={2} md={3} className="g-4">
                {sortedProducts.map((product) => (
                  <Col key={product.id}>
                    <ProductCard product={product} addToCart={addToCart} />
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>

          {!searchQuery && <BestSellers />}
          {/* Mobile Filter Drawer */}
          {showMobileFilters && (
            <div
              className="mobile-filter-overlay"
              onClick={() => setShowMobileFilters(false)}
            >
              <div
                className="mobile-filter-sidebar"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "80%",
                  height: "100%",
                  backgroundColor: "#fff",
                  padding: "1rem",
                  zIndex: 9999,
                  overflowY: "auto",
                  boxShadow: "2px 0px 6px rgba(0,0,0,0.3)",
                }}
              >
                <h5 className="fw-bold mb-3">Filters</h5>
                <div
                  className="p-3 shadow-sm rounded"
                  style={{ backgroundColor: "#f9f9f9" }}
                >
                  <div className="mb-3">
                    <h6>Price</h6>
                    <input
                      type="range"
                      className="form-range"
                      min={0}
                      max={50000}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([0, parseInt(e.target.value)])
                      }
                    />
                    <div>₹0 – ₹{priceRange[1]}</div>
                  </div>

                  <div className="mb-3">
                    <h6>Category</h6>
                    {["Bird Spikes", "Bird Nets", "Accessories"].map(
                      (category) => (
                        <div className="form-check" key={category}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value={category}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedCategories((prev) =>
                                checked
                                  ? [...prev, category]
                                  : prev.filter((c) => c !== category)
                              );
                            }}
                            checked={selectedCategories.includes(category)}
                          />
                          <label className="form-check-label">{category}</label>
                        </div>
                      )
                    )}
                  </div>

                  {/* Material */}
                  <div className="mb-3">
                    <h6>Material</h6>
                    {["Plastic", "Stainless Steel"].map((material) => (
                      <div className="form-check" key={material}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value={material}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedMaterials((prev) =>
                              checked
                                ? [...prev, material]
                                : prev.filter((m) => m !== material)
                            );
                          }}
                          checked={selectedMaterials.includes(material)}
                        />
                        <label className="form-check-label">{material}</label>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn btn-secondary w-100"
                    onClick={() => {
                      setSelectedMaterials([]);
                      setSelectedCategories([]);
                      setSelectedRatings([]);
                      setPriceRange([0, 50000]);
                    }}
                  >
                    Reset Filters
                  </button>
                </div>

                <button
                  className="btn btn-danger w-100 mt-3"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
