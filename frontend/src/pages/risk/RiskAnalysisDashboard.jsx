import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table, Badge, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import riskAnalysisService from '../../services/riskAnalysisService';
import complianceService from '../../services/complianceService';

const RiskAnalysisDashboard = () => {
  const { currentUser, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organizationRisk, setOrganizationRisk] = useState(null);
  const [highRiskItems, setHighRiskItems] = useState([]);
  const [riskFactors, setRiskFactors] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [complianceAreas, setComplianceAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [areaRiskFactors, setAreaRiskFactors] = useState([]);
  const [loadingAreaFactors, setLoadingAreaFactors] = useState(false);

  // Fetch risk data on component mount
  useEffect(() => {
    fetchRiskData();
    fetchComplianceAreas();
  }, []);

  // Fetch organization risk data
  const fetchRiskData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get organization risk score
      const orgRiskResponse = await riskAnalysisService.getOrganizationRiskScore(token);
      setOrganizationRisk(orgRiskResponse.data);
      
      // Get high risk compliance items
      const highRiskResponse = await complianceService.getComplianceItems(token, {
        riskLevel: 'high',
        limit: 5,
        sort: 'riskScore:desc'
      });
      setHighRiskItems(highRiskResponse.data);
      
      // Get overall risk factors
      const riskFactorsResponse = await riskAnalysisService.getRiskFactors(token, 'overall');
      setRiskFactors(riskFactorsResponse.data);
    } catch (err) {
      console.error('Error fetching risk data:', err);
      setError('Failed to load risk analysis data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch compliance areas
  const fetchComplianceAreas = async () => {
    try {
      const response = await complianceService.getComplianceAreas(token);
      setComplianceAreas(response.data);
      
      // Set first area as selected by default if available
      if (response.data.length > 0) {
        setSelectedArea(response.data[0].id);
        fetchAreaRiskFactors(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching compliance areas:', err);
    }
  };

  // Fetch risk factors for a specific compliance area
  const fetchAreaRiskFactors = async (areaId) => {
    try {
      setLoadingAreaFactors(true);
      const response = await riskAnalysisService.getRiskFactors(token, areaId);
      setAreaRiskFactors(response.data);
    } catch (err) {
      console.error(`Error fetching risk factors for area ${areaId}:`, err);
    } finally {
      setLoadingAreaFactors(false);
    }
  };

  // Handle area selection change
  const handleAreaChange = (areaId) => {
    setSelectedArea(areaId);
    fetchAreaRiskFactors(areaId);
  };

  // Get risk level badge variant
  const getRiskBadgeVariant = (riskLevel) => {
    switch (riskLevel.toLowerCase()) {
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

  // Get risk score color
  const getRiskScoreColor = (score) => {
    if (score >= 75) return 'danger';
    if (score >= 50) return 'warning';
    if (score >= 25) return 'info';
    return 'success';
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading risk analysis data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-2">Risk Analysis Dashboard</h2>
          <p className="text-muted">AI-powered risk assessment and mitigation recommendations</p>
          
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="overview" title="Risk Overview">
          {/* Organization Risk Score */}
          <Row className="mb-4">
            <Col lg={4}>
              <Card className="h-100">
                <Card.Body className="text-center">
                  <h5 className="mb-3">Organization Risk Score</h5>
                  
                  <div className="risk-score-circle mb-3">
                    <div 
                      className={`risk-score-value bg-${getRiskScoreColor(organizationRisk?.overallScore || 0)}`}
                      style={{ fontSize: '2rem' }}
                    >
                      {organizationRisk?.overallScore || 0}
                    </div>
                  </div>
                  
                  <Badge 
                    bg={getRiskBadgeVariant(organizationRisk?.riskLevel || 'medium')} 
                    className="px-3 py-2"
                    style={{ fontSize: '1rem' }}
                  >
                    {organizationRisk?.riskLevel || 'Medium'} Risk
                  </Badge>
                  
                  <div className="mt-3 text-muted">
                    Last updated: {organizationRisk?.lastUpdated ? formatDate(organizationRisk.lastUpdated) : 'N/A'}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={8}>
              <Card className="h-100">
                <Card.Body>
                  <h5 className="mb-3">Risk Distribution</h5>
                  
                  <Row className="mb-4">
                    <Col md={4}>
                      <div className="text-center mb-3">
                        <h3 className="text-danger mb-0">{organizationRisk?.highRiskCount || 0}</h3>
                        <div className="text-muted">High Risk Items</div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center mb-3">
                        <h3 className="text-warning mb-0">{organizationRisk?.mediumRiskCount || 0}</h3>
                        <div className="text-muted">Medium Risk Items</div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center mb-3">
                        <h3 className="text-success mb-0">{organizationRisk?.lowRiskCount || 0}</h3>
                        <div className="text-muted">Low Risk Items</div>
                      </div>
                    </Col>
                  </Row>
                  
                  <h6 className="mb-2">Risk by Compliance Area</h6>
                  
                  {organizationRisk?.areaScores?.map((area) => (
                    <div key={area.id} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span>{area.name}</span>
                        <span className="text-muted">{area.score}/100</span>
                      </div>
                      <ProgressBar 
                        variant={getRiskScoreColor(area.score)} 
                        now={area.score} 
                        min={0} 
                        max={100} 
                      />
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* High Risk Items */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">High Risk Compliance Items</h5>
                  <Link to="/compliance" className="btn btn-sm btn-outline-primary">View All</Link>
                </Card.Header>
                <Card.Body>
                  {highRiskItems.length === 0 ? (
                    <div className="text-center py-3">
                      <i className="bi bi-shield-check" style={{ fontSize: '2rem', color: '#28a745' }}></i>
                      <p className="mt-2 text-muted">No high risk compliance items found.</p>
                    </div>
                  ) : (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Risk Score</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {highRiskItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <Link to={`/compliance/${item.id}`} className="text-decoration-none">
                                {item.title}
                              </Link>
                            </td>
                            <td>
                              <Badge 
                                bg={getRiskBadgeVariant(item.riskLevel)} 
                                className="px-2 py-1"
                              >
                                {item.riskScore}/100
                              </Badge>
                            </td>
                            <td>{formatDate(item.dueDate)}</td>
                            <td>
                              <Badge 
                                bg={item.status.toLowerCase() === 'completed' ? 'success' : 
                                   item.status.toLowerCase() === 'overdue' ? 'danger' : 'warning'}
                              >
                                {item.status}
                              </Badge>
                            </td>
                            <td>
                              <Link 
                                to={`/risk-analysis/compliance/${item.id}`} 
                                className="btn btn-sm btn-outline-primary"
                              >
                                View Analysis
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Risk Factors */}
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Key Risk Factors</h5>
                </Card.Header>
                <Card.Body>
                  {riskFactors.length === 0 ? (
                    <div className="text-center py-3">
                      <p className="text-muted">No risk factors identified.</p>
                    </div>
                  ) : (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Factor</th>
                          <th>Impact</th>
                          <th>Description</th>
                          <th>Mitigation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riskFactors.map((factor) => (
                          <tr key={factor.id}>
                            <td className="fw-bold">{factor.name}</td>
                            <td>
                              <Badge 
                                bg={factor.impact.toLowerCase() === 'high' ? 'danger' : 
                                   factor.impact.toLowerCase() === 'medium' ? 'warning' : 'success'}
                              >
                                {factor.impact}
                              </Badge>
                            </td>
                            <td>{factor.description}</td>
                            <td>{factor.mitigation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="byArea" title="Risk by Area">
          <Row>
            <Col md={3} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Compliance Areas</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="list-group list-group-flush">
                    {complianceAreas.map((area) => (
                      <button
                        key={area.id}
                        className={`list-group-item list-group-item-action ${selectedArea === area.id ? 'active' : ''}`}
                        onClick={() => handleAreaChange(area.id)}
                      >
                        {area.name}
                      </button>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={9}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    {complianceAreas.find(a => a.id === selectedArea)?.name || 'Area'} Risk Factors
                  </h5>
                </Card.Header>
                <Card.Body>
                  {loadingAreaFactors ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" variant="primary" size="sm" />
                      <p className="mt-2 text-muted">Loading risk factors...</p>
                    </div>
                  ) : areaRiskFactors.length === 0 ? (
                    <div className="text-center py-3">
                      <p className="text-muted">No risk factors identified for this area.</p>
                    </div>
                  ) : (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Factor</th>
                          <th>Impact</th>
                          <th>Description</th>
                          <th>Mitigation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {areaRiskFactors.map((factor) => (
                          <tr key={factor.id}>
                            <td className="fw-bold">{factor.name}</td>
                            <td>
                              <Badge 
                                bg={factor.impact.toLowerCase() === 'high' ? 'danger' : 
                                   factor.impact.toLowerCase() === 'medium' ? 'warning' : 'success'}
                              >
                                {factor.impact}
                              </Badge>
                            </td>
                            <td>{factor.description}</td>
                            <td>{factor.mitigation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="predictions" title="Risk Predictions">
          <Card>
            <Card.Body>
              <h5 className="mb-4">AI-Based Risk Predictions</h5>
              
              <Alert variant="info">
                <i className="bi bi-info-circle-fill me-2"></i>
                Our AI analyzes your compliance data to predict potential future risks. These predictions help you take proactive measures before issues arise.
              </Alert>
              
              <Table responsive>
                <thead>
                  <tr>
                    <th>Prediction</th>
                    <th>Probability</th>
                    <th>Impact</th>
                    <th>Timeframe</th>
                    <th>Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {organizationRisk?.predictions?.map((prediction, index) => (
                    <tr key={index}>
                      <td>{prediction.description}</td>
                      <td>
                        <Badge 
                          bg={prediction.probability > 75 ? 'danger' : 
                             prediction.probability > 50 ? 'warning' : 
                             prediction.probability > 25 ? 'info' : 'success'}
                        >
                          {prediction.probability}%
                        </Badge>
                      </td>
                      <td>
                        <Badge 
                          bg={prediction.impact.toLowerCase() === 'high' ? 'danger' : 
                             prediction.impact.toLowerCase() === 'medium' ? 'warning' : 'success'}
                        >
                          {prediction.impact}
                        </Badge>
                      </td>
                      <td>{prediction.timeframe}</td>
                      <td>{prediction.recommendation}</td>
                    </tr>
                  ))}
                  
                  {/* Fallback if no predictions */}
                  {(!organizationRisk?.predictions || organizationRisk.predictions.length === 0) && (
                    <tr>
                      <td colSpan="5" className="text-center py-3">
                        <p className="text-muted mb-0">No risk predictions available. Continue adding compliance data to enable AI predictions.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default RiskAnalysisDashboard;