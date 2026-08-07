import React, { useState } from "react";
import {
  Col,
  Container,
  FloatingLabel,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { ImUpload } from "react-icons/im";
import "react-dropzone-uploader/dist/styles.css";
import Dropzone from "react-dropzone-uploader";

const Step1 = ({
  handleChange,
  handleFile,
  nextStep,
  product_sku,
  title,
  max_price,
  price,
}) => {
  // specify upload params and url for your files
  const getUploadParams = ({ meta }) => {
    return { url: "https://httpbin.org/post" };
  };

  // called every time a file's `status` changes
  const handleChangeStatus = ({ meta, file }, status) => {
    console.log(status, meta, file);
  };

  // receives array of files that are done uploading when submit button is clicked
  const handleSubmit = (files, allFiles) => {
    console.log(files.map((f) => f.meta));
    allFiles.forEach((f) => f.remove());
  };

  const [show, setShow] = useState();
  const [file, setFile] = useState();
  const [height, setHeight] = useState(0);
  const [validateClass, setValidateClass] = useState(true);
  const [isNameValid, setIsNameValid] = useState(true);
  const [isContactValid, setIsContactValid] = useState(true);
  const [btnLoad, setBtnLoad] = useState(false);
  //   const validate = () => {
  //     if (name === "") {
  //       setIsNameValid(false);
  //       console.log(isNameValid);
  //       return false;
  //     } else if (contact === "") {
  //       console.log(isContactValid);
  //       setIsContactValid(false);
  //       return false;
  //     } else {
  //       setIsNameValid(true);
  //       return true;
  //     }
  //   };
  const handleNext = (event) => {
    setBtnLoad(true);
    event.preventDefault();
    // if (!validate()) {
    //   setBtnLoad(false);
    //   return;
    // } else {
    //   nextStep();
    // }
    nextStep();
  };

  return (
    <>
      <h4>Product Details</h4>
      <form onSubmit={handleNext}>
        <Row>
          <Col>
            <div>
              <label htmlFor="product_sku" className="cat-label">
                Product SKU
              </label>
            </div>
            <div>
              <input
                type="text"
                name="product_sku"
                id=""
                placeholder="XYZ-267-QYT"
                className="cat-input"
                onChange={handleChange}
                // value={product_sku}
              />
            </div>
          </Col>
          <Col>
            <div>
              <label htmlFor="category" className="cat-label">
                Product Category
              </label>
            </div>
            <div>
              <select name="category" id="">
                <option selected value="">
                  Select
                </option>
                <option value="bird_spikes">Bird Spikes</option>
                <option value="bird_spikes">Bird Spikes</option>
                <option value="bird_spikes">Bird Spikes</option>
              </select>
            </div>
          </Col>
        </Row>
        <div className="mt-3">
          <div>
            <label htmlFor="title" className="product-label">
              Product Title
            </label>
          </div>
          <input
            type="text"
            name="title"
            id=""
            placeholder="XYZ Pack of 1 with Offer"
            onChange={handleChange}
            // value={title}
          />
        </div>
        <Row className="mt-3">
          <Col>
            <div>
              <label htmlFor="image" className="product-label">
                Product Image
              </label>
            </div>
            <div style={{ cursor: "pointer" }}>
              <p className="image-label">
                <label>
                  <ImUpload />
                  {"  "}
                  Upload Your Image Here
                  <input
                    type="file"
                    name="image"
                    className="img-input"
                    onChange={handleChange}
                    accept="image/*"
                  />
                </label>
              </p>
            </div>
          </Col>
          <Col>
            <div>
              <label htmlFor="price" className="product-label">
                Price
              </label>
            </div>
            <div>
              <input
                type="text"
                name="price"
                id=""
                inputMode="decimal"
                onChange={handleChange}
                // value={price}
              />
            </div>
          </Col>
          <Col>
            <div>
              <label htmlFor="max_price" className="product-label">
                Maximum Price (MRP)
              </label>
            </div>
            <div>
              <input
                type="text"
                name="max_price"
                id=""
                inputMode="decimal"
                onChange={handleChange}
                // value={max_price}
              />
            </div>
          </Col>
        </Row>
        <hr />
        <Dropzone
          getUploadParams={getUploadParams}
          onChangeStatus={handleChangeStatus}
          onSubmit={handleSubmit}
          accept="image/*,audio/*,video/*"
        />
        <hr />
        {btnLoad ? (
          <Spinner animation="border" role="status"></Spinner>
        ) : (
          <button type="submit" className="form-submit mt-2">
            Continue
          </button>
        )}
      </form>
    </>
  );
};

const Step2 = ({
  nextStep,
  prevStep,
  handleChange,
  bullet_one,
  bullet_two,
  bullet_three,
  bullet_four,
  bullet_five,
}) => {
  const [validateClass, setValidateClass] = useState("");

  //   const validate = () => {
  //     if (address === "" || city === "" || state === "" || postCode === "") {
  //       return false;
  //     } else {
  //       return true;
  //     }
  //   };
  const handleNext = (event) => {
    event.preventDefault();
    // if (!validate()) {
    //   setValidateClass("input-error animate__animated animate__shakeX");
    //   setTimeout(() => {
    //     setValidateClass("input-error");
    //   }, 2000);
    //   return;
    // } else {
    //   setValidateClass("");
    // }
    nextStep();
  };
  //   const classNames = `shadow-none ${validateClass}`;
  const handlePrev = (event) => {
    event.preventDefault();
    prevStep();
  };

  return (
    <>
      <form onSubmit={handleNext}>
        <div>
          <label className="product-label">
            Bullet Point One
            <input
              type="text"
              name="bullet_one"
              id=""
              onChange={handleChange}
              // value={bullet_one}
            />
          </label>
        </div>
        <div>
          <label className="product-label">
            Bullet Point Two
            <input
              type="text"
              name="bullet_two"
              id=""
              onChange={handleChange}
              // value={bullet_two}
            />
          </label>
        </div>
        <div>
          <label className="product-label">
            Bullet Point Three
            <input
              type="text"
              name="bullet_three"
              id=""
              onChange={handleChange}
              // value={bullet_three}
            />
          </label>
        </div>
        <div>
          <label className="product-label">
            Bullet Point Four
            <input
              type="text"
              name="bullet_four"
              id=""
              onChange={handleChange}
              // value={bullet_four}
            />
          </label>
        </div>
        <div>
          <label className="product-label">
            Bullet Point Five
            <input
              type="text"
              name="bullet_five"
              id=""
              onChange={handleChange}
              // value={bullet_five}
            />
          </label>
        </div>
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
      </form>
    </>
  );
};

const Step3 = ({ prevStep, short_desc, long_desc, handleChange }) => {
  const handlePrev = (event) => {
    event.preventDefault();
    prevStep();
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    alert("submitted" + long_desc);
    // alert("Submitted " + name);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="product-label">
            Short Description
            <input
              type="text"
              name="short_desc"
              id=""
              onChange={handleChange}
              // value={short_desc}
            />
          </label>
        </div>
        <div>
          <label className="product-label">
            Long Description
            <textarea
              name="long_desc"
              id=""
              className="cat-input"
              cols="30"
              rows="10"
              onChange={handleChange}
              // value={long_desc}
            ></textarea>
          </label>
        </div>
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
  // const [formData, setFormData] = useState({
  //   product_sku: "",
  //   category: "",
  //   title: "",
  //   price: "",
  //   max_price: "",
  //   short_desc: "",
  //   long_desc: "",
  //   image: [],
  //   bullet_one: "",
  //   bullet_two: "",
  //   bullet_three: "",
  //   bullet_four: "",
  //   bullet_five: "",
  //   isBest: true,
  //   inStock: true,
  // });

  const [formData, setFormData] = useState(new FormData());

  const handleChange = (event) => {
    // const file = event.target.files[0];
    // console.log(file);
    // setFormData({
    //   ...formData,
    //   [event.target.name]: event.target.value,
    //   // image: file,
    // });
    // console.log(formData);
    // // console.log(formData.image);

    const target = event.target;
    const name = target.name;
    const value = target.value;
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleFile = (event) => {
    const myFile = event.target.files[0];
    console.log(myFile);
  };

  return (
    <>
      <Container className="mt-2">
        <div className="shadow rounded checkout-form p-4">
          {step === 1 && (
            <div>
              {/* <ProgressBar step={step} /> */}
              <hr />
              <Step1
                nextStep={nextStep}
                handleChange={handleChange}
                product_sku={formData.product_sku}
                title={formData.title}
                max_price={FormData.max_price}
                price={formData.price}
                handleFile={handleFile}
              />
            </div>
          )}
          {step === 2 && (
            <div>
              {/* <ProgressBar step={step} /> */}
              <hr />
              <Step2
                nextStep={nextStep}
                prevStep={prevStep}
                handleChange={handleChange}
                bullet_one={formData.bullet_one}
                bullet_two={formData.bullet_two}
                bullet_three={formData.bullet_three}
                bullet_four={formData.bullet_four}
                bullet_five={formData.bullet_five}
              />
            </div>
          )}
          {step === 3 && (
            <div>
              {/* <ProgressBar step={step} /> */}
              <hr />
              <Step3
                prevStep={prevStep}
                handleChange={handleChange}
                short_desc={formData.short_desc}
                long_desc={formData.long_desc}
              />
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
