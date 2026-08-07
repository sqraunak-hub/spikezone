import React, { useEffect, useState } from "react";
import { Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { FaGoogle, FaSave, FaInfoCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Assets/css/seo-editor.css";

import { API_HOST } from "../Utils/appConstant";

const API = `${API_HOST}`;

const FIELD_HELP = {
  title:
    "The blue clickable headline shown in Google results and the browser tab. Keep it under 60 characters.",
  description:
    "The short text shown under the title in Google. Summarise the page in 1–2 lines (under 160 characters).",
  canonical_url:
    "The official URL of this page. Helps Google avoid duplicate-content issues. Usually just the page's full link.",
  og_image:
    "Image shown when the page is shared on WhatsApp, Facebook etc. Paste a full image URL.",
  twitter_card:
    "How the page looks when shared on X/Twitter — 'summary_large_image' shows a big preview image.",
};

const EMPTY = {
  title: "",
  description: "",
  canonical_url: "",
  og_image: "",
  twitter_card: "",
};

const SEOEditor = () => {
  const [seoData, setSeoData] = useState({});
  const [selectedPage, setSelectedPage] = useState("");
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSeo = () =>
    fetch(`${API}/seo-json/seo.json`)
      .then((res) => res.json())
      .then((data) => {
        setSeoData(data);
        const firstKey = Object.keys(data)[0];
        if (firstKey && !selectedPage) {
          setSelectedPage(firstKey);
          setFormData({ ...EMPTY, ...data[firstKey] });
        }
        setLoading(false);
        return data;
      })
      .catch(() => {
        setLoading(false);
        toast.error("Could not load SEO data. Is the API running?");
      });

  useEffect(() => {
    loadSeo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when the page changes, pre-fill the form with that page's current values
  const handlePageChange = (slug) => {
    setSelectedPage(slug);
    setFormData({ ...EMPTY, ...(seoData[slug] || {}) });
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${API}/api/user/update-seo/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [selectedPage]: formData }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("SEO settings saved for this page!");
        const fresh = await fetch(`${API}/seo-json/seo.json`).then((r) =>
          r.json()
        );
        setSeoData(fresh);
      } else {
        toast.error("Update failed: " + (result.error || "unknown error"));
      }
    } catch (err) {
      console.error("Error while updating SEO:", err);
      toast.error("Server error — check that the API is running.");
    } finally {
      setSaving(false);
    }
  };

  const titleLen = (formData.title || "").length;
  const descLen = (formData.description || "").length;

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="seo-wrap">
      <ToastContainer position="top-center" />

      <div className="blog-page-head">
        <div>
          <h2>SEO / Meta Tags</h2>
          <p>
            Control how each page of your website appears on{" "}
            <b>Google search</b> and when shared on <b>WhatsApp / social
            media</b>. Pick a page, edit the fields, and save.
          </p>
        </div>
      </div>

      <Row className="g-3">
        {/* -------- left: editor form -------- */}
        <Col lg={7}>
          <div className="adm-card">
            <Form.Group className="mb-3">
              <Form.Label>
                Which page do you want to edit?
              </Form.Label>
              <Form.Select
                value={selectedPage}
                onChange={(e) => handlePageChange(e.target.value)}
              >
                {Object.keys(seoData).map((slug) => (
                  <option key={slug} value={slug}>
                    {slug}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Page Title{" "}
                  <span
                    className={`seo-count ${titleLen > 60 ? "over" : ""}`}
                  >
                    {titleLen}/60
                  </span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Buy Bird Spikes Online | SpikeZone"
                />
                <div className="seo-help">
                  <FaInfoCircle /> {FIELD_HELP.title}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Description{" "}
                  <span className={`seo-count ${descLen > 160 ? "over" : ""}`}>
                    {descLen}/160
                  </span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g. India's trusted bird spike manufacturer. Humane, durable and affordable bird control for homes and industries."
                />
                <div className="seo-help">
                  <FaInfoCircle /> {FIELD_HELP.description}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Canonical URL</Form.Label>
                <Form.Control
                  type="text"
                  name="canonical_url"
                  value={formData.canonical_url}
                  onChange={handleInputChange}
                  placeholder="https://birdspikes.in/products"
                />
                <div className="seo-help">
                  <FaInfoCircle /> {FIELD_HELP.canonical_url}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Social Share Image (OG Image)</Form.Label>
                <Form.Control
                  type="text"
                  name="og_image"
                  value={formData.og_image}
                  onChange={handleInputChange}
                  placeholder="https://birdspikes.in/media/share-banner.jpg"
                />
                <div className="seo-help">
                  <FaInfoCircle /> {FIELD_HELP.og_image}
                </div>
                {formData.og_image && (
                  <img
                    src={formData.og_image}
                    alt="OG preview"
                    className="seo-og-thumb"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Twitter Card Type</Form.Label>
                <Form.Select
                  name="twitter_card"
                  value={formData.twitter_card}
                  onChange={handleInputChange}
                >
                  <option value="">Select type</option>
                  <option value="summary">
                    summary — small square preview
                  </option>
                  <option value="summary_large_image">
                    summary_large_image — big banner preview (recommended)
                  </option>
                </Form.Select>
                <div className="seo-help">
                  <FaInfoCircle /> {FIELD_HELP.twitter_card}
                </div>
              </Form.Group>

              <Button type="submit" className="seo-save-btn" disabled={saving}>
                <FaSave /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Form>
          </div>
        </Col>

        {/* -------- right: live google preview -------- */}
        <Col lg={5}>
          <div className="adm-card seo-preview-card">
            <h6 className="seo-preview-title">
              <FaGoogle /> Live Google Preview
            </h6>
            <p className="seo-preview-sub">
              This is roughly how the <b>{selectedPage || "page"}</b> page will
              look in Google search results:
            </p>

            <div className="google-preview">
              <div className="gp-url">
                {formData.canonical_url || "https://birdspikes.in/…"}
              </div>
              <div className="gp-title">
                {formData.title || "Page title will appear here"}
              </div>
              <div className="gp-desc">
                {formData.description ||
                  "The page description will appear here. Write something that makes people want to click."}
              </div>
            </div>

            <div className="seo-tips">
              <h6>Quick tips</h6>
              <ul>
                <li>
                  Put the <b>main keyword first</b> in the title — e.g. “Bird
                  Spikes for Balcony | SpikeZone”.
                </li>
                <li>
                  Keep the description <b>under 160 characters</b> or Google
                  will cut it off.
                </li>
                <li>
                  Every page should have a <b>different</b> title and
                  description.
                </li>
              </ul>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SEOEditor;
