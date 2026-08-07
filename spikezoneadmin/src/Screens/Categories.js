import React, { useState, useEffect } from "react";
import "../Assets/css/categories.css";
import { ProSidebarProvider } from "react-pro-sidebar";
import Sidenav from "../Components/Sidenav";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import AnimateHeight from "react-animate-height";
import axios from "axios";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css";

import { API_BASE_URL } from "../Utils/appConstant";

export function Categorycontent() {
  const [height, setHeight] = useState(0);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category_id: "",
    category_name: "",
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}uploadCategory/`
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}uploadCategory/`,
        formData
      );
      fetchCategories();
      setFormData({ category_id: "", category_name: "" });
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleClickDelete = async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}categories/update/${id}/`
      );
      fetchCategories(); // Refresh category list
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui">
            <h1>Are you sure?</h1>
            <p>
              by deleting the category, all the products under this category
              will also be deleted
            </p>
            <button onClick={onClose}>No</button>
            <button
              onClick={() => {
                handleClickDelete(id);
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
      <Container className="page-head mt-4">
        <Row>
          <Col>
            <h3>Categories</h3>
          </Col>
          <Col className="justify-content-end" style={{ display: "flex" }}>
            <Button onClick={() => setHeight(height === 0 ? "auto" : 0)}>
              {height === 0 ? "+ Add New Category" : "Close"}
            </Button>
          </Col>
        </Row>
      </Container>

      <Container className="category-content-container mt-5">
        <Container className="add-category-container">
          <AnimateHeight duration={500} height={height}>
            <Container className="mt-5 shadow cat-form-container">
              <h3>Add New Category</h3>
              <hr />
              <form className="cat-form mt-4" onSubmit={handleSubmit}>
                <Row>
                  <Col>
                    <label className="cat-label">Category Id</label>
                    <input
                      type="text"
                      name="category_id"
                      className="cat-input"
                      onChange={handleChange}
                      value={formData.category_id}
                      placeholder="XX-123-XX"
                    />
                  </Col>
                  <Col>
                    <label className="cat-label">Category Name</label>
                    <input
                      type="text"
                      name="category_name"
                      className="cat-input"
                      onChange={handleChange}
                      value={formData.category_name}
                      placeholder="Mobiles, Clothes, Home"
                    />
                  </Col>
                </Row>
                <input
                  type="submit"
                  value="Add New Category"
                  className="cat-submit mt-3"
                />
              </form>
            </Container>
          </AnimateHeight>

          <Container className="mt-5 shadow cat-container">
            <h3>Available Categories</h3>
            <hr />
            <Table striped bordered hover className="shadow">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category ID</th>
                  <th>Category Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr key={category.category_id}>
                    <td>{index + 1}</td>
                    <td>{category.category_id}</td>
                    <td>{category.category_name}</td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => deleteCategory(category.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Container>
        </Container>
      </Container>
    </>
  );
}

export default function Category() {
  return <Categorycontent />;
}
