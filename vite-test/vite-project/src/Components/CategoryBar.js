import React, { useEffect, useState } from "react";
import "../Assets/CSS/CategoryBar.css";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { AiOutlineRight } from "react-icons/ai";
import { Link } from "react-router-dom";
import axios from "axios";

export default function CategoryBar() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get("uploadCategory/").then((response) => {
      setCategories(response.data);
    });
  }, []);

  return (
    <>
      <div className="cat-bar-full w-100">
        <div className="container mx-auto">
          <div className="w-100 h-100 item-container container">
            <div className="items-center d-flex justify-content-between">
              <div className=" d-flex cat-and-drop">
                <div className="dropdown">
                  <button
                    className="drop-btn dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span>
                      <HiOutlineMenuAlt1 />
                    </span>
                    {"               "}
                    <span> All categories</span>
                  </button>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    {categories.map((category) => (
                      <li key={category.id} value={category.id}>
                        <Link
                          className="dropdown-item"
                          to={`/category/${category.category_name.replace(
                            /\s+/g,
                            ""
                          )}`}
                        >
                          {category.category_name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="nav">
                  <ul className="d-flex nav-wrapper">
                    <li>
                      <Link to="/" className="cat-bar-link">
                        Home
                      </Link>
                    </li>
                    <li>
                      {" "}
                      <Link to="/products" className="cat-bar-link">
                        Products
                      </Link>
                    </li>
                    <li>
                      {" "}
                      <Link to="/gallery" className="cat-bar-link">
                        Gallery
                      </Link>
                    </li>
                    <li>
                      {" "}
                      <Link to="/blogs" className="cat-bar-link">
                        Blogs
                      </Link>
                    </li>
                    <li>
                      {" "}
                      <Link to="/about" className="cat-bar-link">
                        About
                      </Link>
                    </li>
                    <li>
                      {" "}
                      <Link to="/contact" className="cat-bar-link">
                        Help
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
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
