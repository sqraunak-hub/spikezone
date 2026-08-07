import React, { useState } from "react";
import Cart from "./Cart";
import CartProducts from "./CartProducts";

export default function AddToCart() {
  const [cart, setCart] = useState([]);

  function addToCart(product) {
    setCart([...cart, product]);
  }

  return (
    <div>
      <h1>My Online Store</h1>
      <CartProducts
        id="123"
        name="Product 1"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        price={9.99}
        addToCart={addToCart}
      />
      <Cart cart={cart} />
    </div>
  );
}
