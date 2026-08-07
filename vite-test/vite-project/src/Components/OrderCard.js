import { useState } from "react";
import { format } from "date-fns";
import { Card, Row, Col, Badge, Button, Modal } from "react-bootstrap";
import Chip from "@mui/material/Chip";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import "../Assets/CSS/Orders.css";
import {
  Calendar,
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
} from "lucide-react";

const OrderCard = ({ order }) => {
  const [showModal, setShowModal] = useState(false);
  const firstItem = order.items[0];
  const Navigate = useNavigate();

  const handleViewOrderDetails = () => {
    const encryptedId = CryptoJS.AES.encrypt(
      order.id.toString(),
      "spikezone@123"
    ).toString();

    Navigate(`/order-detail/${encodeURIComponent(encryptedId)}`);
  };

  return (
    <>
      <Card className="mb-4 custom-order-card">
        <Row className="g-0 align-items-center p-6">
          <Col xs={4}>
            <img
              src={
                firstItem?.product_image || "https://via.placeholder.com/100"
              }
              alt={firstItem?.product_name || "Product Image"}
              className="order-img"
            />
          </Col>
          <Col xs={8}>
            <div className="order-header">
              <div>
                <h6 className="order-title">
                  {firstItem?.product_name || "Order"}
                </h6>
                <p className="order-id">Order #{order.id}</p>
              </div>
              <div>
                <div className="order-price">
                  ₹{order.total_amount.toFixed(2)}
                </div>
                <div className="order-qty">Qty: {firstItem.quantity}</div>
              </div>
            </div>

            <div className="order-date">
              <Calendar className="me-1" size={16} />
              {format(new Date(order.order_date), "MMM dd, yyyy HH:mm")}
            </div>

            <div
              className={`order-status ${
                order.delivery_status === "pending"
                  ? "status-pending"
                  : order.delivery_status === "delivered"
                  ? "status-delivered"
                  : order.payment_status === "pending"
                  ? "status-payment-pending"
                  : ""
              }`}
            >
              {order.delivery_status === "pending" && <Clock size={14} />}
              {order.delivery_status === "delivered" && (
                <CheckCircle size={14} />
              )}
              {order.payment_status === "pending" && <CreditCard size={14} />}
              {order.delivery_status_display || "Pending"}
            </div>

            <div className="order-actions">
              <Button
                variant="outline-primary"
                size="sm"
                className="flex-fill"
                onClick={handleViewOrderDetails}
              >
                View Details
              </Button>
              {order.delivery_status === "pending" && (
                <Button variant="dark" size="sm">
                  <Truck size={14} className="me-1" />
                  Track
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        style={{ backgroundColor: "transparent" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Order #{order.id} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Col>
              <h6 className="fw-bold">Order Date</h6>
              <small className="text">
                {format(new Date(order.order_date), "PPpp")}
              </small>
            </Col>
            <Col className="text-end">
              <h6 className="fw-bold">Status</h6>
              <div className="mt-2">
                <Chip
                  label={`Your Order is ${order.delivery_status_display}`}
                  color={
                    order.delivery_status === "pending" ? "warning" : "success"
                  }
                />
                {(order.payment_status === "pending" ||
                  order.payment_status === "failed") && (
                  <Chip
                    label={
                      order.payment_status === "pending"
                        ? "Payment Pending"
                        : "Payment Failed"
                    }
                    color={
                      order.payment_status === "pending" ? "warning" : "error"
                    }
                    className="ms-2"
                  />
                )}
              </div>
            </Col>
          </Row>

          <hr />

          {order.items.map((item) => (
            <Row key={item.id} className="mb-3 align-items-center">
              <Col xs={2}>
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="img-fluid rounded"
                />
              </Col>
              <Col xs={6}>
                <p className="mb-0 fw-medium">{item.product_name}</p>
                <small className="text">Quantity: {item.quantity}</small>
              </Col>
              <Col xs={4} className="text-end">
                <p className="mb-0">₹{item.item_total}</p>
              </Col>
              <Col>
                {order.delivery_status === "delivered" && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() =>
                      Navigate(`/add-review/${order.id}/${item.product}`)
                    }
                  >
                    Add Review
                  </Button>
                )}
              </Col>
            </Row>
          ))}

          <hr />

          <Row className="mb-3">
            <Col>
              <h6 className="fw-bold">Delivery Address</h6>
              {order.address_details ? (
                <div className="border rounded p-3">
                  <p className="mb-1">{order.address_details.address}</p>
                  <p className="mb-0">
                    {order.address_details.city}, {order.address_details.state}{" "}
                    - {order.address_details.zip_code}
                  </p>
                </div>
              ) : (
                <div className="border rounded p-3 text-muted">
                  Address not available
                </div>
              )}
            </Col>
          </Row>

          <Row>
            <Col>
              <h6 className="fw-bold text">Total Amount</h6>
            </Col>
            <Col className="text-end">
              <h5 className="fw-bold text-primary">₹{order.total_amount}</h5>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderCard;
