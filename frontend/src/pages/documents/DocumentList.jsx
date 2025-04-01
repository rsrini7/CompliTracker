import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Form,
  InputGroup,
  Dropdown,
  Pagination,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import documentService from "../../services/documentService";

const DocumentList = () => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    dateRange: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Fetch documents on component mount and when filters change
  useEffect(() => {
    fetchDocuments();
  }, [filters, pagination.currentPage, searchTerm]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: pagination.currentPage,
        limit: 10,
        search: searchTerm,
        ...filters,
      };

      const response = await documentService.getDocuments(
        currentUser.token,
        queryParams,
      );

      setDocuments(response.data.items || []);
      setPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.totalItems || 0,
      });
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    setPagination((prev) => ({
      ...prev,
      currentPage: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (pageNumber) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: pageNumber,
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await documentService.deleteDocument(currentUser.token, id);
        setDocuments(documents.filter((doc) => doc.id !== id));
      } catch (err) {
        console.error("Error deleting document:", err);
        alert("Failed to delete document. Please try again.");
      }
    }
  };

  // Generate pagination items
  const paginationItems = [];
  for (let number = 1; number <= pagination.totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === pagination.currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>,
    );
  }

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

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3">Document Management</h1>
          <p className="text-muted">
            View, manage, and sign your compliance documents
          </p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <Button
            as={Link}
            to="/documents/upload"
            variant="primary"
            className="d-flex align-items-center"
          >
            <i className="bi bi-cloud-upload me-2"></i>
            Upload Document
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="outline-secondary">
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={6} className="d-flex justify-content-md-end mt-3 mt-md-0">
              <Dropdown className="me-2">
                <Dropdown.Toggle variant="outline-secondary" id="status-filter">
                  Status: {filters.status || "All"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("status", "")}
                  >
                    All
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("status", "draft")}
                  >
                    Draft
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("status", "pending")}
                  >
                    Pending
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("status", "approved")}
                  >
                    Approved
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("status", "rejected")}
                  >
                    Rejected
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      handleFilterChange("status", "awaiting signature")
                    }
                  >
                    Awaiting Signature
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("status", "signed")}
                  >
                    Signed
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown className="me-2">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="category-filter"
                >
                  Category: {filters.category || "All"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("category", "")}
                  >
                    All
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("category", "compliance")}
                  >
                    Compliance
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("category", "contract")}
                  >
                    Contract
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("category", "policy")}
                  >
                    Policy
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("category", "report")}
                  >
                    Report
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="date-filter">
                  Date: {filters.dateRange || "All"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("dateRange", "")}
                  >
                    All Time
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("dateRange", "today")}
                  >
                    Today
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("dateRange", "week")}
                  >
                    This Week
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("dateRange", "month")}
                  >
                    This Month
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("dateRange", "year")}
                  >
                    This Year
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-5">
              <i
                className="bi bi-file-earmark-x text-muted"
                style={{ fontSize: "3rem" }}
              ></i>
              <p className="mt-3 mb-0">No documents found</p>
              {(searchTerm ||
                filters.status ||
                filters.category ||
                filters.dateRange) && (
                <p className="text-muted">
                  Try adjusting your search or filters
                </p>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="document-icon me-3">
                            <i
                              className={`bi bi-file-earmark-${doc.fileType === "pdf" ? "pdf" : "text"} text-primary`}
                            ></i>
                          </div>
                          <div>
                            <Link
                              to={`/documents/${doc.id}`}
                              className="text-decoration-none fw-medium"
                            >
                              {doc.name}
                            </Link>
                            <div className="small text-muted">
                              {doc.description?.substring(0, 60)}
                              {doc.description?.length > 60 ? "..." : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{doc.category}</td>
                      <td>
                        <Badge bg={getStatusBadge(doc.status)}>
                          {doc.status}
                        </Badge>
                        {doc.status === "Awaiting Signature" && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 ms-2"
                            onClick={() =>
                              (window.location.href = `/documents/${doc.id}/sign`)
                            }
                          >
                            Sign Now
                          </Button>
                        )}
                      </td>
                      <td>{new Date(doc.updatedAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="me-2"
                            as={Link}
                            to={`/documents/${doc.id}`}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              documentService
                                .downloadDocument(currentUser.token, doc.id)
                                .then((response) => {
                                  const url = window.URL.createObjectURL(
                                    new Blob([response.data]),
                                  );
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.setAttribute("download", doc.name);
                                  document.body.appendChild(link);
                                  link.click();
                                  link.remove();
                                })
                                .catch((err) => {
                                  console.error("Download error:", err);
                                  alert("Failed to download document");
                                })
                            }
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          {doc.status !== "Signed" && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {!loading && documents.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted">
                Showing {documents.length} of {pagination.totalItems} documents
              </div>
              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                />
                {paginationItems}
                <Pagination.Next
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DocumentList;
