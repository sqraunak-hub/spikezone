import React from "react";
import "../Assets/CSS/pagetitle.css";

/**
 * The page's main heading band.
 *
 * This used to render a bare <div>, which is why /products, /blogs and
 * /gallery reached Google with no <h1> at all. It is an h1 by default now;
 * the handful of screens that already render their own h1 pass as="h2" so a
 * page never ends up with two.
 */
export default function PageTitle({ title, as: Tag = "h1" }) {
  return (
    <div className="main-wrapper">
      <div className="container">
        <Tag className="title-main">{title}</Tag>
      </div>
    </div>
  );
}
