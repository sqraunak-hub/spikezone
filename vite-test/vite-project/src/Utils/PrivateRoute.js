import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  let token = localStorage.getItem("token");
  let auth = { token: token };

  return auth.token ? (
    <Outlet />
  ) : (
    <>
      <Navigate to="/signup" replace />
      {console.warn("Please Login First")}
    </>
  );
};

export default PrivateRoutes;
