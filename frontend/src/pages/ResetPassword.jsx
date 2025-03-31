import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../services/authService';

const ResetPassword = () => {
  const [status, setStatus] = useState({ type: null, message: '' });
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    
    if (!token) {
      setStatus({
        type: 'danger',
        message: 'Invalid or missing reset token. Please request a new password reset link.'
      });
    } else {
      setResetToken(token);
    }
  }, [location]);

  // Validation schema
  const validationSchema = Yup.object({
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setStatus({ type: null, message: '' });
      
      if (!resetToken) {
        setStatus({
          type: 'danger',
          message: 'Invalid or missing reset token. Please request a new password reset link.'
        });
        return;
      }
      
      await authService.resetPassword(resetToken, values.password);
      
      setStatus({
        type: 'success',
        message: 'Your password has been reset successfully!'
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Your password has been reset successfully. Please login with your new password.' }
        });
      }, 3000);
    } catch (err) {
      setStatus({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to reset password. Please try again.'
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
          <h3 className="text-center mb-4">Reset Password</h3>
          
          {status.message && (
            <Alert variant={status.type}>{status.message}</Alert>
          )}
          
          {resetToken && (
            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
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
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.password && errors.password}
                      placeholder="Enter new password"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="confirmPassword">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.confirmPassword && errors.confirmPassword}
                      placeholder="Confirm new password"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-100 mb-3"
                  >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </Form>
              )}
            </Formik>
          )}
          
          <div className="text-center mt-3">
            <p>
              <Link to="/forgot-password" className="text-decoration-none">
                Request a new reset link
              </Link>
              {' | '}
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

export default ResetPassword;