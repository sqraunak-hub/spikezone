import React, { useState, useEffect, lazy, Suspense } from "react";
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
const About = lazy(() => import("../Screens/About"));
const Products = lazy(() => import("../Screens/Products"));
const Gallery = lazy(() => import("../Screens/Gallery"));
import Footer from "../Components/Footer";
import ProductModal from "../Components/ProductModal";
const ContactUs = lazy(() => import("../Screens/ContactUs"));
const SignUp = lazy(() => import("../Screens/SignUp"));
import Loader from "../Components/Loader";
const AddToCart = lazy(() => import("../Screens/AddToCart"));
import PrivateRoutes from "../Utils/PrivateRoute";
const Account = lazy(() => import("../Screens/Account"));
const Cart = lazy(() => import("../Screens/Cart"));
const Checkout = lazy(() => import("../Screens/Checkout"));
const ProductDetail = lazy(() => import("../Screens/ProductDetail"));
import CategoryBar from "../Components/CategoryBar";
import SiteSchema from "../Components/SiteSchema";
import MobileHeader from "../Components/MobileHeader";
const ProductCategory = lazy(() => import("../Screens/ProductCategory"));
const Orders = lazy(() => import("../Screens/Orders"));
const ManageAddress = lazy(() => import("../Screens/ManageAddress"));
const ManageAccount = lazy(() => import("../Screens/ManageAccount"));
const AddReview = lazy(() => import("../Screens/AddReview"));
const OrderDetail = lazy(() => import("../Screens/OrderDetail"));
const Blogs = lazy(() => import("../Screens/Blogs"));
const BlogDetail = lazy(() => import("../Screens/BlogDetail"));
const Wishlist = lazy(() => import("../Screens/Wishlist"));
const PrivacyPolicy = lazy(() => import("../Screens/PrivacyPolicy"));
const TermsAndCondition = lazy(() => import("../Screens/TermsAndCondition"));
const ReturnRefundPolicy = lazy(() => import("../Screens/ReturnRefund"));
import NotFound from "../Components/NotFound";
const ReviewsPage = lazy(() => import("../Screens/ReviewsPage"));
import InfoHeader from "../Components/InfoHeader";
import InfoHeaderMobile from "../Components/InfoHeaderMobile";
import LegacyCategoryRedirect from "../Components/LegacyCategoryRedirect";
const ContentPage = lazy(() => import("../Screens/ContentPage"));
import WhatsAppButton from "../Components/WhatsAppButton";

function MainRoutes() {
  // One boundary for every lazy screen below.
  return (
    <Suspense fallback={<Loader />}>
      <Outlet />
    </Suspense>
  );
}

/**
 * Tracks a media query and re-renders when it changes.
 *
 * The layout used to read `window.innerWidth <= 768` straight into a const,
 * which is evaluated once and never again. Anyone who resized the window -
 * or rotated a tablet - kept whichever header they happened to load with, so
 * the desktop header ended up squeezed into a phone-width viewport with its
 * top bar clipped and its icon row wrapping under the logo.
 */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    // Re-read on mount: the viewport can change between first render and the
    // effect running (an orientation change during hydration, for instance).
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

function LayoutWithLoader() {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
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
          <WhatsAppButton />
          <SiteSchema />
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
      {/* /signup sits outside LayoutWithLoader, so it is not covered by the
          boundary inside MainRoutes - this one catches it and anything else
          added at the top level. */}
      <Suspense fallback={<Loader />}>
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
            {/* The account hub linked here from day one but the route was
                never declared, so "Manage Account" fell through to the
                404 screen. */}
            <Route path="/account/manage-account" element={<ManageAccount />} />
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
          {/* Static "search" outranks the dynamic segment, so both coexist. */}
          <Route path="/products/:categorySlug" element={<ProductCategory />} />
          <Route
            path="/products/:categorySlug/:productSlug"
            element={<ProductDetail />}
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/blogs" element={<Blogs />} />
          {/* :slug, not :id - BlogDetail reads useParams().slug, and every link
              to this route is built from post.slug. While the API ignored the
              ?slug= filter the mismatch was invisible: the request went out as
              ?slug=undefined, the whole list came back, and the page rendered
              res.data[0] - some blog, just never the one in the URL. */}
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/modal" element={<ProductModal />} />
          <Route path="/addtocart" element={<AddToCart />} />
          <Route
            path="/category/:categoryName"
            element={<LegacyCategoryRedirect />}
          />
          {/* generated content pages — see content-pages/build.py */}
          <Route path="/bird-control/*" element={<ContentPage />} />
          <Route path="/bird-care/*" element={<ContentPage />} />
          <Route path="/solutions/*" element={<ContentPage />} />
          <Route path="/applications/*" element={<ContentPage />} />
          <Route path="/locations/*" element={<ContentPage />} />

          <Route path="/privacy-policy/" element={<PrivacyPolicy />} />
          <Route path="/terms/" element={<TermsAndCondition />} />
          <Route path="/return-policy/" element={<ReturnRefundPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default Router;
