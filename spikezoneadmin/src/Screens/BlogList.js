import React, { useEffect, useState } from "react";
import { Table, Button, Form, Spinner } from "react-bootstrap";
import { FaTrash, FaEdit, FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "../Assets/css/blog-editor.css";

import { API_BASE_URL, SITE_URL } from "../Utils/appConstant";

const stripHtml = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
};

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}blogs/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Could not load blogs. Is the API running?");
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const deleteBlog = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}blogs/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs((prev) => prev.filter((blog) => blog.id !== id));
      toast.success("Blog deleted.");
    } catch (error) {
      toast.error("Failed to delete blog.");
      console.error(error);
    }
  };

  const handleDelete = (blog) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-ui">
          <h1>Delete this blog?</h1>
          <p>
            <b>&ldquo;{blog.title}&rdquo;</b> will be permanently removed from
            the website.
          </p>
          <button className="add-dlt-btn-cn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="add-dlt-btn"
            onClick={async () => {
              await deleteBlog(blog.id);
              onClose();
            }}
          >
            Yes, Delete
          </button>
        </div>
      ),
    });
  };

  const filtered = blogs.filter((b) =>
    (b.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="blog-list-wrap">
      <ToastContainer position="top-center" />

      <div className="blog-page-head">
        <div>
          <h2>All Blogs</h2>
          <p>
            {blogs.length} {blogs.length === 1 ? "post" : "posts"} published on
            the website. Edit or delete them here.
          </p>
        </div>
        <Link to="/blogs" className="blog-head-link solid">
          <FaPlus /> Add New Blog
        </Link>
      </div>

      <div className="adm-card">
        <Form.Control
          type="search"
          placeholder="Search blogs by title..."
          className="mb-3"
          style={{ maxWidth: "340px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="blog-empty">
            {search
              ? "No blogs match your search."
              : "No blogs yet. Click “Add New Blog” to write your first post."}
          </div>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th style={{ width: "50px" }}>#</th>
                <th>Title</th>
                <th>Preview</th>
                <th>Published On</th>
                <th style={{ width: "160px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((blog, idx) => (
                <tr key={blog.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong>{blog.title}</strong>
                    {blog.status === "draft" && (
                      <span className="blog-draft-badge">Draft</span>
                    )}
                    <div className="blog-slug-small">/blogs/{blog.slug}</div>
                  </td>
                  <td className="blog-content-preview">
                    {/* display_excerpt is the author's summary when there is
                        one and the start of the post when there is not, so
                        this column matches what the website shows */}
                    {blog.display_excerpt
                      ? blog.display_excerpt.slice(0, 90)
                      : stripHtml(blog.content).slice(0, 90)}
                    {(blog.display_excerpt || stripHtml(blog.content)).length > 90
                      ? "…"
                      : ""}
                  </td>
                  <td>
                    {blog.created_at
                      ? new Date(blog.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="adm-action-btn"
                      title="Edit blog"
                      onClick={() => navigate(`/editBlog/${blog.id}`)}
                    >
                      <FaEdit color="#fff" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="adm-action-btn"
                      title="Delete blog"
                      onClick={() => handleDelete(blog)}
                    >
                      <FaTrash />
                    </Button>
                    {/* a draft is not on the website, so this link would
                        only lead to an empty page */}
                    {blog.status !== "draft" && (
                      <a
                        href={`${SITE_URL}/blogs/${blog.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-light btn-sm adm-action-btn"
                        title="View on website"
                      >
                        <FaExternalLinkAlt size={12} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
