import React from "react";
import "../Assets/CSS/pagetitle.css";
export default function PageTitle(props) {
  return (
    <>
      <div className="main-wrapper">
        <div className="container">
          <div className="title-main">{props.title}</div>
        </div>
      </div>
    </>
  );
}
