import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Table, Modal, Button, Form, Spinner, Badge } from "react-bootstrap";
import axios from "axios";
import { MdInfo, MdSearch, MdRefresh } from "react-icons/md";

import { API_BASE_URL } from "../Utils/appConstant";
import "../Assets/css/users.css";

const PAGE_SIZE = 25;

// Matches CustomUserManager.create_phone_user: anything at this domain was
// generated for a phone-first signup, not typed by the customer.
const isPlaceholderEmail = (email) =>
  Boolean(email) && email.endsWith("@phone.spikezone.in");

const SIGNUP_LABELS = {
  "mobile-otp": { text: "Mobile OTP", bg: "success" },
  "email-otp": { text: "Email OTP", bg: "info" },
  password: { text: "Password", bg: "secondary" },
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fullAddress(user) {
  return [user.address, user.city, user.state, user.postalcode]
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join(", ");
}

export function UsersContent() {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState("-created_at");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE_URL}admin/users/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, ordering, search: search || undefined, page_size: PAGE_SIZE },
      });
      setUsers(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      // 403 here means the signed-in account is not an admin, which is a
      // different problem from the API being down - say which.
      setError(
        err?.response?.status === 403
          ? "Your account does not have admin access to the customer list."
          : "Could not load customers. Please try again."
      );
      setUsers([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, ordering, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced so typing a name does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);
  const firstRow = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRow = Math.min(page * PAGE_SIZE, count);

  return (
    <>
      <Container className="mt-5 shadow cat-container adm-users">
        <div className="adm-users-head">
          <div>
            <h3 className="mb-0">Users</h3>
            <p className="adm-users-sub">
              {count} registered {count === 1 ? "customer" : "customers"}
            </p>
          </div>

          <div className="adm-users-tools">
            <div className="adm-users-search">
              <MdSearch aria-hidden="true" />
              <Form.Control
                type="search"
                placeholder="Search name, email, phone or city"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search customers"
              />
            </div>

            <Form.Select
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value);
                setPage(1);
              }}
              aria-label="Sort customers"
              className="adm-users-sort"
            >
              <option value="-created_at">Newest first</option>
              <option value="created_at">Oldest first</option>
              <option value="name">Name A–Z</option>
              <option value="-name">Name Z–A</option>
              <option value="-orders_count">Most orders</option>
              <option value="-last_order_date">Recently ordered</option>
            </Form.Select>

            <Button variant="outline-secondary" onClick={fetchUsers} title="Refresh">
              <MdRefresh />
            </Button>
          </div>
        </div>
        <hr />

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="adm-users-loading">
            <Spinner animation="border" />
          </div>
        ) : users.length === 0 ? (
          <p className="adm-users-empty">
            {search ? `No customers match “${search}”.` : "No customers yet."}
          </p>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover className="shadow adm-users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>City</th>
                  <th>Signed up via</th>
                  <th>Orders</th>
                  <th>Joined</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => {
                  const method = SIGNUP_LABELS[user.signup_method] || {
                    text: user.signup_method,
                    bg: "secondary",
                  };
                  return (
                    <tr key={user.id}>
                      <td>{firstRow + index}</td>
                      <td>
                        {user.name?.trim() || <span className="adm-users-muted">Not set</span>}
                        {user.is_admin && (
                          <Badge bg="dark" className="ms-2">Admin</Badge>
                        )}
                      </td>
                      <td>
                        {isPlaceholderEmail(user.email) ? (
                          // Never show the generated address as if the customer
                          // had given it - it would look like a real contact.
                          <span className="adm-users-muted">Not provided</span>
                        ) : (
                          user.email
                        )}
                      </td>
                      <td>
                        {user.phone ? (
                          <>
                            {user.phone}{" "}
                            <Badge bg="success" className="adm-users-verified">Verified</Badge>
                          </>
                        ) : (
                          user.contact || <span className="adm-users-muted">—</span>
                        )}
                      </td>
                      <td>{user.city || <span className="adm-users-muted">—</span>}</td>
                      <td>
                        <Badge bg={method.bg}>{method.text}</Badge>
                      </td>
                      <td>{user.orders_count}</td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <Button variant="info" onClick={() => setSelected(user)} title="View details">
                          <span className="d-flex align-items-center">
                            <MdInfo style={{ color: "white" }} />
                          </span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}

        {!loading && count > 0 && (
          <div className="adm-users-pager">
            <span>
              Showing {firstRow}–{lastRow} of {count}
            </span>
            <div className="adm-users-pager-btns">
              <Button
                variant="outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="adm-users-pageno">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Container>

      <Modal show={Boolean(selected)} onHide={() => setSelected(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Customer details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <dl className="adm-users-dl">
              <dt>Name</dt>
              <dd>{selected.name?.trim() || "Not set"}</dd>

              <dt>Email</dt>
              <dd>{isPlaceholderEmail(selected.email) ? "Not provided" : selected.email}</dd>

              <dt>Verified mobile</dt>
              <dd>{selected.phone || "Not verified"}</dd>

              <dt>Contact number</dt>
              <dd>{selected.contact || "—"}</dd>

              <dt>Address</dt>
              <dd>{fullAddress(selected) || "—"}</dd>

              <dt>Signed up via</dt>
              <dd>{(SIGNUP_LABELS[selected.signup_method] || {}).text || selected.signup_method}</dd>

              <dt>Has password</dt>
              <dd>{selected.has_usable_password ? "Yes" : "No (OTP only)"}</dd>

              <dt>Orders</dt>
              <dd>
                {selected.orders_count}
                {selected.last_order_date
                  ? ` (last on ${formatDate(selected.last_order_date)})`
                  : ""}
              </dd>

              <dt>Joined</dt>
              <dd>{formatDate(selected.created_at)}</dd>

              <dt>Last login</dt>
              <dd>{formatDate(selected.last_login)}</dd>

              <dt>Status</dt>
              <dd>{selected.is_active ? "Active" : "Disabled"}</dd>
            </dl>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default function Users() {
  return <UsersContent />;
}
