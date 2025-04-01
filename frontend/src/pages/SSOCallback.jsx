import React from "react";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const SSOCallback = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <i
                  className="bi bi-x-circle text-danger"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h3 className="mt-3">SSO Functionality Removed</h3>
              </div>

              <Alert variant="info">
                Single Sign-On functionality has been removed from this
                application.
              </Alert>

              <div className="text-center mt-4">
                <Link to="/login" className="btn btn-primary">
                  Back to Login
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SSOCallback;
