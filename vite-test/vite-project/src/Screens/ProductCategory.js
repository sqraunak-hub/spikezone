import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import PageTitle from "../Components/PageTitle";

export default function ProductCategory() {
  const { categoryName } = useParams(); // from URL
  const [productsAll, setProductsAll] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [realCategoryName, setRealCategoryName] = useState("");

  const normalize = (text) => text?.toLowerCase().replace(/\s+/g, "");

  useEffect(() => {
    axios.get("products/").then((response) => {
      setProductsAll(response.data);
    });
  }, []);

  useEffect(() => {
    if (productsAll.length > 0) {
      const data = productsAll.filter(
        (product) =>
          normalize(product.category_name) === normalize(categoryName)
      );
      setFilteredProducts(data);

      if (data.length > 0) {
        setRealCategoryName(data[0].category_name);
      } else {
        setRealCategoryName(categoryName);
      }
    }
  }, [productsAll, categoryName]);

  return (
    <>
      <PageTitle title={realCategoryName} />
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Col key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </Row>
    </>
  );
}
