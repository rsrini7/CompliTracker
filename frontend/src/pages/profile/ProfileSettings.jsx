import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Nav,
  Tab,
} from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import CalendarIntegration from "./CalendarIntegration";
import NotificationChannels from "./NotificationChannels";
import SignatureIntegration from "./SignatureIntegration";

const ProfileSettings = () => {
  const { currentUser, token } = useContext(AuthContext);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    department: "",
    profileImage: null,
  });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Load user data on component mount
  useEffect(() => {
    if (currentUser) {
      setUserData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        jobTitle: currentUser.jobTitle || "",
        department: currentUser.department || "",
        profileImage: currentUser.profileImage || null,
      });
    }
  }, [currentUser]);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  // Handle password changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword({
      ...password,
      [name]: value,
    });
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Call API to update profile (mock for now)
      // await userService.updateProfile(token, userData);

      setSuccess("Profile updated successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (password.new !== password.confirm) {
      setError("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call API to update password (mock for now)
      // await userService.updatePassword(token, password);

      setSuccess("Password updated successfully");

      // Clear password fields
      setPassword({
        current: "",
        new: "",
        confirm: "",
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Account Settings</h2>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      <Tab.Container
        id="profile-tabs"
        activeKey={activeTab}
        onSelect={setActiveTab}
      >
        <Row>
          <Col md={3} className="mb-4">
            <Card>
              <Card.Body>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="profile">Profile Information</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password">Change Password</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notifications">
                      Notification Settings
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="calendar">
                      Calendar Integration
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="signature">Digital Signature</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="profile">
                <Card>
                  <Card.Header>
                    <h4 className="mb-0">Profile Information</h4>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleProfileUpdate}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={userData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={userData.email}
                              onChange={handleInputChange}
                              required
                              disabled
                            />
                            <Form.Text className="text-muted">
                              Email cannot be changed
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="phone">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={userData.phone}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="jobTitle">
                            <Form.Label>Job Title</Form.Label>
                            <Form.Control
                              type="text"
                              name="jobTitle"
                              value={userData.jobTitle}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="department">
                            <Form.Label>Department</Form.Label>
                            <Form.Control
                              type="text"
                              name="department"
                              value={userData.department}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="d-flex justify-content-end">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="password">
                <Card>
                  <Card.Header>
                    <h4 className="mb-0">Change Password</h4>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handlePasswordUpdate}>
                      <Form.Group className="mb-3" controlId="currentPassword">
                        <Form.Label>Current Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="current"
                          value={password.current}
                          onChange={handlePasswordChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="newPassword">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="new"
                          value={password.new}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                        />
                        <Form.Text className="text-muted">
                          Password must be at least 8 characters long and
                          include uppercase, lowercase, numbers, and special
                          characters
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="confirmPassword">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirm"
                          value={password.confirm}
                          onChange={handlePasswordChange}
                          required
                        />
                      </Form.Group>

                      <div className="d-flex justify-content-end">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Password"}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="notifications">
                <NotificationChannels />
              </Tab.Pane>

              <Tab.Pane eventKey="calendar">
                <CalendarIntegration />
              </Tab.Pane>

              <Tab.Pane eventKey="signature">
                <SignatureIntegration />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default ProfileSettings;
