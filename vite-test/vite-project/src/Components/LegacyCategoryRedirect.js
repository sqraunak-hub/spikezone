import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";
import Loader from "./Loader";
import NotFound from "./NotFound";
import { categorySlug, findCategoryBySlug } from "../Utils/slugify";
import { categoryPath } from "../Utils/appConstant";

// Old scheme was /category/<category_name> — with spaces and "&" in the URL.
// Categories now live under /products/<slug>, so send those visitors across
// instead of dropping them on a 404.
export default function LegacyCategoryRedirect() {
  const { categoryName } = useParams();
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    axios
      .get("uploadCategory/")
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  if (categories === null) return <Loader />;

  const match = findCategoryBySlug(categories, categoryName);
  if (!match) return <NotFound />;

  return <Navigate to={categoryPath(categorySlug(match))} replace />;
}
