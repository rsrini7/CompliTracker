import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow">
            <Card.Body className="p-5">
              <h1 className="display-1 text-muted mb-4">404</h1>
              <h2 className="mb-4">Page Not Found</h2>
              <p className="lead mb-4">
                The page you are looking for might have been removed, had its name changed,
                or is temporarily unavailable.
              </p>
              <Link to="/dashboard">
                <Button variant="primary" size="lg">
                  <i className="bi bi-house-door me-2"></i>
                  Back to Dashboard
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;