import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Container } from "react-bootstrap";
import "../Assets/CSS/productModal.css";
import msSpike from "../Assets/IMG/msspike.png";
import ListGroup from "react-bootstrap/ListGroup";

export default function ProductModal(props) {
  const [show, setShow] = useState(true);

  return (
    <>
      <Modal fullscreen show={props.show} onHide={props.hide}>
        <Modal.Header closeButton style={{ color: "var(--szc-ink)" }}>
          <Modal.Title id="contained-modal-title-lg">
            {props.modalTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container className="modal-body">
            <Container className="row">
              <Container className="col-md-6">
                <img src={msSpike} alt="" width={"100%"} />
              </Container>
              <Container className="col-md-6">
                <h1>{props.title}</h1>
                <p className="mt-5">{props.shortDesc}</p>
                <span>
                  <p>
                    M.R.P:{" "}
                    <span style={{ textDecoration: "line-through" }}>
                      Rs.{props.mrp}/-
                    </span>
                  </p>
                  <span>Price: </span>
                  <span style={{ fontSize: "30px" }}>
                    Rs.{props.price}/-
                  </span>{" "}
                </span>
                <ListGroup
                  className="mt-3"
                  variant="flush"
                  style={{ background: "transparent" }}
                >
                  <ListGroup.Item>{props.bulletPointOne}</ListGroup.Item>
                  <ListGroup.Item>{props.bulletPointTwo}</ListGroup.Item>
                  <ListGroup.Item>{props.bulletPointThree}</ListGroup.Item>
                  <ListGroup.Item>{props.bulletPointFour}</ListGroup.Item>
                </ListGroup>
              </Container>
            </Container>
            <Container>
              <h1 className="mt-5">Description</h1>
              <p className="mt-3">{props.description}</p>
            </Container>
          </Container>
        </Modal.Body>
        <Modal.Footer />
      </Modal>
    </>
  );
}
