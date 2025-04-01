import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Alert,
  ListGroup,
  Badge,
  Spinner,
  Form,
  Tabs,
  Tab,
  InputGroup,
} from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import notificationChannelService from "../../services/notificationChannelService";

const NotificationChannels = () => {
  const { currentUser, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activeTab, setActiveTab] = useState("channels");
  const [phoneVerification, setPhoneVerification] = useState({
    phoneNumber: "",
    verificationCode: "",
    verificationSent: false,
    verifying: false,
  });
  const [preferences, setPreferences] = useState({
    email: true,
    sms: false,
    whatsapp: false,
    push: true,
  });

  // Fetch notification channels on component mount
  useEffect(() => {
    fetchNotificationChannels();
  }, []);

  // Fetch available notification channels
  const fetchNotificationChannels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await notificationChannelService.getAvailableChannels(token);
      setChannels(response.data);

      // Fetch user preferences
      const preferencesResponse =
        await notificationChannelService.getChannelPreferences(token);
      setPreferences(preferencesResponse.data);
    } catch (err) {
      console.error("Error fetching notification channels:", err);
      setError("Failed to load notification channels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle phone number input change
  const handlePhoneNumberChange = (e) => {
    setPhoneVerification({
      ...phoneVerification,
      phoneNumber: e.target.value,
    });
  };

  // Handle verification code input change
  const handleVerificationCodeChange = (e) => {
    setPhoneVerification({
      ...phoneVerification,
      verificationCode: e.target.value,
    });
  };

  // Send verification code
  const sendVerificationCode = async () => {
    try {
      setLoading(true);
      setError(null);

      await notificationChannelService.verifyPhoneNumber(token, {
        phoneNumber: phoneVerification.phoneNumber,
      });

      setPhoneVerification({
        ...phoneVerification,
        verificationSent: true,
      });

      setSuccess("Verification code sent to your phone number");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error sending verification code:", err);
      setError(
        err.response?.data?.message ||
          "Failed to send verification code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify phone number
  const verifyPhone = async () => {
    try {
      setLoading(true);
      setError(null);
      setPhoneVerification({
        ...phoneVerification,
        verifying: true,
      });

      await notificationChannelService.confirmPhoneVerification(token, {
        phoneNumber: phoneVerification.phoneNumber,
        verificationCode: phoneVerification.verificationCode,
      });

      // Refresh channels
      await fetchNotificationChannels();

      setSuccess("Phone number verified successfully");

      // Reset verification form
      setPhoneVerification({
        phoneNumber: "",
        verificationCode: "",
        verificationSent: false,
        verifying: false,
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error verifying phone number:", err);
      setError(
        err.response?.data?.message ||
          "Failed to verify phone number. Please try again.",
      );
      setPhoneVerification({
        ...phoneVerification,
        verifying: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle preference change
  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setPreferences({
      ...preferences,
      [name]: checked,
    });
  };

  // Save notification preferences
  const savePreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      await notificationChannelService.updateChannelPreferences(
        token,
        preferences,
      );

      setSuccess("Notification preferences saved successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving notification preferences:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save notification preferences. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Send test notification
  const sendTestNotification = async (channelType) => {
    try {
      setLoading(true);
      setError(null);

      await notificationChannelService.sendTestNotification(token, channelType);

      setSuccess(`Test notification sent to ${getChannelName(channelType)}`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(`Error sending test notification to ${channelType}:`, err);
      setError(
        err.response?.data?.message ||
          `Failed to send test notification to ${getChannelName(channelType)}. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Get channel display name
  const getChannelName = (channelType) => {
    switch (channelType) {
      case "email":
        return "Email";
      case "sms":
        return "SMS";
      case "whatsapp":
        return "WhatsApp";
      case "push":
        return "Push Notification";
      default:
        return channelType;
    }
  };

  // Get channel icon
  const getChannelIcon = (channelType) => {
    switch (channelType) {
      case "email":
        return "bi-envelope";
      case "sms":
        return "bi-chat-dots";
      case "whatsapp":
        return "bi-whatsapp";
      case "push":
        return "bi-bell";
      default:
        return "bi-chat";
    }
  };

  return (
    <div className="notification-channels-container">
      <h4 className="mb-4">Notification Channels</h4>

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

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="channels" title="Available Channels">
          <Card>
            <Card.Body>
              {loading && !channels.length ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">
                    Loading notification channels...
                  </p>
                </div>
              ) : (
                <>
                  <h5 className="mb-3">Notification Channels</h5>

                  {channels.length === 0 ? (
                    <div className="text-center py-3">
                      <i
                        className="bi bi-bell"
                        style={{ fontSize: "2rem", color: "#6c757d" }}
                      ></i>
                      <p className="mt-2 text-muted">
                        No notification channels available
                      </p>
                    </div>
                  ) : (
                    <ListGroup variant="flush">
                      {channels.map((channel) => (
                        <ListGroup.Item
                          key={channel.id}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <div className="d-flex align-items-center">
                              <i
                                className={`bi ${getChannelIcon(channel.type)} me-2`}
                                style={{ fontSize: "1.2rem" }}
                              ></i>
                              <span className="fw-bold">
                                {getChannelName(channel.type)}
                              </span>
                              {channel.verified && (
                                <Badge bg="success" className="ms-2">
                                  Verified
                                </Badge>
                              )}
                              {!channel.verified &&
                                channel.type !== "email" &&
                                channel.type !== "push" && (
                                  <Badge bg="warning" className="ms-2">
                                    Not Verified
                                  </Badge>
                                )}
                            </div>
                            <div className="text-muted small mt-1">
                              {channel.value || channel.description}
                            </div>
                          </div>
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => sendTestNotification(channel.type)}
                              disabled={
                                loading ||
                                (!channel.verified &&
                                  channel.type !== "email" &&
                                  channel.type !== "push")
                              }
                            >
                              <i className="bi bi-send me-1"></i>
                              Test
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}

                  <div className="mt-4">
                    <h6>Verify Phone Number for SMS/WhatsApp</h6>
                    <Form className="mt-3">
                      <Form.Group className="mb-3" controlId="phoneNumber">
                        <Form.Label>Phone Number</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="tel"
                            placeholder="Enter your phone number with country code"
                            value={phoneVerification.phoneNumber}
                            onChange={handlePhoneNumberChange}
                            disabled={
                              phoneVerification.verificationSent || loading
                            }
                          />
                          <Button
                            variant="outline-primary"
                            onClick={sendVerificationCode}
                            disabled={
                              !phoneVerification.phoneNumber ||
                              phoneVerification.verificationSent ||
                              loading
                            }
                          >
                            Send Code
                          </Button>
                        </InputGroup>
                        <Form.Text className="text-muted">
                          Enter your phone number with country code (e.g.,
                          +1234567890)
                        </Form.Text>
                      </Form.Group>

                      {phoneVerification.verificationSent && (
                        <Form.Group
                          className="mb-3"
                          controlId="verificationCode"
                        >
                          <Form.Label>Verification Code</Form.Label>
                          <InputGroup>
                            <Form.Control
                              type="text"
                              placeholder="Enter verification code"
                              value={phoneVerification.verificationCode}
                              onChange={handleVerificationCodeChange}
                              disabled={loading || phoneVerification.verifying}
                            />
                            <Button
                              variant="primary"
                              onClick={verifyPhone}
                              disabled={
                                !phoneVerification.verificationCode ||
                                loading ||
                                phoneVerification.verifying
                              }
                            >
                              {phoneVerification.verifying
                                ? "Verifying..."
                                : "Verify"}
                            </Button>
                          </InputGroup>
                          <Form.Text className="text-muted">
                            Enter the verification code sent to your phone
                          </Form.Text>
                        </Form.Group>
                      )}
                    </Form>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="preferences" title="Notification Preferences">
          <Card>
            <Card.Body>
              <h5 className="mb-3">Notification Preferences</h5>
              <p className="text-muted mb-4">
                Choose which channels you want to receive notifications on
              </p>

              <Form>
                <Form.Group className="mb-3" controlId="emailPreference">
                  <Form.Check
                    type="switch"
                    label="Email Notifications"
                    name="email"
                    checked={preferences.email}
                    onChange={handlePreferenceChange}
                  />
                  <Form.Text className="text-muted">
                    Receive notifications via email
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="smsPreference">
                  <Form.Check
                    type="switch"
                    label="SMS Notifications"
                    name="sms"
                    checked={preferences.sms}
                    onChange={handlePreferenceChange}
                    disabled={
                      !channels.some((c) => c.type === "sms" && c.verified)
                    }
                  />
                  <Form.Text className="text-muted">
                    Receive notifications via SMS
                    {!channels.some((c) => c.type === "sms" && c.verified) && (
                      <span className="text-danger ms-2">
                        (Verify your phone number first)
                      </span>
                    )}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="whatsappPreference">
                  <Form.Check
                    type="switch"
                    label="WhatsApp Notifications"
                    name="whatsapp"
                    checked={preferences.whatsapp}
                    onChange={handlePreferenceChange}
                    disabled={
                      !channels.some((c) => c.type === "whatsapp" && c.verified)
                    }
                  />
                  <Form.Text className="text-muted">
                    Receive notifications via WhatsApp
                    {!channels.some(
                      (c) => c.type === "whatsapp" && c.verified,
                    ) && (
                      <span className="text-danger ms-2">
                        (Verify your phone number first)
                      </span>
                    )}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="pushPreference">
                  <Form.Check
                    type="switch"
                    label="Push Notifications"
                    name="push"
                    checked={preferences.push}
                    onChange={handlePreferenceChange}
                  />
                  <Form.Text className="text-muted">
                    Receive push notifications in your browser
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    variant="primary"
                    onClick={savePreferences}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default NotificationChannels;
