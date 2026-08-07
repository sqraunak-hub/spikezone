import React, { useState, useEffect } from "react";
import "../Assets/css/dashboard.css";
import { Row, Col, Table } from "react-bootstrap";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_HOST } from "../Utils/appConstant";

import {
  FaShoppingCart,
  FaRupeeSign,
  FaEnvelope,
  FaBoxes,
  FaStar,
  FaArrowRight,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const API = `${API_HOST}/api/user`;
const STATUS_COLORS = {
  pending: "#ff8a00",
  shipped: "#0b66c2",
  delivered: "#1a9e5c",
  cancelled: "#e11d48",
};
const PIE_FALLBACK = ["#1e9dcd", "#ff8a00", "#1a9e5c", "#7c3aed", "#e11d48"];

export function Dashcontent() {
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const auth = { headers: { Authorization: `Bearer ${token}` } };

    axios
      .get(`${API}/orders`, auth)
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.error("Error fetching orders:", err));

    axios
      .get(`${API}/contact/`, auth)
      .then((res) => setMessages(res.data || []))
      .catch((err) => console.error("Error fetching messages:", err));

    axios
      .get(`${API}/products/`)
      .then((res) => setProducts(res.data || []))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // ---- derived stats ----
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (parseFloat(o.total_amount) || 0),
    0
  );
  const totalReviews = products.reduce(
    (sum, p) => sum + (parseFloat(p.average_rating) > 0 ? 1 : 0),
    0
  );

  // revenue by day (last 14 days with orders)
  const revenueByDay = Object.values(
    orders.reduce((acc, o) => {
      if (!o.order_date) return acc;
      const d = new Date(o.order_date);
      const key = d.toISOString().slice(0, 10);
      if (!acc[key])
        acc[key] = {
          key,
          label: d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
          revenue: 0,
          orders: 0,
        };
      acc[key].revenue += parseFloat(o.total_amount) || 0;
      acc[key].orders += 1;
      return acc;
    }, {})
  )
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-14);

  // orders by delivery status
  const statusData = Object.entries(
    orders.reduce((acc, o) => {
      const s = o.delivery_status || "pending";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // products per category
  const categoryData = Object.entries(
    products.reduce((acc, p) => {
      const c = p.category_name || "Other";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
    .slice(0, 5);
  const recentMessages = [...messages].slice(-4).reverse();

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: <FaShoppingCart />,
      cls: "blue",
      to: "/pendingorders",
    },
    {
      label: "Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: <FaRupeeSign />,
      cls: "green",
      to: "/completedorder",
    },
    {
      label: "Products",
      value: products.length,
      icon: <FaBoxes />,
      cls: "purple",
      to: "/product",
    },
    {
      label: "Rated Products",
      value: totalReviews,
      icon: <FaStar />,
      cls: "orange",
      to: "/reviews",
    },
    {
      label: "Messages",
      value: messages.length,
      icon: <FaEnvelope />,
      cls: "red",
      to: "/messages",
    },
  ];

  return (
    <div className="dash-wrap">
      <div className="dash-title-row">
        <div>
          <h2 className="dash-title">Dashboard</h2>
          <p className="dash-sub">
            Welcome back — here&apos;s what&apos;s happening in your store.
          </p>
        </div>
      </div>

      {/* ---- stat cards ---- */}
      <div className="dash-stats">
        {stats.map((s) => (
          <Link to={s.to} key={s.label} className={`dash-stat ${s.cls}`}>
            <span className="dash-stat-icon">{s.icon}</span>
            <div>
              <p>{s.label}</p>
              <h4>{s.value}</h4>
            </div>
            <FaArrowRight className="dash-stat-arrow" />
          </Link>
        ))}
      </div>

      {/* ---- charts row 1 ---- */}
      <Row className="g-3 mt-1">
        <Col lg={8}>
          <div className="dash-card">
            <h6>Revenue Trend</h6>
            {revenueByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueByDay}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e9dcd" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#1e9dcd" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef3f6" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#7b8c96" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#7b8c96" }} />
                  <Tooltip
                    formatter={(v, n) =>
                      n === "revenue" ? [`₹${v}`, "Revenue"] : [v, "Orders"]
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1e9dcd"
                    strokeWidth={2.5}
                    fill="url(#rev)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="dash-empty">No orders yet — revenue will appear here.</div>
            )}
          </div>
        </Col>
        <Col lg={4}>
          <div className="dash-card">
            <h6>Orders by Status</h6>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    isAnimationActive={false}
                  >
                    {statusData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={
                          STATUS_COLORS[entry.name] ||
                          PIE_FALLBACK[i % PIE_FALLBACK.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    iconType="circle"
                    formatter={(v) => (
                      <span style={{ fontSize: 13, color: "#2e3f48" }}>{v}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="dash-empty">No orders yet.</div>
            )}
          </div>
        </Col>
      </Row>

      {/* ---- charts row 2 ---- */}
      <Row className="g-3 mt-1">
        <Col lg={4}>
          <div className="dash-card">
            <h6>Products per Category</h6>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef3f6" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#7b8c96" }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#7b8c96" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1e9dcd" radius={[8, 8, 0, 0]} barSize={38} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="dash-empty">No products yet.</div>
            )}
          </div>
        </Col>

        {/* recent orders */}
        <Col lg={8}>
          <div className="dash-card">
            <div className="dash-card-head">
              <h6>Recent Orders</h6>
              <Link to="/pendingorders" className="dash-link">
                View all <FaArrowRight />
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <Table hover responsive className="dash-table mb-0">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.user_details?.name || "—"}</td>
                      <td>₹{o.total_amount}</td>
                      <td>
                        <span className={`adm-badge ${o.delivery_status}`}>
                          {o.delivery_status}
                        </span>
                      </td>
                      <td>
                        <span className={`adm-badge ${o.payment_status}`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td>
                        {o.order_date
                          ? new Date(o.order_date).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="dash-empty">No orders yet.</div>
            )}
          </div>
        </Col>
      </Row>

      {/* ---- recent messages ---- */}
      <Row className="g-3 mt-1">
        <Col>
          <div className="dash-card">
            <div className="dash-card-head">
              <h6>Recent Messages</h6>
              <Link to="/messages" className="dash-link">
                View all <FaArrowRight />
              </Link>
            </div>
            {recentMessages.length > 0 ? (
              <div className="dash-msgs">
                {recentMessages.map((m, i) => (
                  <div className="dash-msg" key={m.id || i}>
                    <span className="dash-msg-avatar">
                      {(m.name || "?").charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong>{m.name}</strong>
                      <span className="dash-msg-mail">{m.email}</span>
                      <p>{m.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty">No messages yet.</div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default function Dashboard() {
  return <Dashcontent />;
}
