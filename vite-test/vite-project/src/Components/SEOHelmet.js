import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { API_HOST } from "../Utils/appConstant";

const SEOHelmet = () => {
  const [meta, setMeta] = useState(null);
  const location = useLocation();

  // Slug without leading /
  const slug = location.pathname.replace(/^\/+/, "") || "home";

  useEffect(() => {
    fetch(`${API_HOST}/seo-json/seo.json`)
      .then((res) => res.json())
      .then((data) => {
        setMeta(data[slug] || data["home"]);
      });
  }, [slug]);

  if (!meta) return null;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={meta.canonical_url} />

      {/* Open Graph */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.og_image} />
      <meta property="og:url" content={meta.canonical_url} />

      {/* Twitter Card */}
      <meta name="twitter:card" content={meta.twitter_card} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.og_image} />
    </Helmet>
  );
};

export default SEOHelmet;
