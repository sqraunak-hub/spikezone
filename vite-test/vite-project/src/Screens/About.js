import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import "../Assets/CSS/about.css";
import aboutUsPageImg from "../Assets/IMG/aboutus.png";
import Loader from "../Components/Loader";
import PageTitle from "../Components/PageTitle";
import FaqComp from "../Components/FaqComp";
import SEOHelmet from "../Components/SEOHelmet";
export default function About() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);
  return (
    <>
      <SEOHelmet />
      <PageTitle as="h2" title={"Learn More About Us"} />
      {loading ? (
        <Loader />
      ) : (
        <Container className="about-us-parent">
          <Container className="section-one">
            <Container className="row">
              <Container className="col-12 col-md-6">
                <div className="about-image-container">
                  <img
                    src={aboutUsPageImg}
                    alt="About SpikeZone"
                    className="img-fluid about-img"
                  />
                </div>
              </Container>
              <Container className="col-12 col-md-6 mt-5">
                <h2>Who we Are ?</h2>
                <p className="mt-4" style={{ fontSize: "20px" }}>
                  SpikeZone is a registered Indian brand committed to delivering
                  high-quality products and services to its customers.
                  Established in 2015, SpikeZone has grown to become one of the
                  leading manufacturers of bird spikes in India. Our products
                  are trusted for their durability, effectiveness, and value. In
                  addition to our direct offerings, we proudly operate brand
                  stores on major e-commerce platforms such as Amazon, Flipkart,
                  and others, ensuring easy accessibility and nationwide reach.
                  SpikeZone continues to innovate and expand, maintaining a
                  strong reputation in both domestic and online markets.
                </p>
              </Container>
            </Container>
          </Container>
          <Container className="section-two ">
            <h1>Why Choose Us ?</h1>
            <p>
              Polycarbonate bird spikes keep concrete buildings safe from
              pigeons and ensure safety of birds from human. Setting spikes is
              like making a safely wall between the feathered friends and human
              society. They can nest at other places that are safer for them.
              <br /> SpikeZone is one of the leading bird spikes manufacturers
              but we make spikes of all sizes and areas. Also, we try keeping
              things simple and affordable. Our objective is to provide the best
              product that is convenient to use, affordable to buy and
              maintenance free.
              <br /> <br /> <strong>Objective of Using Spikes Pigeon</strong>
              <br /> spikes scare the feathered friends away. Visible from the
              high skies, the needled rods of polycarbonate prevent birds from
              landing on open boundary walls and attics. Fowls can see these
              rods while flying high in the sky and change their landing to safe
              places. And the spikes won’t harm the fowls even if they
              accidentally land on these rods. Make of polycarbonate, these rods
              can withstand the pressure of a full-size pigeon without showing
              any sign of breakage. Also, the rods pressed by the bird will jump
              back to their original size and position as soon as the fowl jumps
              back. Also, you won’t require any helping hand to install these
              spikes on boundary walls. As SpikeZone is one of the leading anti
              bird net manufacturers, you can rely on our brand. Durability of
              The Product You need setting the spikes on concrete walls and it
              is easier to fix the polycarbonate rods on concrete. Also, these
              rods set perfectly and they remain fixed at their place. SpikeZone
              tests durability of its products before sending them to market for
              sale. The pigeon spikes won’t come out even after long term use.
              You can even buy spikes for monkeys that are often found roaming
              close to human settlements. Our brand, SpikeZone, also figures
              among the leading monkey spikes manufacturers. These polycarbonate
              spikes are also used as bird nets are.{" "}
            </p>
          </Container>
        </Container>
      )}
      <FaqComp />
    </>
  );
}
