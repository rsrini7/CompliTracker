import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import complianceService from "../../services/complianceService";

const ComplianceForm = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    regulation: "",
    requirements: "",
    status: "Pending",
    priority: "Medium",
    dueDate: "",
    assignedTo: "",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([
    "Data Privacy",
    "Security",
    "Financial",
    "Environmental",
    "Health & Safety",
    "Regulatory",
    "Legal",
    "Other",
  ]);

  // Fetch compliance item for editing and load users
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch users for assignee dropdown
        // const usersResponse = await userService.getUsers(token);
        // setUsers(usersResponse.data);

        // Temporary mock users
        setUsers([
          { id: "1", name: "John Smith", email: "john@example.com" },
          { id: "2", name: "Jane Doe", email: "jane@example.com" },
          { id: "3", name: "Mike Johnson", email: "mike@example.com" },
        ]);

        // If editing, fetch compliance data
        if (isEditMode) {
          const response = await complianceService.getComplianceById(token, id);
          const complianceData = response.data;

          // Format date for input (YYYY-MM-DD)
          const formattedDate = complianceData.dueDate
            ? new Date(complianceData.dueDate).toISOString().split("T")[0]
            : "";

          setFormData({
            title: complianceData.title || "",
            description: complianceData.description || "",
            category: complianceData.category || "",
            regulation: complianceData.regulation || "",
            requirements: complianceData.requirements || "",
            status: complianceData.status || "Pending",
            priority: complianceData.priority || "Medium",
            dueDate: formattedDate,
            assignedTo: complianceData.assignedTo?.id || "",
          });
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [id, token, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Validate form
      if (!formData.title || !formData.dueDate) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Create or update compliance item
      if (isEditMode) {
        await complianceService.updateCompliance(token, id, formData);
      } else {
        await complianceService.createCompliance(token, formData);
      }

      // Redirect to compliance list
      navigate("/compliance");
    } catch (err) {
      console.error("Error saving compliance item:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save compliance item. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading compliance data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1">
            {isEditMode ? "Edit Compliance Item" : "Add New Compliance Item"}
          </h2>
          <p className="text-muted">
            {isEditMode
              ? "Update compliance information"
              : "Create a new compliance requirement"}
          </p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="title">
                  <Form.Label>
                    Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter compliance title"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter detailed description"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="category">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="regulation">
                      <Form.Label>Regulation/Standard</Form.Label>
                      <Form.Control
                        type="text"
                        name="regulation"
                        value={formData.regulation}
                        onChange={handleChange}
                        placeholder="E.g., GDPR, ISO 27001"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="requirements">
                  <Form.Label>Requirements</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Specific compliance requirements or steps"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="status">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Overdue">Overdue</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="priority">
                      <Form.Label>Priority</Form.Label>
                      <Form.Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="dueDate">
                      <Form.Label>
                        Due Date <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="assignedTo">
                      <Form.Label>Assigned To</Form.Label>
                      <Form.Select
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                      >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    variant="outline-secondary"
                    className="me-2"
                    as={Link}
                    to="/compliance"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : isEditMode ? (
                      "Update Compliance Item"
                    ) : (
                      "Create Compliance Item"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Guidance</h5>
            </Card.Header>
            <Card.Body>
              <h6 className="mb-2">Compliance Item Details</h6>
              <p className="text-muted small mb-3">
                Create a clear and specific title that identifies the compliance
                requirement. Include detailed information to ensure proper
                tracking and completion.
              </p>

              <h6 className="mb-2">Priority Levels</h6>
              <ul className="text-muted small ps-3 mb-3">
                <li>
                  <strong>High:</strong> Critical requirements with significant
                  risk or penalties if not met
                </li>
                <li>
                  <strong>Medium:</strong> Important requirements with moderate
                  risk
                </li>
                <li>
                  <strong>Low:</strong> Routine requirements with minimal risk
                </li>
              </ul>

              <h6 className="mb-2">Status Types</h6>
              <ul className="text-muted small ps-3">
                <li>
                  <strong>Pending:</strong> Not yet started
                </li>
                <li>
                  <strong>In Progress:</strong> Work has begun
                </li>
                <li>
                  <strong>Completed:</strong> All requirements have been
                  fulfilled
                </li>
                <li>
                  <strong>Overdue:</strong> Past due date without completion
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ComplianceForm;
