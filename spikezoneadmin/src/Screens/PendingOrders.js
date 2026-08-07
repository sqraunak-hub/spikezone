import React, { useState, useEffect, useRef } from "react";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { MdDelete, MdInfo, MdEdit } from "react-icons/md";
import OrderLabel from "../Components/OrderLabel";
import { useReactToPrint } from "react-to-print";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { API_BASE_URL } from "../Utils/appConstant";

export function PendingOrdersContent() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // For modal details
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    delivery_status: "",
    payment_status: "",
  });

  const printRef = useRef();

  useEffect(() => {
    console.log(orders);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const pendingOrders = response.data.filter(
        (order) =>
          order.delivery_status === "pending" ||
          order.delivery_status === "shipped"
      );
      setOrders(pendingOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const deleteOrder = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Fetch token from localStorage
      await axios.delete(`${API_BASE_URL}orders/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token in Authorization header
        },
      });
      fetchOrders(); // Refresh orders after deletion
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const handleDelete = async (id) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui">
            <h1>Are you sure?</h1>
            <p>You want to delete this file?</p>
            <button className="add-dlt-btn-cn" onClick={onClose}>
              No
            </button>
            <button
              className="add-dlt-btn"
              variant="danger"
              onClick={async () => {
                await deleteOrder(id);
                onClose();
              }}
            >
              Yes, Delete it!
            </button>
          </div>
        );
      },
    });
  };

  // Handle info modal
  const handleInfo = (order) => {
    setSelectedOrder(order);
    setShowInfoModal(true);
  };

  // Handle edit modal
  const handleEdit = (order) => {
    setSelectedOrder(order);
    setEditFormData({
      delivery_status: order.delivery_status,
      payment_status: order.payment_status,
    });
    setShowEditModal(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // Fetch token from localStorage
      await axios.patch(
        `${API_BASE_URL}orders/${selectedOrder.id}/update_status/`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass token in Authorization header
          },
        }
      );
      setShowEditModal(false);
      fetchOrders(); // Refresh orders after editing
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Container className="mt-5 shadow cat-container">
        <h3>Pending Orders</h3>
        <hr />
        <Table striped bordered hover className="shadow">
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Order ID</th>
              <th>Product Name</th>
              <th>Shipping Status</th>
              <th>Payment Status</th>
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => {
              const hasItems = order.items && order.items.length > 0;
              const item = hasItems ? order.items[0] : null;

              const productImage = item?.product_image;
              const productName = item?.product_name;

              return (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td>
                    {productImage ? (
                      <img
                        src={productImage}
                        alt="Product"
                        style={{ height: "100px" }}
                      />
                    ) : (
                      <span>[product_image is missing]</span>
                    )}
                  </td>
                  <td>
                    {order.razorpay_order_id?.replace("order_", "") ||
                      "[order_id is missing]"}
                  </td>
                  <td>{productName || "[product_name is missing]"}</td>
                  <td>
                    {order.delivery_status || "[delivery_status is missing]"}
                  </td>
                  <td>
                    {order.payment_status || "[payment_status is missing]"}
                  </td>
                  <td>
                    {order.order_date
                      ? new Date(order.order_date).toLocaleDateString()
                      : "[order_date is missing]"}
                  </td>
                  <td>
                    <Button
                      variant="info"
                      style={{ color: "white", marginRight: "5px" }}
                      onClick={() => handleInfo(order)}
                    >
                      <MdInfo style={{ color: "white" }} />
                    </Button>
                    <Button
                      variant="warning"
                      style={{ color: "white", marginRight: "5px" }}
                      onClick={() => handleEdit(order)}
                    >
                      <MdEdit style={{ color: "white" }} />
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(order.id)}
                    >
                      <MdDelete style={{ color: "white" }} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Container>

      {/* Info Modal */}
      <Modal
        show={showInfoModal}
        onHide={() => setShowInfoModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div ref={printRef}>
              <h5>Shipping Label</h5>
              <p>
                <strong>Name:</strong> {selectedOrder.user_details?.name}
              </p>
              <p>
                <strong>Phone:</strong> {selectedOrder.user_details?.contact}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {selectedOrder.address_details?.address},{" "}
                {selectedOrder.address_details?.city}
              </p>
              <p>
                <strong>Amount:</strong> ₹{selectedOrder.total_amount}
              </p>

              <hr />
              <h6>Items:</h6>
              <ul>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <li key={idx}>
                      {item.product_name || "[product_name is missing]"} ×{" "}
                      {item.quantity || "[quantity is missing]"}
                    </li>
                  ))
                ) : (
                  <li>[items are missing]</li>
                )}
              </ul>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInfoModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            Print Label
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group>
              <Form.Label>Delivery Status</Form.Label>
              <Form.Control
                as="select"
                name="delivery_status"
                value={editFormData.delivery_status}
                onChange={handleEditChange}
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Payment Status</Form.Label>
              <Form.Control
                as="select"
                name="payment_status"
                value={editFormData.payment_status}
                onChange={handleEditChange}
              >
                <option value="pending">Pending</option>
                <option value="completed">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default function PendingOrders() {
  return <PendingOrdersContent />;
}
