import React, { useState, useEffect } from "react";
import { ProSidebarProvider } from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  ButtonGroup,
} from "react-bootstrap";
import Sidenav from "../Components/Sidenav";
import { GoPlus } from "react-icons/go";
import AnimateHeight from "react-animate-height";
import MultiStepForm from "../Components/MultiStepForm";
import { MdOutlineDirectionsRailwayFilled } from "react-icons/md";
import axios from "axios";
import "react-dropzone-uploader/dist/styles.css";
import "../Assets/css/products.css";
import Dropzone from "react-dropzone-uploader";
import { useDropzone } from "react-dropzone";
import logo192 from "../Assets/img/logo192.jpg";
import { MdDelete } from "react-icons/md";
import { FaPen } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { API_BASE_URL } from "../Utils/appConstant";

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: "border-box",
};

const thumbInner = {
  minWidth: 0,
  overflow: "hidden",
};

const img = {
  display: "block",
  width: "auto",
  height: "100%",
};

export function Productcontent(props) {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        ),
      ]);
    },
  });

  const handleRemoveImage = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const thumbs = files.map((file, index) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img
          src={file.preview}
          style={img}
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
      <Button
        variant="danger"
        size="sm"
        style={{ marginTop: "5px" }}
        onClick={() => handleRemoveImage(index)}
      >
        Remove
      </Button>
    </div>
  ));

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  const [show, setShow] = useState();
  const [height, setHeight] = useState(0);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    product_sku: "",
    category: "",
    title: "",
    price: "",
    max_price: "",
    slug: "",
    short_desc: "",
    long_desc: "",
    image1: "",
    image2: "",
    image3: "",
    image4: "",
    image5: "",
    bullet_one: "",
    bullet_two: "",
    bullet_three: "",
    bullet_four: "",
    bullet_five: "",
    isBest: false,
    inStock: true,
  });
  const [categories, setCategories] = useState([]);
  const [currProducts, setCurrProducts] = useState([]);

  const handleInputChange = (event) => {
    if (event.target.name === "image1") {
      console.log(event.target.files);
    } else if (event.target.name === "image2") {
      console.log(event.target.files);
    } else if (event.target.name === "image3") {
      console.log(event.target.files);
    } else if (event.target.name === "image4") {
      console.log(event.target.files);
    } else if (event.target.name === "image5") {
      console.log(event.target.files);
    } else {
      setFormData({
        ...formData,
        [event.target.name]: event.target.value,
      });
    }
  };

  const handleChange = (event) => {
    console.log(event.target.value);
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
    if (files.length === 0) newErrors.files = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields!");
      return;
    }

    const data = new FormData();
    data.set("title", formData.title);
    data.set("category", formData.category);
    data.set("price", formData.price);
    data.set("bullet_one", formData.bullet_one);
    data.set("bullet_two", formData.bullet_two);
    data.set("bullet_three", formData.bullet_three);
    data.set("bullet_four", formData.bullet_four);
    data.set("bullet_five", formData.bullet_five);
    data.set("long_desc", formData.long_desc);
    data.set("max_price", formData.max_price);
    data.set("slug", formData.slug);
    data.set("product_sku", formData.product_sku);
    data.set("short_desc", formData.short_desc);
    data.set("isBest", formData.isBest);

    for (let i = 0; i < 5; i++) {
      data.append(`image${i + 1}`, files[i] || "");
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}uploadProduct/`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);
      fetchProducts();

      // Reset form data
      setFormData({
        product_sku: "",
        category: "",
        title: "",
        price: "",
        max_price: "",
        slug: "",
        short_desc: "",
        long_desc: "",
        image1: "",
        image2: "",
        image3: "",
        image4: "",
        image5: "",
        bullet_one: "",
        bullet_two: "",
        bullet_three: "",
        bullet_four: "",
        bullet_five: "",
        isBest: false,
        inStock: true,
      });

      setFiles([]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchcategories = async () => {
    const response = await axios.get(
      `${API_BASE_URL}uploadCategory/`
    );
    console.log(response.data);
    setCategories(response.data);
  };

  const fetchProducts = async () => {
    const response = await axios.get(
      `${API_BASE_URL}products/`
    );
    console.log(response.data);
    setCurrProducts(response.data);
  };

  useEffect(() => {
    fetchcategories();
    fetchProducts();
  }, []);

  const handleClickDelete = async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}products/update/${id}/`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Product deleted:", id);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const deleteProduct = async (id) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="-ui">
            <h1>Are you sure?</h1>
            <p>You want to delete this file?</p>
            <button className="add-dlt-btn-cn" onClick={onClose}>
              No
            </button>
            <button
              className="add-dlt-btn"
              variant="danger"
              onClick={async () => {
                await handleClickDelete(id);
                onClose();
              }}
            >
              Yes, Delete it!
            </button>
          </div>
        );
      },
    });
  };

  return (
    <>
      <Container className="category-content-container mt-5">
        <Container className="add-category-container">
          <Row>
            <Col>
              <h3>Products</h3>
            </Col>
            <Col className="justify-content-end" style={{ display: "flex" }}>
              <Button
                className="p-2"
                aria-expanded={height !== 0}
                aria-controls="example-panel"
                onClick={() => setHeight(height === 0 ? "auto" : 0)}
              >
                {height === 0 ? "+ Add New Product" : "Cancel"}
              </Button>
            </Col>
          </Row>
          <AnimateHeight id="example-panel" duration={500} height={height}>
            <Container className="mt-5 shadow cat-form-container">
              <section className="container">
                <div {...getRootProps({ className: "dropzone" })}>
                  <input {...getInputProps()} />
                  Upload Images
                  <p className="img-upload-section">
                    Click here to upload images or drag and drop files here
                  </p>
                </div>
                {errors.files && (
                  <p style={{ color: "red", fontSize: "14px" }}>
                    {errors.files}
                  </p>
                )}
                <aside style={thumbsContainer}>{thumbs}</aside>
                <br />
              </section>
              <form onSubmit={handleSubmit}>
                <label>
                  Product Sku
                  <input
                    type="text"
                    name="product_sku"
                    id="product_sku"
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
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    style={{
                      borderColor: errors.title ? "red" : "",
                    }}
                  />
                  {errors.title && (
                    <p style={{ color: "red", fontSize: "14px" }}>
                      {errors.title}
                    </p>
                  )}
                </label>
                <label>
                  Price
                  <input
                    type="text"
                    name="price"
                    id="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    style={{
                      borderColor: errors.price ? "red" : "",
                    }}
                  />
                  {errors.price && (
                    <p style={{ color: "red", fontSize: "14px" }}>
                      {errors.price}
                    </p>
                  )}
                </label>
                <label>
                  Max Price
                  <input
                    type="text"
                    name="max_price"
                    id="max_price"
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
                    id="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    style={{
                      borderColor: errors.slug ? "red" : "",
                    }}
                  />
                  {errors.slug && (
                    <p style={{ color: "red", fontSize: "14px" }}>
                      {errors.slug}
                    </p>
                  )}
                </label>
                <label>
                  Short Desc
                  <input
                    type="text"
                    name="short_desc"
                    id="short_desc"
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
                    id="long_desc"
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
                    id="bullet_one"
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
                    id="bullet_two"
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
                    id="bullet_three"
                    value={formData.bullet_three}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Bullet Four
                  <input
                    type="text"
                    name="bullet_four"
                    id="bullet_four"
                    value={formData.bullet_four}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Bullet Five
                  <input
                    type="text"
                    name="bullet_five"
                    id="bullet_five"
                    value={formData.bullet_five}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Is Bestseller:
                  <input
                    type="checkbox"
                    name="isBest"
                    id="isBest"
                    checked={formData.isBest}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        isBest: !formData.isBest,
                      })
                    }
                  />
                </label>
                <hr />
                <button type="submit" className="pro-submit">
                  Add Product
                </button>
              </form>
            </Container>
          </AnimateHeight>
        </Container>

        <Container className="mt-5 shadow cat-container">
          <h3>Available Products</h3>
          <hr />
          <Table striped bordered hover className="shadow">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Max Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currProducts.map((product, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={product.image1}
                      alt="Product"
                      style={{ width: "100px", height: "100px" }}
                    />
                  </td>
                  <td>
                    <Link
                      to={`https://spikezone.in/products/${product.slug}`}
                      target="_blank"
                    >
                      {product.title}
                    </Link>
                  </td>
                  <td>{product.price}</td>
                  <td>{product.max_price}</td>
                  <td>
                    <Button
                      variant="info"
                      style={{ color: "white", marginRight: "8px" }}
                      onClick={() => navigate(`/editProduct/${product.id}`)}
                    >
                      <FaPen style={{ color: "white" }} />
                    </Button>
                    <Button
                      variant="danger"
                      style={{ color: "white" }}
                      onClick={() => deleteProduct(product.id)}
                    >
                      <MdDelete style={{ color: "white" }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      </Container>
    </>
  );
}

export default function Products() {
  return <Productcontent />;
}
