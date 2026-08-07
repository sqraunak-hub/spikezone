import React from "react";
import { Container } from "react-bootstrap";
import "../Assets/CSS/home.css";
import subBanner from "../Assets/IMG/SubBanner.png";

export default function OnlineShop() {
  return (
    <>
      <Container className="home-banner-two mt-5">
        <img src={subBanner} style={{ width: "100%" }} alt="" />
      </Container>
    </>
  );
}
