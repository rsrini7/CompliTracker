import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import complianceService from '../services/complianceService';
import documentService from '../services/documentService';
import notificationService from '../services/notificationService';

const Dashboard = () => {
  const { currentUser, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch compliance statistics
        const statsResponse = await complianceService.getComplianceStats(token);
        setStats(statsResponse.data);

        // Fetch upcoming deadlines (next 30 days)
        const deadlinesResponse = await complianceService.getUpcomingDeadlines(token, 30);
        setUpcomingDeadlines(deadlinesResponse.data);

        // Fetch recent documents
        const documentsResponse = await documentService.getDocuments(token, { limit: 5, sort: 'createdAt:desc' });
        setRecentDocuments(documentsResponse.data);

        // Fetch recent notifications
        const notificationsResponse = await notificationService.getNotifications(token, { limit: 5, read: false });
        setNotifications(notificationsResponse.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Get priority badge variant
  const getPriorityVariant = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="dashboard-container py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-4">Welcome, {currentUser?.name || 'User'}!</h2>
          {error && <Alert variant="danger">{error}</Alert>}
        </Col>
      </Row>

      {/* Stats Overview */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-card text-center bg-primary text-white">
            <Card.Body>
              <h1>{stats?.total || 0}</h1>
              <Card.Title>Total Compliance Items</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card text-center bg-success text-white">
            <Card.Body>
              <h1>{stats?.completed || 0}</h1>
              <Card.Title>Completed</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card text-center bg-warning text-white">
            <Card.Body>
              <h1>{stats?.pending || 0}</h1>
              <Card.Title>Pending</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card text-center bg-danger text-white">
            <Card.Body>
              <h1>{stats?.overdue || 0}</h1>
              <Card.Title>Overdue</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Upcoming Deadlines */}
        <Col md={6} className="mb-4">
          <Card className="dashboard-card h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                Upcoming Deadlines
              </h5>
              <Link to="/compliance" className="btn btn-sm btn-outline-primary">View All</Link>
            </Card.Header>
            <Card.Body>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-muted text-center">No upcoming deadlines for the next 30 days.</p>
              ) : (
                <ListGroup variant="flush">
                  {upcomingDeadlines.map((item) => (
                    <ListGroup.Item key={item.id} className={`compliance-item ${item.priority.toLowerCase()}-priority`}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            <Link to={`/compliance/${item.id}`} className="text-decoration-none">
                              {item.title}
                            </Link>
                          </h6>
                          <p className="mb-1 small text-muted">
                            Due: {formatDate(item.dueDate)}
                          </p>
                        </div>
                        <div>
                          <Badge bg={getStatusVariant(item.status)} className="me-1">
                            {item.status}
                          </Badge>
                          <Badge bg={getPriorityVariant(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Documents */}
        <Col md={6} className="mb-4">
          <Card className="dashboard-card h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-file-earmark-text me-2"></i>
                Recent Documents
              </h5>
              <Link to="/documents" className="btn btn-sm btn-outline-primary">View All</Link>
            </Card.Header>
            <Card.Body>
              {recentDocuments.length === 0 ? (
                <div className="text-center">
                  <p className="text-muted">No documents found.</p>
                  <Link to="/documents/upload" className="btn btn-sm btn-primary">
                    <i className="bi bi-cloud-upload me-1"></i> Upload Document
                  </Link>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {recentDocuments.map((doc) => (
                    <ListGroup.Item key={doc.id} className="document-card">
                      <div className="d-flex align-items-center">
                        <div className="document-icon">
                          <i className={`bi bi-file-earmark-${doc.fileType === 'pdf' ? 'pdf' : 'text'} text-primary`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-0">
                            <Link to={`/documents/${doc.id}`} className="text-decoration-none">
                              {doc.name}
                            </Link>
                          </h6>
                          <p className="mb-0 small text-muted">
                            Uploaded: {formatDate(doc.createdAt)}
                          </p>
                        </div>
                        <Button variant="outline-secondary" size="sm" as={Link} to={`/documents/${doc.id}/download`}>
                          <i className="bi bi-download"></i>
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Notifications */}
      <Row>
        <Col md={12} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-bell me-2"></i>
                Recent Notifications
              </h5>
              <Button variant="outline-primary" size="sm" onClick={() => notificationService.markAllAsRead(token)}>
                Mark All as Read
              </Button>
            </Card.Header>
            <Card.Body>
              {notifications.length === 0 ? (
                <p className="text-muted text-center">No new notifications.</p>
              ) : (
                <ListGroup variant="flush">
                  {notifications.map((notification) => (
                    <ListGroup.Item key={notification.id}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{notification.title}</h6>
                          <p className="mb-1">{notification.message}</p>
                          <small className="text-muted">{formatDate(notification.createdAt)}</small>
                        </div>
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => notificationService.markAsRead(token, notification.id)}
                        >
                          Mark as Read
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;