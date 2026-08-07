import {
  Sidebar,
  SubMenu,
  Menu,
  MenuItem,
  useProSidebar,
} from "react-pro-sidebar";
import {
  FaBoxes,
  FaTachometerAlt,
  FaHistory,
  FaImages,
  FaStar,
  FaBlog,
  FaTags,
} from "react-icons/fa";
import { HiClipboardList } from "react-icons/hi";
import { MdCategory } from "react-icons/md";
import {
  AiFillMessage,
  AiFillRightCircle,
  AiFillLeftCircle,
} from "react-icons/ai";
import { useLocation } from "react-router-dom";
import "../Assets/css/sidenav.css";
import { Link } from "react-router-dom";

export default function Sidenav({ maincontent }) {
  const { collapseSidebar, collapsed } = useProSidebar();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar className="adm-sidebar" backgroundColor="#043141">
        <div className="adm-side-top">
          {!collapsed && <span className="adm-side-title">SpikeZone</span>}
          <button
            className="sidebar-collapse"
            onClick={() => collapseSidebar()}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <AiFillRightCircle /> : <AiFillLeftCircle />}
          </button>
        </div>

        <Menu>
          {!collapsed && <h5 className="sidebar-menu-head">General</h5>}
          <MenuItem
            active={isActive("/")}
            component={<Link to="/" />}
            icon={<FaTachometerAlt />}
          >
            Dashboard
          </MenuItem>
        </Menu>

        <Menu>
          {!collapsed && <h5 className="sidebar-menu-head">Orders</h5>}
          <MenuItem
            active={isActive("/pendingorders")}
            icon={<HiClipboardList />}
            component={<Link to="/pendingorders" />}
          >
            Pending Orders
          </MenuItem>
          <MenuItem
            active={isActive("/completedorder")}
            icon={<FaHistory />}
            component={<Link to="/completedorder" />}
          >
            Completed Orders
          </MenuItem>
        </Menu>

        <Menu>
          {!collapsed && <h5 className="sidebar-menu-head">Catalogue</h5>}
          <MenuItem
            active={isActive("/categories")}
            icon={<MdCategory />}
            component={<Link to="/categories" />}
          >
            Categories
          </MenuItem>
          <MenuItem
            active={isActive("/product")}
            icon={<FaBoxes />}
            component={<Link to="/product" />}
          >
            Products
          </MenuItem>
          <MenuItem
            active={isActive("/reviews")}
            icon={<FaStar />}
            component={<Link to="/reviews" />}
          >
            Reviews
          </MenuItem>
        </Menu>

        <Menu>
          {!collapsed && <h5 className="sidebar-menu-head">Content</h5>}
          <SubMenu icon={<FaBlog />} label="Blogs">
            <MenuItem
              active={isActive("/blogs")}
              component={<Link to="/blogs" />}
            >
              Add Blog
            </MenuItem>
            <MenuItem
              active={isActive("/blogList")}
              component={<Link to="/blogList" />}
            >
              All Blogs
            </MenuItem>
          </SubMenu>
          <MenuItem
            active={isActive("/gallery")}
            icon={<FaImages />}
            component={<Link to="/gallery" />}
          >
            Gallery
          </MenuItem>
          <MenuItem
            active={isActive("/metatags")}
            icon={<FaTags />}
            component={<Link to="/metatags" />}
          >
            SEO / Meta Tags
          </MenuItem>
        </Menu>

        <Menu>
          {!collapsed && <h5 className="sidebar-menu-head">Support</h5>}
          <MenuItem
            active={isActive("/messages")}
            component={<Link to="/messages" />}
            icon={<AiFillMessage />}
          >
            Messages
          </MenuItem>
        </Menu>
      </Sidebar>
      <main className="main-content">{maincontent}</main>
    </div>
  );
}
