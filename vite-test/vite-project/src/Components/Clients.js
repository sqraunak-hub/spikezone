import React from "react";
import { Container } from "react-bootstrap";
import "../Assets/CSS/client.css";
import "../Assets/CSS/home-modern.css";
import { Pagination, Navigation, Autoplay, A11y } from "swiper/modules";
import berger from "../Assets/IMG/clients/berger.jpg";
import bwh from "../Assets/IMG/clients/bwh.jpg";
import puricons from "../Assets/IMG/clients/puricons.jpg";
import powergrid from "../Assets/IMG/clients/powergrid.jpg";
import amrik from "../Assets/IMG/clients/amrik.png";
import DMRC from "../Assets/IMG/clients/DMRC.jpg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";

const LOGOS = [berger, puricons, DMRC, powergrid, bwh, amrik];

export default function Clients() {
  return (
    <Container className="sz-section sz-clients">
      <div className="sz-section-head">
        <div>
          <span className="sz-eyebrow">Trusted Nationwide</span>
          <h2 className="sz-title">Our Clients</h2>
          <p className="sz-sub">
            From metro rail to power grids — organisations across India rely on
            SpikeZone for bird control.
          </p>
        </div>
      </div>

      <Swiper
        modules={[Navigation, Pagination, A11y, Autoplay]}
        loop={true}
        autoplay={{ delay: 2500 }}
        breakpoints={{
          0: { slidesPerView: 2, spaceBetween: 16 },
          576: { slidesPerView: 3, spaceBetween: 20 },
          992: { slidesPerView: 5, spaceBetween: 28 },
        }}
      >
        {LOGOS.map((logo, i) => (
          <SwiperSlide key={i}>
            <img src={logo} className="client-img" alt="Client logo" />
          </SwiperSlide>
        ))}
      </Swiper>
    </Container>
  );
}
