import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import ssoService from "../services/ssoService";

const SSOCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleSSOCallback = async () => {
      try {
        // Parse query parameters from URL
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get("code");
        const state = queryParams.get("state");
        const provider =
          queryParams.get("provider") || extractProviderFromState(state);

        if (!code || !provider) {
          throw new Error("Invalid callback parameters");
        }

        // Complete SSO authentication
        const response = await ssoService.completeSSO(provider, code, state);

        // Login user with the token received from SSO
        await login(response.data.token);

        // Redirect to dashboard or intended page
        const redirectPath =
          extractRedirectPathFromState(state) || "/dashboard";
        navigate(redirectPath);
      } catch (err) {
        console.error("SSO authentication error:", err);
        setError(
          err.response?.data?.message ||
            "Authentication failed. Please try again.",
        );
        setLoading(false);
      }
    };

    handleSSOCallback();
  }, [location, login, navigate]);

  // Extract provider from state parameter if needed
  const extractProviderFromState = (state) => {
    if (!state) return null;

    try {
      const stateObj = JSON.parse(atob(state));
      return stateObj.provider;
    } catch (err) {
      console.error("Error parsing state:", err);
      return null;
    }
  };

  // Extract redirect path from state parameter
  const extractRedirectPathFromState = (state) => {
    if (!state) return null;

    try {
      const stateObj = JSON.parse(atob(state));
      return stateObj.redirectUri;
    } catch (err) {
      console.error("Error parsing state:", err);
      return null;
    }
  };

  // If there's an error, show error message with login link
  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <i
                    className="bi bi-x-circle text-danger"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h3 className="mt-3">Authentication Failed</h3>
                </div>

                <Alert variant="danger">{error}</Alert>

                <div className="text-center mt-4">
                  <p>Please try again or use another login method.</p>
                  <a href="/login" className="btn btn-primary">
                    Back to Login
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Show loading spinner while processing
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4 text-center">
              <Spinner animation="border" variant="primary" />
              <h3 className="mt-3">Completing Authentication</h3>
              <p className="text-muted">
                Please wait while we complete your sign-in...
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SSOCallback;
