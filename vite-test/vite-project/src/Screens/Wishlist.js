import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../Components/ProductCard";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

import { API_BASE_URL } from "../Utils/appConstant";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE_URL}wishlist/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Assuming API returns an array of wishlist items with a 'product' field
        setWishlist(res.data);
      })
      .catch(() => {
        toast.error("Failed to fetch wishlist.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4">My Wishlist</h2>
      <Row>
        {wishlist.length === 0 && (
          <Col>
            <p className="text-muted">No items in your wishlist.</p>
          </Col>
        )}
        {wishlist.map((item) => (
          <Col
            key={item.product_details.id || item.product_details.id}
            md={4}
            sm={6}
            xs={12}
            className="mb-4"
          >
            <ProductCard product={item.product_details} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Wishlist;
