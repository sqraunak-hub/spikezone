import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "ckeditor5/ckeditor5.css";
import "../Assets/CSS/blog-detail.css";
import { Row, Col } from "react-bootstrap";

import { API_BASE_URL } from "../Utils/appConstant";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    // Fetch blog by slug
    axios
      .get(`${API_BASE_URL}blogs/?slug=${slug}`)
      .then((res) => {
        if (res.data.length > 0) {
          setBlog(res.data[0]);
        } else {
          setBlog(null);
        }
      })
      .catch((err) => {
        setBlog(null);
        console.error("Blog not found:", err);
      });

    // Fetch recent blogs
    axios
      .get(`${API_BASE_URL}blogs/`)
      .then((res) => {
        const recent = res.data
          .filter((item) => item.slug !== slug)
          .slice(0, 6);
        setRecentPosts(recent);
      })
      .catch((err) => console.error("Recent blogs fetch failed:", err));
  }, [slug]);

  const extractFirstH1 = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const h1 = doc.querySelector("h1");
    return h1 ? h1.innerText : "Blog Title";
  };

  const formatDate = (dateStr) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  if (!blog) return <p>Loading...</p>;

  return (
    <div className="blog-detail-page">
      <Row>
        <Col className="blog-detail-section" xs={12} md={9}>
          <div className="main-blog-section">
            <h1 className="blog-main-title">{extractFirstH1(blog.content)}</h1>
            <hr />
            <p className="blog-date">
              Published on: {formatDate(blog.created_at)}
            </p>
            <div
              className="ck-content blog-content"
              dangerouslySetInnerHTML={{
                __html: blog.content.replace(/<h1[^>]*>.*?<\/h1>/i, ""),
              }}
            ></div>
          </div>
        </Col>
        <Col className="blog-detail-section" xs={12} md={3}>
          <div className="recent-posts-sidebar">
            <h4 className="sidebar-title">RECENT POSTS</h4>
            {recentPosts.map((post, index) => (
              <div key={post.id} className="recent-post-item-wrapper">
                <Link to={`/blogs/${post.slug}`} className="recent-post-link">
                  <div className="recent-post-item">
                    <img
                      src={extractFirstImage(post.content)}
                      alt="thumb"
                      className="recent-post-img"
                    />
                    <div className="recent-post-details">
                      <p className="recent-title">
                        {extractFirstH1(post.content)}
                      </p>
                      <p className="recent-date">
                        {formatDate(post.created_at)}
                      </p>
                      <hr />
                    </div>
                  </div>
                </Link>
                {index < recentPosts.length - 1 && (
                  <hr className="recent-post-divider" />
                )}
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
}

// Utility to extract image from HTML string
function extractFirstImage(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const img = doc.querySelector("img");
  return img ? img.src : "https://via.placeholder.com/80x50";
}
