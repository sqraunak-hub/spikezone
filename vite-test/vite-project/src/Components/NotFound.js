import React from "react";
import notfound from "../Assets/IMG/notfound.png";
import { Container } from "react-bootstrap";

const NotFound = () => {
  return (
    <div
      className="flex flex-col items-center justify-center h-screen text-center container-fluid"
      style={{ marginBottom: "10rem" }}
    >
      <h1 className="text-5xl font-bold text-red-500"></h1>

      <Container>
        <img
          src={notfound}
          alt="Page Not Found"
          className="mt-6"
          style={{ width: "40%" }}
        />
      </Container>
      <p className="text-xl mt-4">
        Oops! The page you're looking for is broken or temporary unavailable.
      </p>
      <a href="/" className="mt-6 px-4 py-2 bg-blue-500 text rounded">
        Go to Home
      </a>
    </div>
  );
};

export default NotFound;
