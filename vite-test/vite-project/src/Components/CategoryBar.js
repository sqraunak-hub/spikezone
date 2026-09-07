import React from "react";
import "../Assets/CSS/CategoryBar.css";
import {
  FaHouse,
  FaTag,
  FaDove,
  FaBorderAll,
  FaCircleQuestion,
  FaPaperPlane,
} from "react-icons/fa6";
import { GiMonkey } from "react-icons/gi";
import { Link } from "react-router-dom";
import NavMegaMenu from "./NavMegaMenu";
import { FAMILIES } from "../Utils/productFamilies";

const FAMILY_ICONS = {
  "bird-spikes": <FaDove />,
  "monkey-spikes": <GiMonkey />,
  "anti-bird-net": <FaBorderAll />,
};

/**
 * The "All categories" dropdown that used to open this bar is gone: it cost
 * 194px of a 1116px row and forced the nav onto a second line, and its three
 * categories are already listed on /products and in the footer.
 */
export default function CategoryBar() {

  return (
    <>
      <div className="cat-bar-full w-100">
        <div className="container mx-auto">
          <div className="w-100 h-100 item-container container">
            <div className="items-center d-flex justify-content-between">
              <div className=" d-flex cat-and-drop">
                <div className="nav">
                  <ul className="d-flex nav-wrapper">
                    <li>
                      <Link to="/" className="cat-bar-link">
                        <span className="cat-bar-ico" aria-hidden="true">
                          <FaHouse />
                        </span>
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link to="/products" className="cat-bar-link">
                        <span className="cat-bar-ico" aria-hidden="true">
                          <FaTag />
                        </span>
                        Products
                      </Link>
                    </li>
                    {/* One item per product family; each dropdown carries the
                        same four columns (Bird Control / Solution /
                        Application / Location). */}
                    {FAMILIES.map((f) => (
                      <li key={f.id}>
                        <NavMegaMenu family={f} icon={FAMILY_ICONS[f.id]} />
                      </li>
                    ))}
                    <li>
                      <Link to="/about" className="cat-bar-link">
                        <span className="cat-bar-ico" aria-hidden="true">
                          <FaCircleQuestion />
                        </span>
                        FAQs
                      </Link>
                    </li>
                    <li>
                      <Link to="/blogs" className="cat-bar-link">
                        Blogs
                      </Link>
                    </li>
                    <li>
                      <Link to="/gallery" className="cat-bar-link">
                        Gallery
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <Link to="/contact" className="cat-bar-quote">
                <FaPaperPlane />
                Get Free Quote
              </Link>
              {/* <div>
                <button className="seller-btn">
                  Become a Seller <AiOutlineRight />{" "}
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
