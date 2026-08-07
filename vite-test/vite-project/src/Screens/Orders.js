import { useEffect } from "react";
import OrderCard from "../Components/OrderCard";
import PageTitle from "../Components/PageTitle";
import useOrderStore from "../store/userOrderStore";
import useUserStore from "../store/userStore";
import { Col, Row, Spinner } from "react-bootstrap";
import SEOHelmet from "../Components/SEOHelmet";
import "../Assets/CSS/Orders.css";
import {
  Calendar,
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
} from "lucide-react";
const Orders = () => {
  const { orders, loading, error, fetchOrders } = useOrderStore();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [fetchOrders, user]);

  if (!user)
    return (
      <div className="text-center p-4">Please login to view your orders</div>
    );
  if (loading)
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status" className="spinner-border" />
      </div>
    );
  if (error)
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.order_date) - new Date(a.order_date)
  );

  return (
    <>
      <SEOHelmet />
      <PageTitle title="Your Orders" />
      <div className="container mt-5">
        {sortedOrders.length === 0 ? (
          <div className="text-center p-4">
            <h3>No orders found</h3>
            <p>Looks like you haven't placed any orders yet.</p>
          </div>
        ) : (
          <Row className="g-4">
            {sortedOrders.map((order) => (
              <Col lg={6} sm={12} key={order.id}>
                <OrderCard order={order} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </>
  );
};

export default Orders;
