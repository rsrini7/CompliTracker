import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../services/authService';

const ForgotPassword = () => {
  const [status, setStatus] = useState({ type: null, message: '' });

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setStatus({ type: null, message: '' });
      await authService.requestPasswordReset(values.email);
      setStatus({
        type: 'success',
        message: 'Password reset instructions have been sent to your email.'
      });
      resetForm();
    } catch (err) {
      setStatus({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to process your request. Please try again.'
      });
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
          <h3 className="text-center mb-4">Forgot Password</h3>
          
          {status.message && (
            <Alert variant={status.type}>{status.message}</Alert>
          )}
          
          <Formik
            initialValues={{ email: '' }}
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
              isSubmitting
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
                  <Form.Text className="text-muted">
                    We'll send password reset instructions to this email.
                  </Form.Text>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-100 mb-3"
                >
                  {isSubmitting ? 'Sending...' : 'Reset Password'}
                </Button>
              </Form>
            )}
          </Formik>
          
          <div className="text-center mt-3">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="text-decoration-none">
                Back to Login
              </Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ForgotPassword;