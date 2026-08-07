import React, { useState, useEffect } from "react";
import HomeSlider from "../Components/HomeSlider";
import BestSellers from "../Components/BestSellers";
import CategoryPanel from "../Components/CategoryPanel";
import ProductShowcase from "../Components/ProductShowcase";
import WhyUs from "../Components/WhyUs";
import HomeCta from "../Components/HomeCta";
import Clients from "../Components/Clients";
import FaqComp from "../Components/FaqComp";
import Loader from "../Components/Loader";
import SEOHelmet from "../Components/SEOHelmet";

function Home() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <SEOHelmet />
      {loading ? (
        <Loader />
      ) : (
        <div>
          <HomeSlider />
          <CategoryPanel />
          <BestSellers />
          <WhyUs />
          <ProductShowcase />
          <Clients />
          <HomeCta />
          <FaqComp />
        </div>
      )}
    </>
  );
}

export default Home;
