import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay, A11y } from "swiper/modules";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import "swiper/swiper-bundle.css";
import "../Assets/CSS/home-modern.css";
import ProductCard from "./ProductCard";
import axios from "axios";

export default function BestSellers() {
  const [bestProducts, setBestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("products/")
      .then((response) => {
        setBestProducts(response.data.filter((item) => item.isBest === true));
      })
      .finally(() => setLoading(false));
  }, []);

  if (!loading && bestProducts.length === 0) return null;

  return (
    <Container className="sz-section">
      <div className="sz-section-head">
        <div>
          <span className="sz-eyebrow">Customer Favourites</span>
          <h2 className="sz-title">Our Bestsellers</h2>
          <p className="sz-sub">
            The products our customers order again and again — proven on
            thousands of balconies, ledges and rooftops.
          </p>
        </div>
        <Link to="/products" className="sz-viewall">
          View All <FaArrowRight />
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Swiper
          className="sz-best-swiper"
          modules={[Navigation, Pagination, A11y, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3500, pauseOnMouseEnter: true }}
          breakpoints={{
            0: { slidesPerView: 2, spaceBetween: 10 },
            576: { slidesPerView: 2, spaceBetween: 16 },
            992: { slidesPerView: 3, spaceBetween: 20 },
            1280: { slidesPerView: 4, spaceBetween: 20 },
          }}
        >
          {bestProducts.map((item) => (
            <SwiperSlide key={item.id} style={{ height: "auto" }}>
              <ProductCard product={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Container>
  );
}
