import React, { useEffect, useState } from "react";
import { useNavigate, useNavigation, useParams } from "react-router-dom";
import axios from "axios";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";
import PageTitle from "../Components/PageTitle";
import "../Assets/CSS/OrderDetail.css";
import {
  Calendar1Icon,
  Clock,
  Locate,
  MapPin,
  Pin,
  ShoppingBag,
} from "lucide-react";
import { Spinner } from "react-bootstrap";

const OrderDetail = () => {
  const { encryptedId } = useParams();
  const [order, setOrder] = useState(null);
  const Navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token"); // Get token from localStorage

    try {
      const bytes = CryptoJS.AES.decrypt(
        decodeURIComponent(encryptedId),
        "spikezone@123"
      );
      const decryptedId = parseInt(bytes.toString(CryptoJS.enc.Utf8));

      // Fetch the order details using the decrypted ID
      axios
        .get(`/orders/${decryptedId}/`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the Authorization header
          },
        })
        .then((response) => {
          setOrder(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching order details:", error);
          toast.error("Failed to fetch order details.");
          setLoading(false);
        });
    } catch (error) {
      console.error("Error decrypting order ID:", error);
      toast.error("Invalid order ID.");
      setLoading(false);
    }
  }, [encryptedId]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" className="spinner-border" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center my-5">Order not found.</div>;
  }

  return (
    <>
      <PageTitle title="Order Details" />
      <div className="ord-det-container">
        <div className="ord-det-header">
          <div>
            <p className="ord-det-text-muted">
              Order #{order.razorpay_order_id}
            </p>
          </div>
          <div className="ord-det-badge-group">
            {order.delivery_status_display === "Delivered" ? (
              <div className="ord-det-badge-completed">Delivered</div>
            ) : (
              <div className="ord-det-badge-pay-pending">Delivery Pending</div>
            )}

            {order.payment_status === "completed" ? (
              <div className="ord-det-badge-pay-completed">Paid</div>
            ) : (
              <div className="ord-det-badge-pay-pending">Payment Pending</div>
            )}
          </div>
        </div>

        <div className="ord-det-grid-3">
          {/* Products Section */}
          <div>
            <div className="ord-det-section">
              <h2 className="ord-det-section-heading">
                <ShoppingBag className="ord-det-icon" />
                Products
              </h2>

              {order.items.map((item) => (
                <div key={item.id} className="ord-det-product-item">
                  <div
                    className="ord-det-product-img"
                    style={{
                      backgroundImage: `url(${item.product_image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>
                  <div className="ord-det-product-info">
                    <div>
                      <div className="ord-det-summary-row">
                        <span>
                          <h3>{item.product_name}</h3>
                        </span>
                        <span>
                          {order.delivery_status_display === "Delivered" ? (
                            <button
                              className="ord-add-review-btn"
                              onClick={() =>
                                Navigate(
                                  `/add-review/${order.id}/${item.product}`
                                )
                              }
                            >
                              Add Review
                            </button>
                          ) : (
                            <></>
                          )}
                        </span>
                      </div>
                      <p className="ord-det-text-muted ord-det-text-sm">
                        Price: ₹{item.product_price}
                      </p>
                    </div>
                    <div className="ord-det-summary-row">
                      <span className="ord-det-text-sm">
                        Qty: {item.quantity}
                      </span>
                      <span>₹{item.item_total}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div
                className="ord-det-summary-row"
                style={{ fontWeight: "500" }}
              >
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          <div className="ord-det-grid">
            <div className="ord-det-section">
              <h2 className="ord-det-section-heading">
                <Calendar1Icon className="ord-det-icon" />
                Order Information
              </h2>

              <div className="ord-det-text-sm">
                <p>
                  <span className="ord-det-text-muted">Order ID:</span> #
                  {order.razorpay_order_id}
                </p>
                <p>
                  <span className="ord-det-text-muted">Order Date:</span>{" "}
                  {new Date(order.order_date).toLocaleDateString()}
                </p>
                <p>
                  <span className="ord-det-text-muted">Payment Method:</span>{" "}
                  Razorpay
                </p>
              </div>
            </div>

            <div className="ord-det-section">
              <h2 className="ord-det-section-heading">
                <MapPin className="ord-det-icon" />
                Shipping Address
              </h2>

              <div className="ord-det-text-sm">
                {order.address_details ? (
                  <>
                    <p className="ord-det-font-medium">Receiver</p>
                    <p>{order.address_details.full_name}</p>
                    <p>{order.address_details.phone}</p>
                    <p>{order.address_details.address}</p>
                    <p>
                      {order.address_details.city},{" "}
                      {order.address_details.state}
                      {" - "}
                      {order.address_details.zip_code}
                    </p>
                  </>
                ) : (
                  <p className="ord-det-text-muted">No address provided.</p>
                )}
              </div>
            </div>

            <div className="ord-det-section">
              <h2 className="ord-det-section-heading">
                <Clock className="ord-det-icon" />
                Delivery Status
              </h2>

              <div className="ord-det-timeline">
                <div className="ord-det-timeline-item">
                  <p className="ord-det-font-medium">Order Placed</p>
                  <p className="ord-det-text-muted ord-det-text-sm">
                    {new Date(order.order_date).toLocaleDateString()}
                  </p>
                </div>
                {/* Future logic could include more steps like shipped/delivered */}
                <div className="ord-det-timeline-item">
                  <p className="ord-det-font-medium">
                    {order.delivery_status_display}
                  </p>
                </div>
              </div>
            </div>

            <a href={`/contact`} className="ord-det-btn">
              Any Issues? Contact Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
