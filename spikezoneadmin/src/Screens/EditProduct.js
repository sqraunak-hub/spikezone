import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../Utils/appConstant";

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 4,
  border: "1px solid #eaeaea",
  marginBottom: 12,
  marginRight: 12,
  width: 200,
  height: 200,
  padding: 6,
  boxSizing: "border-box",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const thumbInner = {
  minWidth: 0,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const img = {
  display: "block",
  width: "100%",
  height: "100%",
  maxHeight: "140px",
  objectFit: "cover",
};

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product_sku: "",
    category: "",
    title: "",
    price: "",
    max_price: "",
    slug: "",
    short_desc: "",
    long_desc: "",
    bullet_one: "",
    bullet_two: "",
    bullet_three: "",
    bullet_four: "",
    bullet_five: "",
    isBest: false,
    inStock: true,
    image1: "",
    image2: "",
    image3: "",
    image4: "",
    image5: "",
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([null, null, null, null, null]);
  const [existingImages, setExistingImages] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}products/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFormData({
          ...formData,
          ...response.data,
        });

        const imgs = [];
        for (let i = 1; i <= 5; i++) {
          imgs.push(
            response.data[`image${i}`] ? response.data[`image${i}`] : null
          );
        }
        setExistingImages(imgs);
      } catch (error) {
        toast.error("Failed to fetch product data.");
      }
    }
    async function fetchCategories() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}uploadCategory/`
        );
        setCategories(response.data);
      } catch (error) {
        toast.error("Failed to fetch categories.");
      }
    }
    fetchProduct();
    fetchCategories();
    // eslint-disable-next-line
  }, [id]);

  // Handle image file input
  const handleImageChange = (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    // Update files array
    setFiles((prev) => {
      const updated = [...prev];
      updated[idx] = file;
      return updated;
    });
    // Update preview for that image
    setExistingImages((prev) => {
      const updated = [...prev];
      updated[idx] = URL.createObjectURL(file);
      return updated;
    });
  };

  // Remove image preview
  const handleRemoveImage = (idx) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[idx] = null;
      return updated;
    });
    setExistingImages((prev) => {
      const updated = [...prev];
      updated[idx] = null;
      return updated;
    });
  };

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.product_sku)
      newErrors.product_sku = "Product SKU is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.slug) newErrors.slug = "SEO Link is required";
    if (!formData.max_price) newErrors.max_price = "Max Price is required";
    if (!formData.bullet_one) newErrors.bullet_one = "Bullet is required";
    if (!formData.bullet_two) newErrors.bullet_two = "Bullet is required";
    if (!formData.short_desc)
      newErrors.short_desc = "Short Description is required";
    if (!formData.long_desc)
      newErrors.long_desc = "Long Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (!["image1", "image2", "image3", "image4", "image5"].includes(key)) {
          data.append(key, formData[key]);
        }
      });
      // Append images (new uploads only)
      for (let i = 0; i < 5; i++) {
        if (files[i]) {
          data.append(`image${i + 1}`, files[i]);
        }
      }
      await axios.put(
        `${API_BASE_URL}products/update/${id}/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Product updated successfully!");
      navigate("/product");
    } catch (error) {
      if (error?.response?.data) {
        Object.keys(error.response.data).forEach((key) => {
          error.response.data[key].forEach((msg) =>
            toast.error(`${key}: ${msg}`)
          );
        });
      } else {
        toast.error("Failed to update product.");
      }
    }
  };

  const renderImageInputs = () => (
    <section className="container">
      <label style={{ display: "block", marginBottom: "8px" }}>
        Product Images
      </label>
      <div style={thumbsContainer}>
        {[0, 1, 2, 3, 4].map((idx) => (
          <div style={thumb} key={idx}>
            <div style={thumbInner}>
              {existingImages[idx] ? (
                <img
                  src={existingImages[idx]}
                  style={img}
                  alt={`Product ${idx + 1}`}
                />
              ) : (
                <span style={{ fontSize: "12px", color: "#aaa" }}>
                  No Image
                </span>
              )}
            </div>

            {/* FIX: Restrict file input width */}
            <input
              type="file"
              accept="image/*"
              style={{
                marginTop: "5px",
                width: "100px", // ✅ restrict width
                display: "block", // ✅ forces it below image
              }}
              onChange={(e) => handleImageChange(e, idx)}
            />

            {existingImages[idx] && (
              <Button
                variant="danger"
                size="sm"
                style={{ marginTop: "5px", width: "90px" }}
                onClick={() => handleRemoveImage(idx)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <Container className="category-content-container mt-5">
      <Container className="add-category-container">
        <Row>
          <Col>
            <h3>Edit Product</h3>
          </Col>
        </Row>
        <form onSubmit={handleSubmit}>
          {renderImageInputs()}
          {/* ...rest of your form fields... */}
          <label>
            Product Sku
            <input
              type="text"
              name="product_sku"
              value={formData.product_sku}
              onChange={handleInputChange}
              style={{
                borderColor: errors.product_sku ? "red" : "",
              }}
            />
            {errors.product_sku && (
              <p style={{ color: "red", fontSize: "14px" }}>
                {errors.product_sku}
              </p>
            )}
          </label>
          <label>
            Category
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              style={{
                borderColor: errors.category ? "red" : "",
              }}
            >
              <option value="">Select a Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category_name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p style={{ color: "red", fontSize: "14px" }}>
                {errors.category}
              </p>
            )}
          </label>
          <label>
            Title
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              style={{
                borderColor: errors.title ? "red" : "",
              }}
            />
            {errors.title && (
              <p style={{ color: "red", fontSize: "14px" }}>{errors.title}</p>
            )}
          </label>
          <label>
            Price
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              style={{
                borderColor: errors.price ? "red" : "",
              }}
            />
            {errors.price && (
              <p style={{ color: "red", fontSize: "14px" }}>{errors.price}</p>
            )}
          </label>
          <label>
            Max Price
            <input
              type="text"
              name="max_price"
              value={formData.max_price}
              onChange={handleInputChange}
              style={{
                borderColor: errors.max_price ? "red" : "",
              }}
            />
            {errors.max_price && (
              <p style={{ color: "red", fontSize: "14px" }}>
                {errors.max_price}
              </p>
            )}
          </label>
          <label>
            SEO product Name
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              style={{
                borderColor: errors.slug ? "red" : "",
              }}
            />
            {errors.slug && (
              <p style={{ color: "red", fontSize: "14px" }}>{errors.slug}</p>
            )}
          </label>
          <label>
            Short Desc
            <input
              type="text"
              name="short_desc"
              value={formData.short_desc}
              onChange={handleInputChange}
              style={{
                borderColor: errors.short_desc ? "red" : "",
              }}
            />
            {errors.short_desc && (
              <p style={{ color: "red", fontSize: "14px" }}>
                {errors.short_desc}
              </p>
            )}
          </label>
          <label>
            Long Desc
            <input
              type="text"
              name="long_desc"
              value={formData.long_desc}
              onChange={handleInputChange}
              style={{
                borderColor: errors.long_desc ? "red" : "",
              }}
            />
            {errors.long_desc && (
              <p style={{ color: "red", fontSize: "14px" }}>
                {errors.long_desc}
              </p>
            )}
          </label>
          <label>
            Bullet One
            <input
              type="text"
              name="bullet_one"
              value={formData.bullet_one}
              onChange={handleInputChange}
              style={{
                borderColor: errors.bullet_one ? "red" : "",
              }}
            />
            {errors.bullet_one && (
              <p style={{ color: "red", fontSize: "14px" }}>
                {errors.bullet_one}
              </p>
            )}
          </label>
          <label>
            Bullet Two
            <input
              type="text"
              name="bullet_two"
              value={formData.bullet_two}
              onChange={handleInputChange}
              style={{
                borderColor: errors.bullet_two ? "red" : "",
              }}
            />
            {errors.bullet_two && (
              <p style={{ color: "red", fontSize: "14px" }}>
                {errors.bullet_two}
              </p>
            )}
          </label>
          <label>
            Bullet Three
            <input
              type="text"
              name="bullet_three"
              value={formData.bullet_three}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Bullet Four
            <input
              type="text"
              name="bullet_four"
              value={formData.bullet_four}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Bullet Five
            <input
              type="text"
              name="bullet_five"
              value={formData.bullet_five}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Is Bestseller:
            <input
              type="checkbox"
              name="isBest"
              checked={formData.isBest}
              onChange={handleInputChange}
            />
          </label>
          <hr />
          <button type="submit" className="pro-submit">
            Save Changes
          </button>
        </form>
      </Container>
    </Container>
  );
}
