import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import CalendarIntegration from "./CalendarIntegration";
import NotificationChannels from "./NotificationChannels";
import SignatureIntegration from "./SignatureIntegration";

const Profile = () => {
  const { currentUser, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    department: "",
    company: "",
    avatar: null,
    avatarPreview: null,
  });

  // Load user data on component mount
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        jobTitle: currentUser.jobTitle || "",
        department: currentUser.department || "",
        company: currentUser.company || "",
        avatar: null,
        avatarPreview: currentUser.avatarUrl || null,
      });
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileData({
        ...profileData,
        avatar: file,
        avatarPreview: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Create form data for file upload
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("phone", profileData.phone);
      formData.append("jobTitle", profileData.jobTitle);
      formData.append("department", profileData.department);
      formData.append("company", profileData.company);

      if (profileData.avatar) {
        formData.append("avatar", profileData.avatar);
      }

      // This endpoint would need to be implemented
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setSuccess("Profile updated successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3">Profile Settings</h1>
          <p className="text-muted">
            Manage your account settings and integrations
          </p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Tabs defaultActiveKey="profile" className="mb-4">
        <Tab eventKey="profile" title="Profile">
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={3} className="text-center mb-4 mb-md-0">
                    <div className="avatar-upload">
                      <div className="avatar-preview rounded-circle mb-3">
                        {profileData.avatarPreview ? (
                          <img
                            src={profileData.avatarPreview}
                            alt="Avatar Preview"
                            className="img-fluid rounded-circle"
                            style={{
                              width: "150px",
                              height: "150px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="default-avatar rounded-circle bg-light d-flex justify-content-center align-items-center"
                            style={{ width: "150px", height: "150px" }}
                          >
                            <i
                              className="bi bi-person"
                              style={{ fontSize: "3rem" }}
                            ></i>
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          id="avatar"
                          className="d-none"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                        <label
                          htmlFor="avatar"
                          className="btn btn-outline-primary"
                        >
                          Change Picture
                        </label>
                      </div>
                    </div>
                  </Col>

                  <Col md={9}>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="name">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Group controlId="email">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            value={profileData.email}
                            disabled
                          />
                          <Form.Text className="text-muted">
                            Email cannot be changed
                          </Form.Text>
                        </Form.Group>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Group controlId="phone">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Group controlId="jobTitle">
                          <Form.Label>Job Title</Form.Label>
                          <Form.Control
                            type="text"
                            name="jobTitle"
                            value={profileData.jobTitle}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Group controlId="department">
                          <Form.Label>Department</Form.Label>
                          <Form.Control
                            type="text"
                            name="department"
                            value={profileData.department}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Group controlId="company">
                          <Form.Label>Company</Form.Label>
                          <Form.Control
                            type="text"
                            name="company"
                            value={profileData.company}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-3">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="notifications" title="Notification Settings">
          <NotificationChannels />
        </Tab>

        <Tab eventKey="calendar" title="Calendar Integration">
          <CalendarIntegration />
        </Tab>

        <Tab eventKey="signatures" title="Signature Integration">
          <SignatureIntegration />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Profile;
