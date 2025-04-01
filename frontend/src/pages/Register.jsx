import React, { useState, useContext } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const { register } = useAuth();
  const [registerError, setRegisterError] = useState(null);
  const navigate = useNavigate();

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Full name is required")
      .min(2, "Name must be at least 2 characters"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    setRegisterError(null);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = values;
      const success = await register(userData);
      if (success) {
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please login with your credentials.",
          },
        });
      } else {
        setRegisterError("Registration failed. Please try again.");
      }
    } catch (err) {
      setRegisterError(err.message || "An error occurred during registration");
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
          <h3 className="text-center mb-4">Create an Account</h3>

          {registerError && <Alert variant="danger">{registerError}</Alert>}

          <Formik
            initialValues={{
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
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
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && errors.name}
                    placeholder="Enter your full name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

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
                    placeholder="Create a password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={
                      touched.confirmPassword && errors.confirmPassword
                    }
                    placeholder="Confirm your password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="terms">
                  <Form.Check
                    type="checkbox"
                    label={
                      <span>
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-decoration-none"
                          target="_blank"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-decoration-none"
                          target="_blank"
                        >
                          Privacy Policy
                        </Link>
                      </span>
                    }
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-100 mb-3"
                >
                  {isSubmitting ? "Registering..." : "Register"}
                </Button>
              </Form>
            )}
          </Formik>

          <div className="text-center mt-3">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-decoration-none">
                Login here
              </Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;
