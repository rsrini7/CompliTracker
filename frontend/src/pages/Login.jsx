import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import ssoService from '../services/ssoService';

const Login = () => {
  const { login, error } = useContext(AuthContext);
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [ssoProviders, setSsoProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Fetch available SSO providers on component mount
  useEffect(() => {
    const fetchSSOProviders = async () => {
      try {
        const response = await ssoService.getProviders();
        setSsoProviders(response.data || []);
      } catch (err) {
        console.error('Error fetching SSO providers:', err);
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchSSOProviders();
  }, []);

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    setLoginError(null);
    try {
      const success = await login(values);
      if (success) {
        // Redirect to the page the user was trying to access, or dashboard
        const redirectPath = location.state?.from?.pathname || '/dashboard';
        navigate(redirectPath);
      } else {
        setLoginError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setLoginError(err.message || 'An error occurred during login');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle SSO login
  const handleSSOLogin = async (provider) => {
    try {
      const response = await ssoService.initiateSSO(provider);
      
      // Redirect to provider's authorization URL
      window.location.href = response.data.authorizationUrl;
    } catch (err) {
      console.error(`Error initiating ${provider} login:`, err);
      setLoginError(`Failed to initiate ${provider} login. Please try again.`);
    }
  };

  // Get provider icon
  const getProviderIcon = (provider) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return 'bi-google';
      case 'microsoft':
      case 'azure':
        return 'bi-microsoft';
      case 'github':
        return 'bi-github';
      case 'facebook':
        return 'bi-facebook';
      case 'apple':
        return 'bi-apple';
      default:
        return 'bi-box-arrow-in-right';
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
            initialValues={{ email: '', password: '' }}
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
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
            )}
          </Formik>
          
          {/* SSO Login Options */}
          {ssoProviders.length > 0 && (
            <div className="mt-4">
              <div className="text-center mb-3">
                <span className="divider-text">Or continue with</span>
              </div>
              
              <Row className="g-2">
                {ssoProviders.map((provider) => (
                  <Col key={provider.id} xs={6}>
                    <Button
                      variant="outline-secondary"
                      className="w-100 d-flex align-items-center justify-content-center"
                      onClick={() => handleSSOLogin(provider.id)}
                    >
                      <i className={`bi ${getProviderIcon(provider.name)} me-2`}></i>
                      {provider.name}
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>
          )}
          
          <div className="text-center mt-3">
            <p>
              Don't have an account?{' '}
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