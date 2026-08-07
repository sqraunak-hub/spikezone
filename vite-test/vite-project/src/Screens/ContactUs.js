import React, { useState, useEffect } from "react";
import Form from "../Components/Form";
import Loader from "../Components/Loader";
import SEOHelmet from "../Components/SEOHelmet";

export default function ContactUs() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);
  return (
    <>
      <SEOHelmet />
      {loading ? <Loader /> : <Form />}
    </>
  );
}
