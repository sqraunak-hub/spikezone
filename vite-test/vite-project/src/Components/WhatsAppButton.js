import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import "../Assets/CSS/whatsapp-button.css";

// The number that is already published in the header and footer.
const NUMBER = "919990955869";
const MESSAGE =
  "Hi SpikeZone, I have a bird problem and would like a quote.";

export default function WhatsAppButton() {
  return (
    <a
      className="sz-wa"
      href={`https://wa.me/${NUMBER}?text=${encodeURIComponent(MESSAGE)}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with SpikeZone on WhatsApp"
    >
      <FaWhatsapp aria-hidden="true" />
      <span className="sz-wa-label">Chat with us</span>
    </a>
  );
}
