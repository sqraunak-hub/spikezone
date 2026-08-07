import React, { useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { Container, Row, Col, Button } from "react-bootstrap";
import nmspike from "../Assets/IMG/nmspike.png";
import "../Assets/CSS/cart.css";
import { Link, useNavigate } from "react-router-dom";

export default function CartCard(props) {
  const [cart, setCart] = useState([]);
  const Navigate = useNavigate();
  function addToCart(detailedProduct) {
    const existingItems = localStorage.getItem("cartItems");
    let cart = [];

    if (existingItems) {
      // If cartItems already exists in localStorage, parse it and update the quantity of the existing item or add the new item
      cart = JSON.parse(existingItems);
      const existingItemIndex = cart.findIndex(
        (item) => item.id === detailedProduct.id
      );
      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
      } else {
        cart.push({
          ...detailedProduct,
          quantity: 1,
          productTotal: detailedProduct.price,
        });
      }
    } else {
      // If cartItems doesn't exist in localStorage, create a new array with the current item and a quantity of 1
      cart = [
        {
          ...detailedProduct,
          quantity: 1,
          productTotal: (detailedProduct.quantity + 1) * detailedProduct.price,
        },
      ];
    }

    localStorage.setItem("cartItems", JSON.stringify(cart));
    props.updateCartItem(cart);
  }

  function removeQuantity(detailedProduct) {
    const existingItems = localStorage.getItem("cartItems");
    let cart = [];

    if (existingItems) {
      cart = JSON.parse(existingItems);
      const existingItemIndex = cart.findIndex(
        (item) => item.id === detailedProduct.id
      );
      if (existingItemIndex > -1) {
        if (cart[existingItemIndex].quantity === 1) {
          cart = cart.filter((item) => item.id !== detailedProduct.id);
        } else {
          cart[existingItemIndex].quantity -= 1;
        }
      }
      localStorage.setItem("cartItems", JSON.stringify(cart));
      props.updateCartItem(cart);
    }
  }

  // function removeQuantity(products) {
  //   const cartItems = Cookies.get("cartItems");
  //   if (cartItems) {
  //     const parsedCart = JSON.parse(cartItems);
  //     console.log(parsedCart);
  //     const productToRemove = parsedCart.find(
  //       (item) => item.id === products.id
  //     );
  //     if (productToRemove) {
  //       if (productToRemove.quantity > 1) {
  //         const updatedItem = parsedCart.map((item) => {
  //           if (item.id == products.id) {
  //             return {
  //               ...item,
  //               quantity: item.quantity - 1,
  //               productTotal: (item.quantity - 1) * item.price,
  //             };
  //           } else if (productToRemove.quantity == 1) {
  //             Cookies.remove("cartItems");
  //           } else {
  //             return item;
  //           }
  //         });
  //         Cookies.set("cartItems", JSON.stringify(updatedItem));
  //         setCart(updatedItem);
  //         // props.onUpdateCart(updatedItem);
  //         props.updateCartItem(updatedItem);
  //       } else {
  //         const updatedItem = parsedCart.filter(
  //           (item) => item.id !== products.id
  //         );
  //         Cookies.set("cartItems", JSON.stringify(updatedItem));
  //         setCart(updatedItem);
  //         // props.onUpdateCart(updatedItem);
  //         props.updateCartItem(updatedItem);
  //       }
  //     }
  //   }
  // }

  const handleNavigate = () => {
    Navigate(`/products/${props.id}`);
  };

  return (
    <>
      <Container>
        <Row className="cart-card">
          <Col xs={4} md={3}>
            <img src={props.image} alt="img" style={{ width: "100%" }} />
          </Col>
          <Col xs={5} style={{ textAlign: "start" }}>
            <h4>
              <button
                className="cart-title"
                onClick={() => handleNavigate(props.id)}
              >
                {props.title}
              </button>
            </h4>
            <p className="disabled-p">Sold By: SpikeZone S.K Enterprises</p>
            <p className="cart-p">Price: Rs.{props.price}/-</p>
            <Row xs={4} md={4}>
              <Col md={1}>
                <Button onClick={() => removeQuantity(props.detailedProduct)}>
                  -
                </Button>
              </Col>
              <Col md={5} style={{ textAlign: "center" }}>
                <p className="cart-p">Quantity: {props.quantity}</p>
              </Col>
              <Col md={1}>
                <Button onClick={() => addToCart(props.detailedProduct)}>
                  +
                </Button>
              </Col>
            </Row>
            <span className="mt-5">
              <Button
                className="cart-danger shadow-0 outline-0 mt-2"
                onClick={() => removeQuantity(props.detailedProduct)}
              >
                Delete
              </Button>
            </span>
          </Col>
          <Col style={{ textAlign: "start" }}>
            <p className="card-total">
              Total Price: {props.quantity * props.price}
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
}
