import React, { useState } from "react";
import "../Assets/CSS/form.css";
import "../Assets/CSS/home-modern.css";
import { Container, Row, Col, Form as BsForm, Spinner } from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
  FaWhatsapp,
} from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { API_BASE_URL } from "../Utils/appConstant";

const CONTACT_INFO = [
  {
    icon: <FaMapMarkerAlt />,
    title: "Visit Us",
    lines: ["Plot No. 3, Main Kair Road, Mitraon,", "Najafgarh, South West Delhi - 110043"],
  },
  {
    icon: <FaPhoneAlt />,
    title: "Call Us",
    lines: ["+91 99909 55869"],
  },
  {
    icon: <FaEnvelope />,
    title: "Email Us",
    lines: ["support@spikezone.in", "help@spikezone.co.in"],
  },
  {
    icon: <FaClock />,
    title: "Working Hours",
    lines: ["Mon – Sat: 9:00 AM – 8:00 PM", "Sunday: Closed"],
  },
];

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill out all fields!");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}contact/`, form, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending form data:", error);
      toast.error("Failed to send your message. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />

      <Container className="sz-section contact-page">
        <div className="sz-section-head">
          <div>
            <span className="sz-eyebrow">Get In Touch</span>
            {/* the contact page's main heading - it had no h1 at all, and it
                is the page people search for by name */}
            <h1 className="sz-title">Contact SpikeZone</h1>
            <p className="sz-sub">
              Questions about the right spike for your balcony? Bulk order for
              a project? Send us a message — we reply within 24 hours.
            </p>
          </div>
        </div>

        <Row className="g-4">
          {/* ------- info cards ------- */}
          <Col lg={5}>
            <div className="contact-info-grid">
              {CONTACT_INFO.map((c) => (
                <div className="contact-info-card" key={c.title}>
                  <span className="contact-info-icon">{c.icon}</span>
                  <h6>{c.title}</h6>
                  {c.lines.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </div>
              ))}
            </div>
            <a
              className="contact-whatsapp"
              href="https://wa.me/919990955869"
              target="_blank"
              rel="noreferrer"
            >
              <FaWhatsapp /> Chat with us on WhatsApp
            </a>
          </Col>

          {/* ------- form ------- */}
          <Col lg={7}>
            <div className="contact-form-card">
              <h5>Send us a message</h5>
              <BsForm onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <BsForm.Label>Your Name</BsForm.Label>
                    <BsForm.Control
                      type="text"
                      name="name"
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6}>
                    <BsForm.Label>Email Address</BsForm.Label>
                    <BsForm.Control
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col xs={12}>
                    <BsForm.Label>Subject</BsForm.Label>
                    <BsForm.Control
                      type="text"
                      name="subject"
                      placeholder="e.g. Need spikes for a 3-BHK balcony"
                      value={form.subject}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col xs={12}>
                    <BsForm.Label>Message</BsForm.Label>
                    <BsForm.Control
                      as="textarea"
                      rows={5}
                      name="message"
                      placeholder="Tell us about your requirement..."
                      value={form.message}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <button type="submit" className="contact-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> Send Message
                    </>
                  )}
                </button>
              </BsForm>
            </div>
          </Col>
        </Row>

        {/* ------- map ------- */}
        <div className="contact-map mt-4">
          <iframe
            title="SpikeZone location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14003.09546065403!2d77.13634398199956!3d28.666488918468676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03ab37c197b3%3A0xd6fa8f8cf7277235!2sSpikeZone%20-%20Bird%20Spikes%20-%20Pigeon%20Control%20Spikes!5e0!3m2!1sen!2sin!4v1660666017323!5m2!1sen!2sin"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </Container>
    </>
  );
}
