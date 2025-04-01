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
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import complianceService from "../../services/complianceService";

const ComplianceList = () => {
  const { token } = useAuth();
  const [complianceItems, setComplianceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    dueDate: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Fetch compliance items on component mount and when filters change
  useEffect(() => {
    fetchComplianceItems();
  }, [filters, pagination.currentPage, searchTerm]);

  const fetchComplianceItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: pagination.currentPage,
        limit: 10,
        search: searchTerm,
        ...filters,
      };

      const response = await complianceService.getComplianceItems(
        token,
        queryParams,
      );

      setComplianceItems(response.data.items || []);
      setPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.totalItems || 0,
      });
    } catch (err) {
      console.error("Error fetching compliance items:", err);
      setError("Failed to load compliance items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
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
    if (
      window.confirm("Are you sure you want to delete this compliance item?")
    ) {
      try {
        await complianceService.deleteCompliance(token, id);
        fetchComplianceItems();
      } catch (err) {
        console.error("Error deleting compliance item:", err);
        alert("Failed to delete compliance item. Please try again.");
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

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3">Compliance Management</h1>
          <p className="text-muted">
            Track and manage your compliance requirements
          </p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <Button
            as={Link}
            to="/compliance/create"
            variant="primary"
            className="d-flex align-items-center"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Compliance Item
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
                    placeholder="Search compliance items..."
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
                    onClick={() => handleFilterChange("status", "pending")}
                  >
                    Pending
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("status", "in progress")}
                  >
                    In Progress
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("status", "completed")}
                  >
                    Completed
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("status", "overdue")}
                  >
                    Overdue
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown className="me-2">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="priority-filter"
                >
                  Priority: {filters.priority || "All"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("priority", "")}
                  >
                    All
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("priority", "high")}
                  >
                    High
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("priority", "medium")}
                  >
                    Medium
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("priority", "low")}
                  >
                    Low
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="date-filter">
                  Due Date: {filters.dueDate || "All"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("dueDate", "")}
                  >
                    All
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("dueDate", "today")}
                  >
                    Today
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("dueDate", "this_week")}
                  >
                    This Week
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("dueDate", "next_week")}
                  >
                    Next Week
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("dueDate", "this_month")}
                  >
                    This Month
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleFilterChange("dueDate", "overdue")}
                  >
                    Overdue
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading compliance items...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : complianceItems.length === 0 ? (
            <div className="text-center py-5">
              <i
                className="bi bi-clipboard-x text-muted"
                style={{ fontSize: "3rem" }}
              ></i>
              <p className="mt-3 mb-0">No compliance items found</p>
              {(searchTerm ||
                filters.status ||
                filters.priority ||
                filters.dueDate) && (
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
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link
                          to={`/compliance/${item.id}`}
                          className="text-decoration-none fw-medium"
                        >
                          {item.title}
                        </Link>
                        {item.description && (
                          <div className="small text-muted">
                            {item.description.substring(0, 60)}
                            {item.description.length > 60 ? "..." : ""}
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(item.status)}>
                          {item.status}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getPriorityBadge(item.priority)}>
                          {item.priority}
                        </Badge>
                      </td>
                      <td>{formatDate(item.dueDate)}</td>
                      <td>{item.assignedTo?.name || "Unassigned"}</td>
                      <td>
                        <div className="d-flex">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="me-2"
                            as={Link}
                            to={`/compliance/${item.id}`}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            as={Link}
                            to={`/compliance/${item.id}/edit`}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {!loading && complianceItems.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted">
                Showing {complianceItems.length} of {pagination.totalItems}{" "}
                compliance items
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

export default ComplianceList;
