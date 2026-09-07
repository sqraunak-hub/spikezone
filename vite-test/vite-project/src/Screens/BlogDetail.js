import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "ckeditor5/ckeditor5.css";
import "../Assets/CSS/blog-detail.css";
import { Row, Col } from "react-bootstrap";

import { API_BASE_URL, SITE_URL } from "../Utils/appConstant";
import useSeo from "../Utils/useSeo";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  // Without this, a slug that matches nothing left the page on "Loading..."
  // for ever, which reads as a broken site rather than a missing post.
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Fetch blog by slug
    axios
      .get(`${API_BASE_URL}blogs/?slug=${slug}`)
      .then((res) => {
        if (res.data.length > 0) {
          setBlog(res.data[0]);
          setNotFound(false);
        } else {
          setBlog(null);
          setNotFound(true);
        }
      })
      .catch((err) => {
        setBlog(null);
        setNotFound(true);
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

  useSeo({
    title: blog ? `${blog.title} | SpikeZone Blog` : undefined,
    // written in the admin, or derived from the post by the API
    description: blog ? blog.display_meta_description : undefined,
    canonical: blog ? `${SITE_URL}/blogs/${blog.slug}` : undefined,
    url: blog ? `${SITE_URL}/blogs/${blog.slug}` : undefined,
    image: blog && blog.featured_image ? blog.featured_image : undefined,
    type: "article",
  });

  const extractFirstH1 = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const h1 = doc.querySelector("h1");
    return h1 ? h1.innerText : "Blog Title";
  };

  const formatDate = (dateStr) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  if (!blog) {
    if (!notFound) return <p className="blog-loading">Loading...</p>;
    return (
      <div className="blog-missing">
        <h1>This article is not available</h1>
        <p>
          It may have been removed, or the link may be wrong.
        </p>
        <Link to="/blogs" className="read-full-btn">
          See all articles
        </Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <Row>
        <Col className="blog-detail-section" xs={12} md={9}>
          <div className="main-blog-section">
            <h1 className="blog-main-title">{extractFirstH1(blog.content)}</h1>
            <hr />
            <p className="blog-date">
              Published on: {formatDate(blog.created_at)}
              {blog.author_name ? ` · by ${blog.author_name}` : ""}
            </p>
            {blog.featured_image && (
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="blog-featured-image"
              />
            )}
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
                      src={postThumb(post)}
                      alt=""
                      className="recent-post-img"
                      loading="lazy"
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

// Thumbnail for a post: its featured image, else the first image in the body,
// else the site's own cover. The old fallback was a via.placeholder.com URL -
// an external service the page should not depend on, and a broken image when
// it does not answer.
function postThumb(post) {
  if (post.featured_image) return post.featured_image;
  const doc = new DOMParser().parseFromString(post.content || "", "text/html");
  const img = doc.querySelector("img");
  return img ? img.src : "/og-cover.jpg";
}
