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
          <Col xs={12} md={6} className="text-center overflow-hidden">
            <div className="headline-text">{headlines[currentIndex]}</div>
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
