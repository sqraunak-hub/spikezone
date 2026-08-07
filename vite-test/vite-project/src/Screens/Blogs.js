import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../Assets/CSS/blog-style.css";
import PageTitle from "../Components/PageTitle";
import { FaCalendarAlt } from "react-icons/fa";
import { Row, Col } from "react-bootstrap";

import { API_BASE_URL } from "../Utils/appConstant";

const extractFirstImage = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const img = doc.querySelector("img");
  return img ? img.src : "https://via.placeholder.com/600x300?text=No+Image";
};

const extractPlainText = (html, maxLength = 250) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const text = doc.body.textContent || "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}blogs/`)
      .then((res) => setBlogs(res.data))
      .catch((err) => console.error("Failed to fetch blogs:", err));
  }, []);

  return (
    <>
      <PageTitle title="Our Blogs" />
      <div className="blog-list-container">
        <div className="blog-list">
          {blogs.length > 0 ? (
            <Row className="g-4">
              {blogs.map((blog) => (
                <Col xs={12} md={6} lg={3} key={blog.id}>
                  <Link to={`/blogs/${blog.slug}`} className="blog-link">
                    <div className="blog-card-full">
                      <img
                        src={extractFirstImage(blog.content)}
                        alt={blog.title}
                        className="blog-card-image"
                      />

                      <div className="blog-card-body">
                        <h4 className="blog-title">{blog.title}</h4>

                        <div className="blog-date">
                          <FaCalendarAlt className="me-2" />
                          {formatDate(blog.created_at)}
                        </div>

                        <p className="blog-snippet">
                          {extractPlainText(blog.content)}
                        </p>

                        <span className="read-full-btn">Read Full Article</span>
                      </div>
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
          ) : (
            <p className="no-blogs">
              No blogs available at the moment. Stay Tuned !!
            </p>
          )}
        </div>
      </div>
    </>
  );
}
