// components/Loader.jsx
import React from "react";
import { Spinner } from "react-bootstrap"; // or use a custom loader

export default function Loader() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        background: "rgba(255,255,255,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <Spinner animation="border" variant="primary" />
    </div>
  );
}
