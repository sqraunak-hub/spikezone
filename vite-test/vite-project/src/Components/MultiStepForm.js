import React, { useState } from "react";
import {
  Col,
  Container,
  FloatingLabel,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";

const Step1 = ({ handleChange, nextStep, name, contact }) => {
  const [validateClass, setValidateClass] = useState(true);
  const [isNameValid, setIsNameValid] = useState(true);
  const [isContactValid, setIsContactValid] = useState(true);
  const [btnLoad, setBtnLoad] = useState(false);
  const validate = () => {
    if (name === "") {
      setIsNameValid(false);
      return false;
    } else if (contact === "") {
      setIsContactValid(false);
      return false;
    } else {
      setIsNameValid(true);
      return true;
    }
  };
  const handleNext = (event) => {
    setBtnLoad(true);
    event.preventDefault();
    if (!validate()) {
      setBtnLoad(false);
      return;
    } else {
      nextStep();
    }
  };
  return (
    <>
      <h4>Delivery Contact Details</h4>
      <Form onSubmit={handleNext} className="mt-1">
        <FloatingLabel controlId="floatingInput" label="Name" className="mb-3">
          <Form.Control
            type="text"
            className={
              isNameValid
                ? "input-success"
                : "input-error animate__animated animate__shakeX"
            }
            placeholder=" "
            name="name"
            onChange={handleChange}
            value={name}
          />
        </FloatingLabel>
        <FloatingLabel
          controlId="floatingInput"
          label="Contact"
          className="mb-3"
        >
          <Form.Control
            type="text"
            className={isContactValid ? "" : "input-error"}
            placeholder=" "
            name="contact"
            onChange={handleChange}
            value={contact}
          />
        </FloatingLabel>
        <hr />
        {btnLoad ? (
          <Spinner animation="border" role="status"></Spinner>
        ) : (
          <button type="submit" className="form-submit mt-2">
            Continue
          </button>
        )}
      </Form>
    </>
  );
};

const Step2 = ({
  nextStep,
  prevStep,
  handleChange,
  address,
  city,
  state,
  postCode,
}) => {
  const [validateClass, setValidateClass] = useState("");

  const validate = () => {
    if (address === "" || city === "" || state === "" || postCode === "") {
      return false;
    } else {
      return true;
    }
  };
  const handleNext = (event) => {
    event.preventDefault();
    if (!validate()) {
      setValidateClass("input-error animate__animated animate__shakeX");
      setTimeout(() => {
        setValidateClass("input-error");
      }, 2000);
      return;
    } else {
      setValidateClass("");
      nextStep();
    }
  };
  const classNames = `shadow-none ${validateClass}`;
  const handlePrev = (event) => {
    event.preventDefault();
    prevStep();
  };

  return (
    <>
      <Form onSubmit={handleNext}>
        <FloatingLabel
          controlId="floatingInput"
          label="Full Address"
          className="mb-3"
        >
          <Form.Control
            type="text"
            className={classNames}
            placeholder=" "
            name="address"
            onChange={handleChange}
            value={address}
          />
        </FloatingLabel>
        <Row>
          <Col>
            <FloatingLabel
              controlId="floatingInput"
              label="City"
              className="mb-3"
            >
              <Form.Control
                type="text"
                className={classNames}
                placeholder=" "
                name="city"
                onChange={handleChange}
                value={city}
              />
            </FloatingLabel>
          </Col>
          <Col>
            <FloatingLabel
              controlId="floatingInput"
              label="State"
              className="mb-3"
            >
              <Form.Control
                type="text"
                className={classNames}
                placeholder=" "
                name="state"
                onChange={handleChange}
                value={state}
              />
            </FloatingLabel>
          </Col>
          <Col>
            <FloatingLabel
              controlId="floatingInput"
              label="Post Code"
              className="mb-3"
            >
              <Form.Control
                type="text"
                className={classNames}
                placeholder=" "
                name="postCode"
                onChange={handleChange}
                value={postCode}
              />
            </FloatingLabel>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col>
            {" "}
            <button onClick={handlePrev} className="form-prev mt-2">
              Prev
            </button>
          </Col>
          <Col>
            <button type="submit" className="form-submit mt-2">
              Continue
            </button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

const Step3 = ({ prevStep, name, contact, address, city, state, postCode }) => {
  const handlePrev = (event) => {
    event.preventDefault();
    prevStep();
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Submitted " + name);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Container className="info-container rounded">
          <h3>Please Confirm Your Details</h3>
          <div className="confirmation-details">
            <Row>
              <Col className="info-head">Name:</Col>
              <Col className="info-content">{name}</Col>
            </Row>
            <Row>
              <Col className="info-head">Contact:</Col>
              <Col className="info-content">{contact}</Col>
            </Row>
            <Row>
              <Col className="info-head">Address:</Col>
              <Col className="info-content">{address}</Col>
            </Row>
          </div>
        </Container>
        <hr />
        <div className="mt-2">
          <Row>
            <Col>
              <button onClick={handlePrev} className="form-prev mt-2">
                Prev
              </button>
            </Col>
            <Col>
              <button type="submit" className="form-submit mt-2">
                Confirm & Continue
              </button>
            </Col>
          </Row>
        </div>
      </form>
    </>
  );
};

const ProgressBar = ({ step }) => {
  const steps = ["Personal Details", "Address", "Confirmation"];
  const activeStep = step - 1;

  return (
    <Row className="mb-4 progressbar shadow mb-1 rounded" id="progressbar">
      {steps.map((label, index) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;
        const classNames = `step ${isActive ? "active" : ""} ${
          isCompleted ? "completed" : ""
        }`;

        return (
          <Col key={label} className={classNames}>
            {label}
          </Col>
        );
      })}
    </Row>
  );
};

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postCode, setPostCode] = useState("");

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "contact":
        setContact(value);
        break;
      case "address":
        setAddress(value);
        break;
      case "city":
        setCity(value);
        break;
      case "state":
        setState(value);
        break;
      case "postCode":
        setPostCode(value);
        break;
      default:
        break;
    }
  };
  return (
    <>
      <Container className="mt-2">
        <div className="shadow rounded checkout-form">
          {step === 1 && (
            <div>
              <ProgressBar step={step} />
              <hr />
              <Step1
                nextStep={nextStep}
                handleChange={handleChange}
                name={name}
                contact={contact}
              />
            </div>
          )}
          {step === 2 && (
            <div>
              <ProgressBar step={step} />
              <hr />
              <Step2
                nextStep={nextStep}
                prevStep={prevStep}
                handleChange={handleChange}
                address={address}
                city={city}
                state={state}
                postCode={postCode}
              />
            </div>
          )}
          {step === 3 && (
            <div>
              <ProgressBar step={step} />
              <hr />
              <Step3
                prevStep={prevStep}
                handleChange={handleChange}
                name={name}
                contact={contact}
                address={address}
                city={city}
                state={state}
                postCode={postCode}
              />
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
