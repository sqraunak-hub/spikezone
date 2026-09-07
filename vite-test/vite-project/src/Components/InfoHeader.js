import React from "react";
import { Container } from "react-bootstrap";
import {
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";
import "../Assets/CSS/top-bar.css";

/**
 * The utility strip above the header: how to reach us on the left, social on
 * the right. Every address below is the one already published in the footer -
 * nothing here is a placeholder.
 */
const CONTACT = [
  {
    icon: <FaEnvelope />,
    label: "support@spikezone.in",
    href: "mailto:support@spikezone.in",
  },
  {
    icon: <FaPhone />,
    label: "+91 99909 55869",
    href: "tel:+919990955869",
  },
  { icon: <FaLocationDot />, label: "Pan India Service" },
];

const SOCIALS = [
  {
    icon: <FaFacebookF />,
    href: "https://www.facebook.com/spikezoneltd/",
    label: "Facebook",
  },
  {
    icon: <FaLinkedinIn />,
    href: "https://in.linkedin.com/company/spikezone-bird-spikes",
    label: "LinkedIn",
  },
  {
    icon: <FaInstagram />,
    href: "https://www.instagram.com/spikezone_birdspikes/",
    label: "Instagram",
  },
  {
    icon: <FaXTwitter />,
    href: "https://twitter.com/spikezoneltd",
    label: "Twitter",
  },
];

export default function InfoHeader() {
  return (
    <div className="sztb">
      <Container fluid className="sztb-inner">
        <ul className="sztb-contact">
          {CONTACT.map((c) => (
            <li key={c.label}>
              <span className="sztb-icon" aria-hidden="true">
                {c.icon}
              </span>
              {c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}
            </li>
          ))}
        </ul>

        <ul className="sztb-social">
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
