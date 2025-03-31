import React, { useContext } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  
  // Don't render sidebar for unauthenticated users or login/register pages
  if (!currentUser || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Determine active section based on current path
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="sidebar bg-light p-3" style={{ minWidth: '250px', height: '100%' }}>
      <h5 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-3">
        <span>Navigation</span>
      </h5>
      <Nav className="flex-column">
        <Nav.Link as={Link} to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </Nav.Link>
        
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
          <span>Compliance</span>
        </h6>
        <Nav.Link as={Link} to="/compliance" className={isActive('/compliance') && !location.pathname.includes('/create') ? 'active' : ''}>
          <i className="bi bi-list-check me-2"></i>
          All Items
        </Nav.Link>
        <Nav.Link as={Link} to="/compliance/create" className={location.pathname === '/compliance/create' ? 'active' : ''}>
          <i className="bi bi-plus-circle me-2"></i>
          Add New
        </Nav.Link>
        <Nav.Link as={Link} to="/compliance/calendar" className={location.pathname === '/compliance/calendar' ? 'active' : ''}>
          <i className="bi bi-calendar-event me-2"></i>
          Calendar View
        </Nav.Link>
        
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
          <span>Documents</span>
        </h6>
        <Nav.Link as={Link} to="/documents" className={isActive('/documents') && !location.pathname.includes('/upload') ? 'active' : ''}>
          <i className="bi bi-file-earmark me-2"></i>
          All Documents
        </Nav.Link>
        <Nav.Link as={Link} to="/documents/upload" className={location.pathname === '/documents/upload' ? 'active' : ''}>
          <i className="bi bi-cloud-upload me-2"></i>
          Upload New
        </Nav.Link>
        
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
          <span>Settings</span>
        </h6>
        <Nav.Link as={Link} to="/profile" className={isActive('/profile') ? 'active' : ''}>
          <i className="bi bi-person me-2"></i>
          Profile
        </Nav.Link>
        <Nav.Link as={Link} to="/notifications/settings" className={location.pathname === '/notifications/settings' ? 'active' : ''}>
          <i className="bi bi-bell me-2"></i>
          Notification Settings
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;