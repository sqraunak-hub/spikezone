import React, { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import "../Assets/CSS/account.css";
import { Link } from "react-router-dom";
import { FaBox } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlinePayments } from "react-icons/md";
import useUserStore from "../store/userStore";
import PageTitle from "../Components/PageTitle";
import SEOHelmet from "../Components/SEOHelmet";
function AccountCard(props) {
  return (
    <div>
      <Link to={props.cardLink} className="account-card-link">
        <Container fluid className="account-card">
          <Row className="account-card-row">
            <Col xs={6} md={1} className="card-col manage-card-icon">
              <span>{props.cardIcon}</span>
            </Col>
            <Col>
              <div className="sub-head" style={{ textAlign: "start" }}>
                <h4>{props.cardName}</h4>
                <span>{props.cardDesc}</span>
              </div>
            </Col>
          </Row>
        </Container>
      </Link>
    </div>
  );
}

export default function Account() {
  const fetchUserProfile = useUserStore((state) => state.fetchUserProfile);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);
  return (
    <>
      <SEOHelmet />
      {/* <div className="container account-head">
        Welcome Back, {user ? user.name : "user"}
      </div> */}
      <PageTitle
        title={user ? "Welcome Back, " + user.name : "Welcome Back user"}
      />
      <Container className="mt-5">
        <Row xs={1} sm={2} md={2} lg={2} className="g-4">
          <Col className="card-col">
            <AccountCard
              cardName="Manage Account"
              cardDesc="Update/Change your account details, Emails, Passwords etc."
              cardLink="/account/manage-account"
              cardIcon={<IoIosLock />}
            />
          </Col>
          <Col className="card-col">
            <AccountCard
              cardName="Manage Orders"
              cardDesc="Track and manage orders here"
              cardIcon={<FaBox />}
              cardLink="/orders"
            />
          </Col>
          <Col className="card-col">
            <AccountCard
              cardName="Manage Address"
              cardDesc="Add, Remove, Update addresses here"
              cardLink="/account/manage-address"
              cardIcon={<FaLocationDot />}
            />
          </Col>
          <Col className="card-col">
            <AccountCard
              cardName="Manage Payment Methods"
              cardDesc="Update your payment methods"
              cardLink="/account/manage-payment-methods"
              cardIcon={<MdOutlinePayments />}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}
