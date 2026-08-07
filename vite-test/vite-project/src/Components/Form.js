import React, { useState } from "react";
import "../Assets/CSS/form.css";
import { Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { faAt } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { API_BASE_URL } from "../Utils/appConstant";

export default function () {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleName = (e) => {
    setName(e.target.value);
  };
  const handleEmail = (e) => {
    setEmail(e.target.value);
  };
  const handleSubject = (e) => {
    setSubject(e.target.value);
  };
  const handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (name === "" || email === "" || subject === "" || message === "") {
      toast.error("Please fill out all fields!");
      setLoading(false);
      return;
    }

    const formData = {
      name,
      email,
      subject,
      message,
    };

    const startTime = Date.now(); // capture start time

    try {
      const response = await axios.post(
        `${API_BASE_URL}contact/`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const elapsedTime = Date.now() - startTime;
      const delay = Math.max(1500 - elapsedTime, 0);

      setTimeout(() => {
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        toast.success(
          "Message sent successfully! We'll get back to you as soon as possible !!"
        ); // Now inside setTimeout
        setLoading(false);
      }, delay);
    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      const delay = Math.max(1500 - elapsedTime, 0);

      setTimeout(() => {
        console.error("Error sending form data:", error);
        toast.error("Failed to send your message. Please try again!");
        setLoading(false);
      }, delay);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.target.reset();
  };
  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />

      <Container className="contact-parent-container">
        <Container className="form-container mt-5 row justify-content-md-center gx-5 px-4">
          <Container className="col">
            <Container className="input-container">
              <h1>Leave your Message Here !!</h1>
              <p>
                You can send us your enquiries/complaints here & we will repond
                to you as soon as possible.
              </p>
              <form action="" onSubmit={handleFormSubmit}>
                <Container className="column">
                  <label className="contact-label" htmlFor="name">
                    Name:
                  </label>
                  <input
                    type="text"
                    className="mt-3 contact-input"
                    name="name"
                    value={name}
                    onChange={handleName}
                  />
                </Container>
                <Container className="column">
                  <label className="contact-label" htmlFor="email">
                    Email:
                  </label>
                  <input
                    type="text"
                    className="mt-3 contact-input"
                    name="email"
                    value={email}
                    onChange={handleEmail}
                  />
                </Container>
                <Container className="column">
                  <label className="contact-label" htmlFor="subject">
                    Subject:
                  </label>
                  <input
                    type="text"
                    className="mt-3 contact-input"
                    name="subject"
                    value={subject}
                    onChange={handleSubject}
                  />
                </Container>
                <Container className="column">
                  <label className="contact-label" htmlFor="message">
                    Message:
                  </label>
                  <input
                    type="text"
                    className="mt-3 contact-input"
                    name="message"
                    value={message}
                    onChange={handleMessage}
                  />
                </Container>
                <Container>
                  <button
                    type="submit"
                    value="Send"
                    className="form-submit mt-3"
                    onClick={handleSubmit}
                  >
                    {loading ? "Sending..." : "Send"}
                  </button>
                </Container>
              </form>
            </Container>
          </Container>
          <Container className="col mt-4">
            <h1>Reach Us !</h1>
            <Container className="contact-detail mt-5">
              <ul class="list-group list-group-flush">
                <li class="list-group-item contact-detail-list">
                  <FontAwesomeIcon
                    style={{ Color: "#1e9dcd" }}
                    className=" contact-detail-icon"
                    icon={faBuilding}
                  />{" "}
                  <span className="ms-5">
                    Plot No. - 3, Main Kair Road, Mitraon, Najafgarh, South West
                    Delhi - 110043
                  </span>
                </li>
                <li class="list-group-item contact-detail-list">
                  <FontAwesomeIcon
                    style={{ Color: "#1e9dcd" }}
                    className="contact-detail-icon"
                    icon={faPhone}
                  />{" "}
                  <span className="ms-5">+91 9873199277, +91 9990955869</span>
                </li>
                <li class="list-group-item contact-detail-list">
                  <FontAwesomeIcon
                    style={{ Color: "#1e9dcd" }}
                    className="contact-detail-icon"
                    icon={faAt}
                  />{" "}
                  <span className="ms-5">help@spikezone.co.in</span>
                </li>
              </ul>
            </Container>
          </Container>
        </Container>
        <Container className="map-container mt-5">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14003.09546065403!2d77.13634398199956!3d28.666488918468676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03ab37c197b3%3A0xd6fa8f8cf7277235!2sSpikeZone%20-%20Bird%20Spikes%20-%20Pigeon%20Control%20Spikes!5e0!3m2!1sen!2sin!4v1660666017323!5m2!1sen!2sin"
            width="600"
            height="450"
            // style="border:0;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </Container>
      </Container>
    </>
  );
}
