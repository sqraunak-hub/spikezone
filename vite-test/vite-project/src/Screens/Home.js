import React, { useState, useEffect, lazy, Suspense } from "react";
import HomeHero from "../Components/HomeHero";
import HomeCategories from "../Components/HomeCategories";
import CategoryPanel from "../Components/CategoryPanel";
const BestSellers = lazy(() => import("../Components/BestSellers"));
import HomeUseCases from "../Components/HomeUseCases";
import WhyUs from "../Components/WhyUs";
import ProductShowcase from "../Components/ProductShowcase";
import HomeCta from "../Components/HomeCta";
const Clients = lazy(() => import("../Components/Clients"));
const FaqComp = lazy(() => import("../Components/FaqComp"));
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
          <HomeHero />
          <HomeCategories />
          <CategoryPanel />
          <Suspense fallback={null}>
            <BestSellers />
          </Suspense>
          <HomeUseCases />
          <WhyUs />
          <ProductShowcase />
          <Suspense fallback={null}>
            <Clients />
          </Suspense>
          <HomeCta />
          <Suspense fallback={null}>
            <FaqComp />
          </Suspense>
        </div>
      )}
    </>
  );
}

export default Home;
