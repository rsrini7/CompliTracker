import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Don't render sidebar for unauthenticated users or login/register pages
  if (
    !currentUser ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  // Determine active section based on current path
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div
      className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      <div className="d-lg-none p-3 text-end">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={toggleSidebar}
        >
          <i className="bi bi-x"></i>
        </button>
      </div>

      <div className="p-3">
        <h5 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-3">
          <span>Navigation</span>
        </h5>
        <Nav className="flex-column">
          <Nav.Link
            as={Link}
            to="/dashboard"
            className={isActive("/dashboard") ? "active" : ""}
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </Nav.Link>

          <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-body-secondary">
            <span>Compliance</span>
          </h6>
          <Nav.Link
            as={Link}
            to="/compliance"
            className={
              isActive("/compliance") && !location.pathname.includes("/create")
                ? "active"
                : ""
            }
          >
            <i className="bi bi-check2-square me-2"></i>
            All Compliance Items
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/compliance/create"
            className={
              location.pathname === "/compliance/create" ? "active" : ""
            }
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add New Item
          </Nav.Link>

          <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-body-secondary">
            <span>Documents</span>
          </h6>
          <Nav.Link
            as={Link}
            to="/documents"
            className={
              isActive("/documents") && !location.pathname.includes("/upload")
                ? "active"
                : ""
            }
          >
            <i className="bi bi-file-earmark me-2"></i>
            All Documents
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/documents/upload"
            className={
              location.pathname === "/documents/upload" ? "active" : ""
            }
          >
            <i className="bi bi-cloud-upload me-2"></i>
            Upload New
          </Nav.Link>

          <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-body-secondary">
            <span>Risk Analysis</span>
          </h6>
          <Nav.Link
            as={Link}
            to="/risk-analysis"
            className={location.pathname === "/risk-analysis" ? "active" : ""}
          >
            <i className="bi bi-graph-up me-2"></i>
            Risk Dashboard
          </Nav.Link>

          <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-body-secondary">
            <span>Settings</span>
          </h6>
          <Nav.Link
            as={Link}
            to="/profile"
            className={location.pathname === "/profile" ? "active" : ""}
          >
            <i className="bi bi-person me-2"></i>
            Profile
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/profile/notification-channels"
            className={
              location.pathname === "/profile/notification-channels"
                ? "active"
                : ""
            }
          >
            <i className="bi bi-bell me-2"></i>
            Notifications
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/profile/calendar-integration"
            className={
              location.pathname === "/profile/calendar-integration"
                ? "active"
                : ""
            }
          >
            <i className="bi bi-calendar-event me-2"></i>
            Calendar
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/profile/signature-integration"
            className={
              location.pathname === "/profile/signature-integration"
                ? "active"
                : ""
            }
          >
            <i className="bi bi-pen me-2"></i>
            Digital Signature
          </Nav.Link>
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
