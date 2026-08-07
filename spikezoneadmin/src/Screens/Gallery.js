import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Form } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { API_BASE_URL } from "../Utils/appConstant";

const thumbStyle = {
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

const thumbInnerStyle = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
};

const imgStyle = {
  display: "block",
  width: "auto",
  height: "100%",
};

export function GalleryContent() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    image_title: "",
    image_description: "",
  });
  const [galleryItems, setGalleryItems] = useState([]);
  const [errors, setErrors] = useState({});

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1, // Allow only one image
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const handleRemoveImage = () => {
    setFiles([]);
  };

  const thumbs = files.map((file) => (
    <div style={thumbStyle} key={file.name}>
      <div style={thumbInnerStyle}>
        <img
          src={file.preview}
          style={imgStyle}
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
      <Button
        variant="danger"
        size="sm"
        style={{ marginTop: "5px" }}
        onClick={handleRemoveImage}
      >
        Remove
      </Button>
    </div>
  ));

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.image_title)
      newErrors.image_title = "image_title is required";
    if (!formData.image_description)
      newErrors.image_description = "image_description is required";
    if (files.length === 0) newErrors.files = "An image is required";

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
    data.set("image_title", formData.image_title);
    data.set("image_description", formData.image_description);
    data.append("image", files[0]);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}gallery/`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Gallery item added successfully!");
      fetchGalleryItems();

      // Reset form data
      setFormData({
        image_title: "",
        image_description: "",
      });
      setFiles([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add gallery item!");
    }
  };

  const fetchGalleryItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}gallery/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGalleryItems(response.data);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}gallery/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Gallery item deleted successfully!");
      fetchGalleryItems();
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      toast.error("Failed to delete gallery item!");
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  return (
    <>
      <Container className="mt-5 shadow cat-container">
        <h3>Gallery</h3>
        <hr />
        <Container className="add-category-container">
          <Row>
            <Col>
              <h4>Add New Gallery Item</h4>
            </Col>
          </Row>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Image Title</Form.Label>
              <Form.Control
                type="text"
                name="image_title"
                value={formData.image_title}
                onChange={(e) =>
                  setFormData({ ...formData, image_title: e.target.value })
                }
                isInvalid={!!errors.image_title}
              />
              <Form.Control.Feedback type="invalid">
                {errors.image_title}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Image Description</Form.Label>
              <Form.Control
                type="text"
                name="image_description"
                value={formData.image_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    image_description: e.target.value,
                  })
                }
                isInvalid={!!errors.image_description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.image_description}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Image</Form.Label>
              <div {...getRootProps({ className: "dropzone" })}>
                <input {...getInputProps()} />
                <p className="img-upload-section">
                  Click here to upload Image or drop an image here.
                </p>
              </div>
              {errors.files && (
                <p style={{ color: "red", fontSize: "14px" }}>{errors.files}</p>
              )}
              <aside style={{ display: "flex", marginTop: "10px" }}>
                {thumbs}
              </aside>
            </Form.Group>
            <Button type="submit" className="mt-3">
              Add to Gallery
            </Button>
          </Form>
        </Container>
        <hr />
        <h4>Gallery Items</h4>
        <Table striped bordered hover className="shadow">
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>image_title</th>
              <th>image_description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {galleryItems.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={item.image}
                    alt={item.image_title}
                    style={{ width: "100px", height: "100px" }}
                  />
                </td>
                <td>{item.image_title}</td>
                <td>{item.image_description}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <MdDelete />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
}

export default function Gallery() {
  return <GalleryContent />;
}
