import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0">&copy; {currentYear} CompliTracker. All rights reserved.</p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <Link to="/privacy" className="text-decoration-none text-muted">Privacy Policy</Link>
              </li>
              <li className="list-inline-item ms-3">
                <Link to="/terms" className="text-decoration-none text-muted">Terms of Service</Link>
              </li>
              <li className="list-inline-item ms-3">
                <Link to="/contact" className="text-decoration-none text-muted">Contact Us</Link>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;