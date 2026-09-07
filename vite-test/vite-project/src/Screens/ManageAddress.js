import React, { useState, useEffect } from "react";
import PageTitle from "../Components/PageTitle";
import {
  Col,
  Container,
  Row,
  Card,
  Button,
  Badge,
  Modal,
  Form,
} from "react-bootstrap";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import useAddressStore from "../store/addressStore";
import { toast } from "react-toastify";
import "../Assets/CSS/ManageAddress.css";
import useUserStore from "../store/userStore";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

export default function ManageAddress() {
  const { addresses, fetchAddresses, addAddress, deleteAddress } =
    useAddressStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const user = useUserStore((state) => state.user);
  const [newAddress, setNewAddress] = useState({
    user: user.id,
    full_name: "",
    phone: "",
    address: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
  });

  useEffect(() => {
    fetchAddresses(user.id);
  }, [fetchAddresses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addAddress(newAddress);
      setShowAddModal(false);
      toast.success("Address added successfully!");
    } catch (error) {
      toast.error("Failed to add address");
    }
  };

  const handleDelete = async (addressId) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui">
            <h1>Are you sure?</h1>
            <p>You want to delete this address?</p>
            <Button className="add-dlt-btn-cn" onClick={onClose}>
              No
            </Button>
            <Button
              className="add-dlt-btn"
              onClick={async () => {
                try {
                  await deleteAddress(addressId);
                  toast.success("Address deleted successfully!");
                } catch (error) {
                  toast.error("Failed to delete address");
                }
                onClose();
              }}
            >
              Yes, Delete it!
            </Button>
          </div>
        );
      },
    });
  };

  return (
    <>
      <PageTitle as="h2" title="Manage Addresses" />
      <Container className="py-4">
        <div className="d-flex justify-content-end mb-4">
          <button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="d-flex align-items-center gap-2 add-address-btn"
          >
            <MdAdd size={20} /> Add New Address
          </button>
        </div>

        <Row>
          {addresses.map((address) => (
            <Col lg={6} className="mb-4" key={address.id}>
              <Card className="h-100 shadow-sm hover-shadow">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="mb-1">{address.full_name}</h5>
                      <p className="text-muted mb-1">{address.phone}</p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                      >
                        <MdDelete size={18} />
                      </Button>
                    </div>
                  </div>
                  <hr />
                  <p className="mb-1">
                    {address.address}
                    {address.address_line2 && <>, {address.address_line2}</>}
                  </p>
                  <p className="mb-1">
                    {address.city}, {address.state} - {address.zip_code}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Address</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={newAddress.full_name}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          full_name: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Address Line 1</Form.Label>
                <Form.Control
                  type="text"
                  value={newAddress.address}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address Line 2 (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  value={newAddress.address_line2}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      address_line2: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>ZIP Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={newAddress.zip_code}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          zip_code: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="save-address-btn"
                >
                  Save Address
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}
