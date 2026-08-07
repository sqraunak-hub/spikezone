import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { MessageCircle, Clock4 } from "lucide-react"; // WhatsApp-like icon

export default function TopHeader() {
  const [headlines, setHeadlines] = useState([
    "🎉 Free shipping on orders above ₹999",
    "⚡ Flash Sale: Up to 50% off!",
    "💳 Secure Online Payments Available",
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [headlines.length]);

  return (
    <div style={{ backgroundColor: "#1e9dcd", color: "#fff" }}>
      <Container fluid className="py-2">
        <Row className="align-items-center text-center text-md-start">
          {/* Left: WhatsApp */}
          <Col
            xs={12}
            md={3}
            className="d-flex justify-content-center justify-content-md-start align-items-center mb-2 mb-md-0"
          >
            <MessageCircle size={18} style={{ marginRight: "6px" }} />
            <a
              href="https://wa.me/9873199277"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "white",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              +91 98731 99277
            </a>
          </Col>

          <Col xs={12} md={6} className="text-center overflow-hidden">
            <div className="headline-text">{headlines[currentIndex]}</div>
          </Col>

          <Col
            xs={12}
            md={3}
            className="text-center text-md-end mt-2 mt-md-0"
            style={{ fontWeight: 500, fontSize: "0.9rem" }}
          >
            <Clock4 size={18} style={{ marginRight: "6px" }} />
            Mon - Sat: 9:00 AM - 8:00 PM
          </Col>
        </Row>
      </Container>

      {/* Custom CSS */}
      <style>{`
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(10px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .headline-text {
          font-weight: 500;
          animation: fadeSlide 4s ease-in-out infinite;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
