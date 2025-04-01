import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  ListGroup,
  Tab,
  Nav,
  Spinner,
} from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import complianceService from "../../services/complianceService";

const ComplianceDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [history, setHistory] = useState([]);

  // Fetch compliance item details and history
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get compliance item details
        const response = await complianceService.getComplianceById(token, id);
        setCompliance(response.data);

        // Get compliance history
        const historyResponse = await complianceService.getComplianceHistory(
          token,
          id,
        );
        setHistory(historyResponse.data);
      } catch (err) {
        console.error("Error fetching compliance details:", err);
        setError("Failed to load compliance details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  // Handle compliance item completion
  const handleComplete = async () => {
    try {
      if (!compliance) return;

      await complianceService.markAsComplete(token, id, {
        completionDate: new Date().toISOString(),
        completionNotes: "Marked as complete",
      });

      // Refresh data
      const response = await complianceService.getComplianceById(token, id);
      setCompliance(response.data);
    } catch (err) {
      console.error("Error completing compliance item:", err);
      alert("Failed to mark compliance as complete. Please try again.");
    }
  };

  // Handle compliance item deletion
  const handleDelete = async () => {
    if (
      window.confirm("Are you sure you want to delete this compliance item?")
    ) {
      try {
        await complianceService.deleteCompliance(token, id);
        navigate("/compliance");
      } catch (err) {
        console.error("Error deleting compliance item:", err);
        alert("Failed to delete compliance item. Please try again.");
      }
    }
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "in progress":
        return "primary";
      case "pending":
        return "warning";
      case "overdue":
        return "danger";
      default:
        return "secondary";
    }
  };

  // Get priority badge variant
  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading compliance details...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" as={Link} to="/compliance" className="mt-3">
          Back to Compliance List
        </Button>
      </Container>
    );
  }

  if (!compliance) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Compliance item not found</Alert>
        <Button variant="primary" as={Link} to="/compliance" className="mt-3">
          Back to Compliance List
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">{compliance.title}</h2>
              <div className="d-flex align-items-center">
                <Badge bg={getStatusBadge(compliance.status)} className="me-2">
                  {compliance.status}
                </Badge>
                <Badge bg={getPriorityBadge(compliance.priority)}>
                  {compliance.priority} Priority
                </Badge>
              </div>
            </div>
            <div>
              <Button
                variant="outline-secondary"
                className="me-2"
                as={Link}
                to="/compliance"
              >
                <i className="bi bi-arrow-left me-1"></i>
                Back
              </Button>
              <Button
                variant="outline-primary"
                className="me-2"
                as={Link}
                to={`/compliance/${id}/edit`}
              >
                <i className="bi bi-pencil me-1"></i>
                Edit
              </Button>
              <Button
                variant="primary"
                className="me-2"
                onClick={handleComplete}
                disabled={compliance.status === "Completed"}
              >
                <i className="bi bi-check-circle me-1"></i>
                Mark Complete
              </Button>
              <Button variant="outline-danger" onClick={handleDelete}>
                <i className="bi bi-trash me-1"></i>
                Delete
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <Nav
                variant="tabs"
                className="nav-tabs-custom"
                activeKey={activeTab}
                onSelect={setActiveTab}
              >
                <Nav.Item>
                  <Nav.Link eventKey="details">Details</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="history">History</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="documents">Related Documents</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                <Tab.Pane eventKey="details" active={activeTab === "details"}>
                  <div className="mb-4">
                    <h5 className="mb-3">Description</h5>
                    <p>{compliance.description || "No description provided"}</p>
                  </div>

                  <div className="mb-4">
                    <h5 className="mb-3">Requirements</h5>
                    {compliance.requirements ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: compliance.requirements,
                        }}
                      />
                    ) : (
                      <p className="text-muted">
                        No specific requirements defined.
                      </p>
                    )}
                  </div>

                  <div>
                    <h5 className="mb-3">Additional Information</h5>
                    <Row>
                      <Col md={6} className="mb-3">
                        <strong>Category:</strong>{" "}
                        {compliance.category || "N/A"}
                      </Col>
                      <Col md={6} className="mb-3">
                        <strong>Regulation:</strong>{" "}
                        {compliance.regulation || "N/A"}
                      </Col>
                      <Col md={6} className="mb-3">
                        <strong>Due Date:</strong>{" "}
                        {formatDate(compliance.dueDate)}
                      </Col>
                      <Col md={6} className="mb-3">
                        <strong>Assigned To:</strong>{" "}
                        {compliance.assignedTo?.name || "Unassigned"}
                      </Col>
                      <Col md={6} className="mb-3">
                        <strong>Created By:</strong>{" "}
                        {compliance.createdBy?.name || "System"}
                      </Col>
                      <Col md={6} className="mb-3">
                        <strong>Created On:</strong>{" "}
                        {formatDate(compliance.createdAt)}
                      </Col>
                      {compliance.completedAt && (
                        <Col md={6} className="mb-3">
                          <strong>Completed On:</strong>{" "}
                          {formatDate(compliance.completedAt)}
                        </Col>
                      )}
                    </Row>
                  </div>
                </Tab.Pane>

                <Tab.Pane eventKey="history" active={activeTab === "history"}>
                  {history.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted">
                        No history available for this compliance item
                      </p>
                    </div>
                  ) : (
                    <ListGroup variant="flush">
                      {history.map((item, index) => (
                        <ListGroup.Item key={index} className="py-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{item.action}</h6>
                              <p className="text-muted mb-0 small">
                                {item.description}
                              </p>
                            </div>
                            <div className="text-end">
                              <div className="text-muted small">
                                {formatDate(item.timestamp)}
                              </div>
                              <div className="small">
                                By {item.user?.name || "System"}
                              </div>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Tab.Pane>

                <Tab.Pane
                  eventKey="documents"
                  active={activeTab === "documents"}
                >
                  {compliance.documents?.length > 0 ? (
                    <ListGroup variant="flush">
                      {compliance.documents.map((doc) => (
                        <ListGroup.Item key={doc.id} className="py-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <i
                                className={`bi bi-file-earmark-${doc.fileType === "pdf" ? "pdf" : "text"} text-primary me-3`}
                                style={{ fontSize: "1.5rem" }}
                              ></i>
                              <div>
                                <h6 className="mb-0">
                                  <Link
                                    to={`/documents/${doc.id}`}
                                    className="text-decoration-none"
                                  >
                                    {doc.name}
                                  </Link>
                                </h6>
                                <div className="text-muted small">
                                  Uploaded on {formatDate(doc.createdAt)}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              as={Link}
                              to={`/documents/${doc.id}`}
                            >
                              View
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">
                        No documents attached to this compliance item
                      </p>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        as={Link}
                        to="/documents/upload"
                      >
                        <i className="bi bi-upload me-1"></i>
                        Upload Document
                      </Button>
                    </div>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-3">Compliance Status</h5>
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Status:</span>
                  <Badge
                    bg={getStatusBadge(compliance.status)}
                    className="px-3 py-2"
                  >
                    {compliance.status}
                  </Badge>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Priority:</span>
                  <Badge
                    bg={getPriorityBadge(compliance.priority)}
                    className="px-3 py-2"
                  >
                    {compliance.priority}
                  </Badge>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span>Due Date:</span>
                  <span
                    className={
                      compliance.status === "Overdue"
                        ? "text-danger fw-bold"
                        : ""
                    }
                  >
                    {formatDate(compliance.dueDate)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h6>Assigned To</h6>
                <div className="d-flex align-items-center mt-2">
                  <div className="avatar avatar-sm bg-primary rounded-circle text-white me-2">
                    {compliance.assignedTo?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div>{compliance.assignedTo?.name || "Unassigned"}</div>
                    <div className="text-muted small">
                      {compliance.assignedTo?.email || ""}
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              <h5 className="mb-3">Risk Analysis</h5>
              {compliance.riskScore ? (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Risk Score:</span>
                    <Badge
                      bg={
                        compliance.riskScore > 75
                          ? "danger"
                          : compliance.riskScore > 50
                            ? "warning"
                            : compliance.riskScore > 25
                              ? "info"
                              : "success"
                      }
                      className="px-3 py-2"
                    >
                      {compliance.riskScore}/100
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <Link
                      to={`/risk-analysis/compliance/${compliance.id}`}
                      className="btn btn-outline-primary btn-sm w-100"
                    >
                      <i className="bi bi-graph-up me-1"></i>
                      View Risk Analysis
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted small mb-3">
                    No risk analysis has been performed for this compliance
                    item.
                  </p>
                  <Link
                    to={`/risk-analysis/compliance/${compliance.id}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="bi bi-lightning-charge me-1"></i>
                    Run Risk Analysis
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-3">Actions</h5>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 py-2 border-0">
                  <Button
                    variant="link"
                    className="text-decoration-none p-0 d-flex align-items-center text-body"
                    as={Link}
                    to={`/compliance/${id}/edit`}
                  >
                    <i className="bi bi-pencil text-primary me-2"></i>
                    Edit Compliance Item
                  </Button>
                </ListGroup.Item>

                {compliance.status !== "Completed" && (
                  <ListGroup.Item className="px-0 py-2 border-0">
                    <Button
                      variant="link"
                      className="text-decoration-none p-0 d-flex align-items-center text-body"
                      onClick={handleComplete}
                    >
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Mark as Complete
                    </Button>
                  </ListGroup.Item>
                )}

                <ListGroup.Item className="px-0 py-2 border-0">
                  <Button
                    variant="link"
                    className="text-decoration-none p-0 d-flex align-items-center text-body"
                    as={Link}
                    to="/documents/upload"
                    state={{ complianceId: id }}
                  >
                    <i className="bi bi-file-earmark-plus text-primary me-2"></i>
                    Attach Document
                  </Button>
                </ListGroup.Item>

                <ListGroup.Item className="px-0 py-2 border-0">
                  <Button
                    variant="link"
                    className="text-decoration-none p-0 d-flex align-items-center text-danger"
                    onClick={handleDelete}
                  >
                    <i className="bi bi-trash text-danger me-2"></i>
                    Delete Compliance Item
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ComplianceDetail;
