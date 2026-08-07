import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal } from "react-bootstrap";
import axios from "axios";
import { MdInfo } from "react-icons/md";

import { API_BASE_URL } from "../Utils/appConstant";

export function MessagesContent() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null); // For modal details
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token"); // Fetch token from localStorage
      const response = await axios.get(
        `${API_BASE_URL}contact/`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass token in Authorization header
          },
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle info modal
  const handleInfo = (message) => {
    setSelectedMessage(message);
    setShowInfoModal(true);
  };

  return (
    <>
      <Container className="mt-5 shadow cat-container">
        <h3>Messages</h3>
        <hr />
        <Table striped bordered hover className="shadow">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message, index) => (
              <tr key={message.id}>
                <td>{index + 1}</td>
                <td>{message.name}</td>
                <td>{message.email}</td>
                <td>{message.subject}</td>
                <td>
                  {message.message.length > 50
                    ? `${message.message.substring(0, 50)}...`
                    : message.message}
                </td>
                <td>
                  <Button variant="info" onClick={() => handleInfo(message)}>
                    <span className="d-flex align-items-center">
                      <MdInfo className="" style={{ color: "white" }} />
                    </span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      {/* Info Modal */}
      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Message Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMessage && (
            <div>
              <p>
                <strong>Name:</strong> {selectedMessage.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedMessage.email}
              </p>
              <p>
                <strong>Subject:</strong> {selectedMessage.subject}
              </p>
              <p>
                <strong>Message:</strong> {selectedMessage.message}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInfoModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default function Messages() {
  return <MessagesContent />;
}
