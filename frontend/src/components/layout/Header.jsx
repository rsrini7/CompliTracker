import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-shield-check me-2"></i>
          CompliTracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {currentUser && (
              <>
                <Nav.Link as={Link} to="/dashboard">
                  <i className="bi bi-speedometer2 me-1"></i> Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/compliance">
                  <i className="bi bi-clipboard-check me-1"></i> Compliance
                </Nav.Link>
                <Nav.Link as={Link} to="/documents">
                  <i className="bi bi-file-earmark-text me-1"></i> Documents
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {currentUser ? (
              <NavDropdown 
                title={
                  <span>
                    <i className="bi bi-person-circle me-1"></i>
                    {currentUser.name || currentUser.email}
                  </span>
                } 
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <i className="bi bi-person me-2"></i> Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/notifications">
                  <i className="bi bi-bell me-2"></i> Notifications
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <i className="bi bi-person-plus me-1"></i> Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;