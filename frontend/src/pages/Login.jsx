import React, { useState, useContext } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login, error } = useContext(AuthContext);
  const [loginError, setLoginError] = useState(null);
  const location = useLocation();

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    setLoginError(null);
    try {
      const success = await login(values);
      if (!success) {
        setLoginError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setLoginError(err.message || "An error occurred during login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo text-center mb-4">
        <h2 className="text-primary">
          <i className="bi bi-shield-check me-2"></i>
          CompliTracker
        </h2>
      </div>

      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">Login to Your Account</h3>

          {(loginError || error) && (
            <Alert variant="danger">{loginError || error}</Alert>
          )}

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.email && errors.email}
                    placeholder="Enter your email"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.password && errors.password}
                    placeholder="Enter your password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Form.Check
                    type="checkbox"
                    id="rememberMe"
                    label="Remember me"
                  />
                  <Link to="/forgot-password" className="text-decoration-none">
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-100 mb-3"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </Form>
            )}
          </Formik>

          <div className="text-center mt-3">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="text-decoration-none">
                Register here
              </Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
