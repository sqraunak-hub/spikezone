import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import { Container } from "react-bootstrap";
export default function FaqComp() {
  return (
    <Container className="sz-section mb-5">
      <div className="sz-section-head">
        <div>
          <span className="sz-eyebrow">Need Help?</span>
          <h2 className="sz-title">Frequently Asked Questions</h2>
        </div>
      </div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography style={{ fontWeight: "bold" }} component="span">
            Who are we ?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          SpikeZone is a registered Indian brand committed to delivering
          high-quality products and services to its customers. Established in
          2015, SpikeZone has grown to become one of the leading manufacturers
          of bird spikes in India. Our products are trusted for their
          durability, effectiveness, and value. In addition to our direct
          offerings, we proudly operate brand stores on major e-commerce
          platforms such as Amazon, Flipkart, and others, ensuring easy
          accessibility and nationwide reach. SpikeZone continues to innovate
          and expand, maintaining a strong reputation in both domestic and
          online markets.
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography style={{ fontWeight: "bold" }} component="span">
            What are bird spikes and how do they work?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          Bird spikes are physical bird deterrents made from durable materials
          like stainless steel or polycarbonate. They prevent birds from landing
          or nesting on surfaces such as ledges, roofs, balconies, and air
          conditioning units—without harming the birds.
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography style={{ fontWeight: "bold" }} component="span">
            Are bird spikes safe for birds and animals?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          Yes, our bird spikes are designed to deter birds without causing them
          harm. They create an uncomfortable landing area, encouraging birds to
          relocate naturally and humanely.
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography style={{ fontWeight: "bold" }} component="span">
            Where can I install bird spikes?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          You can install bird spikes on ledges, window sills, air conditioners,
          railings, rooftops, signage, and other flat surfaces where birds tend
          to perch or nest.
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography style={{ fontWeight: "bold" }} component="span">
            Can I use your products in residential areas?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          Yes. All of our bird and monkey deterrent products are suitable for
          homes, offices, factories, warehouses, temples, and agricultural
          spaces.
        </AccordionDetails>
      </Accordion>
    </Container>
  );
}
