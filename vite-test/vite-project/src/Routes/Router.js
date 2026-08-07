import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import Header from "../Components/Header";
import Home from "../Screens/Home";
import About from "../Screens/About";
import Products from "../Screens/Products";
import Gallery from "../Screens/Gallery";
import Footer from "../Components/Footer";
import ProductModal from "../Components/ProductModal";
import ContactUs from "../Screens/ContactUs";
import SignUp from "../Screens/SignUp";
import Loader from "../Components/Loader";
import AddToCart from "../Screens/AddToCart";
import PrivateRoutes from "../Utils/PrivateRoute";
import Account from "../Screens/Account";
import Cart from "../Screens/Cart";
import Checkout from "../Screens/Checkout";
import ProductDetail from "../Screens/ProductDetail";
import CategoryBar from "../Components/CategoryBar";
import MobileHeader from "../Components/MobileHeader";
import ProductCategory from "../Screens/ProductCategory";
import Orders from "../Screens/Orders";
import ManageAddress from "../Screens/ManageAddress";
import AddReview from "../Screens/AddReview";
import OrderDetail from "../Screens/OrderDetail";
import Blogs from "../Screens/Blogs";
import BlogDetail from "../Screens/BlogDetail";
import Wishlist from "../Screens/Wishlist";
import PrivacyPolicy from "../Screens/PrivacyPolicy";
import TermsAndCondition from "../Screens/TermsAndCondition";
import ReturnRefundPolicy from "../Screens/ReturnRefund";
import NotFound from "../Components/NotFound";
import ReviewsPage from "../Screens/ReviewsPage";
import InfoHeader from "../Components/InfoHeader";
import InfoHeaderMobile from "../Components/InfoHeaderMobile";

function MainRoutes() {
  return (
    <>
      <Outlet />
    </>
  );
}

function LayoutWithLoader() {
  const location = useLocation();
  const isMobile = window.innerWidth <= 768;
  const [loading, setLoading] = useState(true);
  const [delayedRender, setDelayedRender] = useState(false);

  useEffect(() => {
    setLoading(true);
    setDelayedRender(false);

    const timeout = setTimeout(() => {
      setLoading(false);
      setDelayedRender(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <>
          {isMobile ? <InfoHeaderMobile /> : <InfoHeader />}
          {isMobile ? <MobileHeader /> : <Header />}
          {!isMobile && <CategoryBar />}
          {delayedRender && <MainRoutes />}
          <Footer />
        </>
      )}
    </>
  );
}

function Router() {
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const exp = decoded.exp * 1000;
          const now = Date.now();

          if (exp < now) {
            logout();
          } else {
            setTimeout(() => logout(), exp - now);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          logout();
        }
      }
    };

    const logout = () => {
      localStorage.removeItem("token");
      toast.info("Session expired. You have been logged out.");
      window.location.href = "/signup";
    };

    checkToken();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/loader" element={<Loader />} />
        <Route path="/" element={<LayoutWithLoader />}>
          <Route element={<PrivateRoutes />}>
            <Route path="/account" element={<Account />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/my-reviews" element={<ReviewsPage />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/account/manage-address" element={<ManageAddress />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/order-detail/:encryptedId"
              element={<OrderDetail />}
            />
            <Route
              path="/add-review/:orderId/:productId"
              element={<AddReview />}
            />
          </Route>

          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/search" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/modal" element={<ProductModal />} />
          <Route path="/addtocart" element={<AddToCart />} />
          <Route path="/category/:categoryName" element={<ProductCategory />} />
          <Route path="/privacy-policy/" element={<PrivacyPolicy />} />
          <Route path="/terms/" element={<TermsAndCondition />} />
          <Route path="/return-policy/" element={<ReturnRefundPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
