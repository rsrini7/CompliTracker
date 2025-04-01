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
  Modal,
  Form,
} from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import documentService from "../../services/documentService";

const DocumentDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  // Signature related states
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatories, setSignatories] = useState([]);
  const [signatory, setSignatory] = useState({ email: "", name: "" });
  const [signatureStatus, setSignatureStatus] = useState(null);
  const [signatureLoading, setSignatureLoading] = useState(false);

  // Fetch document details on component mount
  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch document details
      const docResponse = await documentService.getDocumentById(
        currentUser.token,
        id,
      );
      setDocument(docResponse.data);

      // Fetch document versions
      const versionsResponse = await documentService.getDocumentVersions(
        currentUser.token,
        id,
      );
      setVersions(versionsResponse.data || []);

      // If document has signature requests, fetch signature status
      if (docResponse.data.signatureId) {
        fetchSignatureStatus(docResponse.data.signatureId);
      }
    } catch (err) {
      console.error("Error fetching document details:", err);
      setError("Failed to load document details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSignatureStatus = async (signatureId) => {
    try {
      setSignatureLoading(true);
      const response = await documentService.checkSignatureStatus(
        currentUser.token,
        signatureId,
      );
      setSignatureStatus(response.data);

      // If signatories exist in the response, set them
      if (response.data.signatories) {
        setSignatories(response.data.signatories);
      }
    } catch (err) {
      console.error("Error fetching signature status:", err);
    } finally {
      setSignatureLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await documentService.downloadDocument(
        currentUser.token,
        id,
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", document.name || "document");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download document");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await documentService.deleteDocument(currentUser.token, id);
        navigate("/documents");
      } catch (err) {
        console.error("Error deleting document:", err);
        alert("Failed to delete document. Please try again.");
      }
    }
  };

  // Handle signatory input changes
  const handleSignatoryChange = (e) => {
    const { name, value } = e.target;
    setSignatory({
      ...signatory,
      [name]: value,
    });
  };

  // Add signatory to the list
  const addSignatory = () => {
    if (!signatory.email || !signatory.name) return;

    setSignatories([...signatories, signatory]);

    // Clear signatory form
    setSignatory({ email: "", name: "" });
  };

  // Remove signatory from the list
  const removeSignatory = (index) => {
    const updatedSignatories = [...signatories];
    updatedSignatories.splice(index, 1);
    setSignatories(updatedSignatories);
  };

  // Request document signature
  const requestSignature = async () => {
    if (signatories.length === 0) {
      alert("Please add at least one signatory");
      return;
    }

    try {
      setSignatureLoading(true);

      const response = await documentService.requestSignature(
        currentUser.token,
        id,
        { signatories },
      );

      // Update document with signature info
      setDocument({
        ...document,
        status: "Awaiting Signature",
        signatureId: response.data.signatureId,
      });

      setSignatureStatus(response.data);
      setShowSignatureModal(false);

      alert("Signature request has been sent successfully!");
    } catch (err) {
      console.error("Error requesting signature:", err);
      alert("Failed to request signature. Please try again.");
    } finally {
      setSignatureLoading(false);
    }
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      case "draft":
        return "secondary";
      case "awaiting signature":
        return "info";
      case "signed":
        return "primary";
      default:
        return "light";
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">Document not found</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <Link to="/documents" className="btn btn-outline-secondary me-3">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <div>
              <h1 className="h3 mb-0">{document.name}</h1>
              <p className="text-muted mb-0">
                {document.category && (
                  <span className="text-capitalize">{document.category}</span>
                )}
                {document.updatedAt && (
                  <span className="ms-2">
                    Last updated:{" "}
                    {new Date(document.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={handleDownload}
          >
            <i className="bi bi-download me-1"></i>
            Download
          </Button>

          {document.status !== "Signed" &&
            document.status !== "Awaiting Signature" && (
              <Button
                variant="primary"
                onClick={() => setShowSignatureModal(true)}
              >
                <i className="bi bi-pen me-1"></i>
                Request Signature
              </Button>
            )}
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
                  <Nav.Link eventKey="versions">Versions</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="signatures">Signatures</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                <Tab.Pane eventKey="details" active={activeTab === "details"}>
                  <Row>
                    <Col md={6} className="mb-4">
                      <h5 className="text-muted mb-2">Status</h5>
                      <Badge
                        bg={getStatusBadge(document.status)}
                        className="fs-6"
                      >
                        {document.status}
                      </Badge>
                    </Col>

                    <Col md={6} className="mb-4">
                      <h5 className="text-muted mb-2">Document Type</h5>
                      <p className="mb-0">
                        {document.fileType?.toUpperCase() || "Unknown"}
                      </p>
                    </Col>

                    <Col md={6} className="mb-4">
                      <h5 className="text-muted mb-2">Created By</h5>
                      <p className="mb-0">
                        {document.createdBy?.name || "Unknown"}
                      </p>
                    </Col>

                    <Col md={6} className="mb-4">
                      <h5 className="text-muted mb-2">Created Date</h5>
                      <p className="mb-0">
                        {document.createdAt
                          ? new Date(document.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </Col>

                    {document.expiryDate && (
                      <Col md={6} className="mb-4">
                        <h5 className="text-muted mb-2">Expiry Date</h5>
                        <p className="mb-0">
                          {new Date(document.expiryDate).toLocaleDateString()}
                        </p>
                      </Col>
                    )}

                    <Col md={12} className="mb-4">
                      <h5 className="text-muted mb-2">Description</h5>
                      <p className="mb-0">
                        {document.description || "No description provided"}
                      </p>
                    </Col>
                  </Row>
                </Tab.Pane>

                <Tab.Pane eventKey="versions" active={activeTab === "versions"}>
                  {versions.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted mb-0">
                        No version history available
                      </p>
                    </div>
                  ) : (
                    <ListGroup variant="flush">
                      {versions.map((version, index) => (
                        <ListGroup.Item key={index} className="py-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">
                                Version {version.versionNumber}
                              </h6>
                              <p className="text-muted mb-0 small">
                                Updated on{" "}
                                {new Date(version.createdAt).toLocaleString()}
                                {version.createdBy &&
                                  ` by ${version.createdBy.name}`}
                              </p>
                            </div>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => {
                                // Download specific version
                                documentService
                                  .downloadDocumentVersion(
                                    currentUser.token,
                                    id,
                                    version.versionNumber,
                                  )
                                  .then((response) => {
                                    const url = window.URL.createObjectURL(
                                      new Blob([response.data]),
                                    );
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.setAttribute(
                                      "download",
                                      `${document.name}_v${version.versionNumber}`,
                                    );
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                  })
                                  .catch((err) => {
                                    console.error("Download error:", err);
                                    alert(
                                      "Failed to download document version",
                                    );
                                  });
                              }}
                            >
                              <i className="bi bi-download"></i>
                            </Button>
                          </div>
                          {version.changeDescription && (
                            <p className="mt-2 mb-0 small">
                              <strong>Changes:</strong>{" "}
                              {version.changeDescription}
                            </p>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Tab.Pane>

                <Tab.Pane
                  eventKey="signatures"
                  active={activeTab === "signatures"}
                >
                  {signatureLoading ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : !signatureStatus ? (
                    <div className="text-center py-4">
                      <p className="text-muted mb-3">
                        No signature requests found for this document
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowSignatureModal(true)}
                      >
                        Request Signatures
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <h5 className="mb-2">Signature Status</h5>
                        <Badge
                          bg={
                            signatureStatus.status === "completed"
                              ? "success"
                              : "info"
                          }
                          className="fs-6"
                        >
                          {signatureStatus.status === "completed"
                            ? "Completed"
                            : "In Progress"}
                        </Badge>
                        {signatureStatus.expiresAt && (
                          <p className="text-muted mt-2 mb-0">
                            Expires on{" "}
                            {new Date(
                              signatureStatus.expiresAt,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <h5 className="mb-3">Signatories</h5>
                      <ListGroup className="mb-4">
                        {signatureStatus.signatories?.map((sig, index) => (
                          <ListGroup.Item key={index} className="py-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">{sig.name}</h6>
                                <p className="text-muted mb-0 small">
                                  {sig.email}
                                </p>
                              </div>
                              <Badge
                                bg={
                                  sig.status === "signed"
                                    ? "success"
                                    : sig.status === "viewed"
                                      ? "warning"
                                      : "secondary"
                                }
                              >
                                {sig.status === "signed"
                                  ? "Signed"
                                  : sig.status === "viewed"
                                    ? "Viewed"
                                    : "Pending"}
                              </Badge>
                            </div>
                            {sig.signedAt && (
                              <p className="mt-2 mb-0 small">
                                <strong>Signed:</strong>{" "}
                                {new Date(sig.signedAt).toLocaleString()}
                              </p>
                            )}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>

                      {signatureStatus.status !== "completed" && (
                        <div className="d-grid">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() =>
                              fetchSignatureStatus(document.signatureId)
                            }
                          >
                            Refresh Status
                          </Button>
                        </div>
                      )}
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
              <h5 className="mb-3">Document Actions</h5>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 py-2 border-0">
                  <Button
                    variant="link"
                    className="text-decoration-none p-0 d-flex align-items-center text-body"
                    onClick={handleDownload}
                  >
                    <i className="bi bi-download text-primary me-2"></i>
                    Download Document
                  </Button>
                </ListGroup.Item>

                {document.status !== "Signed" &&
                  document.status !== "Awaiting Signature" && (
                    <ListGroup.Item className="px-0 py-2 border-0">
                      <Button
                        variant="link"
                        className="text-decoration-none p-0 d-flex align-items-center text-body"
                        onClick={() => setShowSignatureModal(true)}
                      >
                        <i className="bi bi-pen text-primary me-2"></i>
                        Request Signature
                      </Button>
                    </ListGroup.Item>
                  )}

                <ListGroup.Item className="px-0 py-2 border-0">
                  <Button
                    variant="link"
                    className="text-decoration-none p-0 d-flex align-items-center text-body"
                    onClick={() => {
                      // Share document functionality
                      documentService
                        .shareDocument(currentUser.token, id, { expiryDays: 7 })
                        .then((response) => {
                          // Copy sharing link to clipboard
                          navigator.clipboard
                            .writeText(response.data.shareUrl)
                            .then(() => {
                              alert("Sharing link copied to clipboard!");
                            })
                            .catch((err) => {
                              console.error("Clipboard error:", err);
                              alert(`Sharing link: ${response.data.shareUrl}`);
                            });
                        })
                        .catch((err) => {
                          console.error("Sharing error:", err);
                          alert("Failed to generate sharing link");
                        });
                    }}
                  >
                    <i className="bi bi-share text-primary me-2"></i>
                    Share Document
                  </Button>
                </ListGroup.Item>

                {document.status !== "Signed" && (
                  <ListGroup.Item className="px-0 py-2 border-0">
                    <Button
                      variant="link"
                      className="text-decoration-none p-0 d-flex align-items-center text-danger"
                      onClick={handleDelete}
                    >
                      <i className="bi bi-trash text-danger me-2"></i>
                      Delete Document
                    </Button>
                  </ListGroup.Item>
                )}
              </ListGroup>

              <hr className="my-4" />

              <h5 className="mb-3">Document Information</h5>
              <div className="mb-2 d-flex justify-content-between">
                <span className="text-muted">File Size:</span>
                <span>
                  {document.fileSize
                    ? `${(document.fileSize / 1024).toFixed(2)} KB`
                    : "Unknown"}
                </span>
              </div>
              <div className="mb-2 d-flex justify-content-between">
                <span className="text-muted">File Type:</span>
                <span>{document.fileType?.toUpperCase() || "Unknown"}</span>
              </div>
              <div className="mb-2 d-flex justify-content-between">
                <span className="text-muted">Uploaded By:</span>
                <span>{document.createdBy?.name || "Unknown"}</span>
              </div>
              <div className="mb-2 d-flex justify-content-between">
                <span className="text-muted">Upload Date:</span>
                <span>
                  {document.createdAt
                    ? new Date(document.createdAt).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
              {document.expiryDate && (
                <div className="mb-2 d-flex justify-content-between">
                  <span className="text-muted">Expiry Date:</span>
                  <span>
                    {new Date(document.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>

          {document.status === "Awaiting Signature" && (
            <Card className="shadow-sm mb-4 border-info">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-info-circle-fill text-info me-2"></i>
                  <h5 className="mb-0">Signature Request Sent</h5>
                </div>
                <p className="text-muted">
                  A signature request has been sent to the designated
                  signatories. You'll be notified once the document is signed.
                </p>
                <Button
                  variant="outline-info"
                  size="sm"
                  className="w-100"
                  onClick={() => setActiveTab("signatures")}
                >
                  View Signature Status
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Signature Request Modal */}
      <Modal
        show={showSignatureModal}
        onHide={() => setShowSignatureModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Request Document Signature</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-4">
            Add signatories who need to sign this document. Each signatory will
            receive an email with instructions to complete the signature
            process.
          </p>

          {signatories.length > 0 && (
            <div className="mb-4">
              <h6 className="mb-3">Signatories</h6>
              <ListGroup>
                {signatories.map((sig, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-medium">{sig.name}</div>
                      <div className="text-muted small">{sig.email}</div>
                    </div>
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      onClick={() => removeSignatory(index)}
                    >
                      <i className="bi bi-x-circle"></i>
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          <h6 className="mb-3">Add Signatory</h6>
          <Row>
            <Col md={5}>
              <Form.Group className="mb-3" controlId="signatoryName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={signatory.name}
                  onChange={handleSignatoryChange}
                  placeholder="Enter name"
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group className="mb-3" controlId="signatoryEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={signatory.email}
                  onChange={handleSignatoryChange}
                  placeholder="Enter email"
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button
                variant="outline-primary"
                className="w-100 mb-3"
                onClick={addSignatory}
                disabled={!signatory.name || !signatory.email}
              >
                Add
              </Button>
            </Col>
          </Row>

          <hr className="my-4" />

          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-shield-check text-success me-2 fs-4"></i>
            <div>
              <h6 className="mb-1">Secure Digital Signatures</h6>
              <p className="text-muted mb-0 small">
                All signatures are legally binding and comply with eSign
                regulations
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowSignatureModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={requestSignature}
            disabled={signatories.length === 0 || signatureLoading}
          >
            {signatureLoading ? "Sending Request..." : "Send Signature Request"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DocumentDetail;
