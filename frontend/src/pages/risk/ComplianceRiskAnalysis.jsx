import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table, Badge, ProgressBar, Tabs, Tab, ListGroup } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import riskAnalysisService from '../../services/riskAnalysisService';
import complianceService from '../../services/complianceService';

const ComplianceRiskAnalysis = () => {
  const { id } = useParams();
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [riskFactors, setRiskFactors] = useState([]);
  const [mitigations, setMitigations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [riskHistory, setRiskHistory] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);

  // Fetch compliance and risk data on component mount
  useEffect(() => {
    fetchComplianceAndRiskData();
  }, [id]);

  // Fetch compliance item and its risk analysis
  const fetchComplianceAndRiskData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get compliance item details
      const complianceResponse = await complianceService.getComplianceById(token, id);
      setCompliance(complianceResponse.data);
      
      // Get risk analysis for this compliance item
      const riskResponse = await riskAnalysisService.getComplianceRiskAnalysis(token, id);
      setRiskAnalysis(riskResponse.data);
      
      // Get risk factors for this compliance item
      const factorsResponse = await riskAnalysisService.getRiskFactors(token, id);
      setRiskFactors(factorsResponse.data);
      
      // Get risk mitigation recommendations
      if (riskResponse.data?.riskId) {
        const mitigationsResponse = await riskAnalysisService.getRiskMitigationRecommendations(token, riskResponse.data.riskId);
        setMitigations(mitigationsResponse.data);
      }
      
      // Get risk analysis history
      const historyResponse = await riskAnalysisService.getRiskAnalysisHistory(token, 'compliance', id);
      setRiskHistory(historyResponse.data);
    } catch (err) {
      console.error('Error fetching compliance risk data:', err);
      setError('Failed to load risk analysis data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Run new risk assessment
  const runRiskAssessment = async () => {
    try {
      setLoadingAction(true);
      setError(null);
      
      await riskAnalysisService.runComplianceRiskAssessment(token, id);
      
      // Refresh data
      await fetchComplianceAndRiskData();
      
      setActiveTab('overview');
    } catch (err) {
      console.error('Error running risk assessment:', err);
      setError('Failed to run risk assessment. Please try again.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Apply risk mitigation
  const applyMitigation = async (mitigationId) => {
    try {
      setLoadingAction(true);
      setError(null);
      
      await riskAnalysisService.applyRiskMitigation(token, riskAnalysis.riskId, {
        mitigationId,
        complianceId: id
      });
      
      // Refresh data
      await fetchComplianceAndRiskData();
    } catch (err) {
      console.error('Error applying mitigation:', err);
      setError('Failed to apply mitigation strategy. Please try again.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Get risk level badge variant
  const getRiskBadgeVariant = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
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
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString(undefined, options);
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
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h2 className="mb-1">Risk Analysis: {compliance?.title}</h2>
              <p className="text-muted">AI-powered risk assessment and mitigation recommendations</p>
            </div>
            <div>
              <Button 
                variant="outline-secondary" 
                className="me-2"
                onClick={() => navigate(`/compliance/${id}`)}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Back to Compliance
              </Button>
              <Button 
                variant="primary"
                onClick={runRiskAssessment}
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Running...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lightning-charge me-1"></i>
                    Run New Assessment
                  </>
                )}
              </Button>
            </div>
          </div>
          
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
          <Row className="mb-4">
            <Col lg={4}>
              <Card className="h-100">
                <Card.Body className="text-center">
                  <h5 className="mb-3">Risk Score</h5>
                  
                  <div className="risk-score-circle mb-3">
                    <div 
                      className={`risk-score-value bg-${getRiskScoreColor(riskAnalysis?.riskScore || 0)}`}
                      style={{ fontSize: '2.5rem' }}
                    >
                      {riskAnalysis?.riskScore || 0}
                    </div>
                  </div>
                  
                  <Badge 
                    bg={getRiskBadgeVariant(riskAnalysis?.riskLevel || 'medium')} 
                    className="px-3 py-2"
                    style={{ fontSize: '1rem' }}
                  >
                    {riskAnalysis?.riskLevel || 'Medium'} Risk
                  </Badge>
                  
                  <div className="mt-3 text-muted">
                    Last assessed: {riskAnalysis?.lastUpdated ? formatDate(riskAnalysis.lastUpdated) : 'N/A'}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={8}>
              <Card className="h-100">
                <Card.Body>
                  <h5 className="mb-3">Risk Assessment Summary</h5>
                  
                  <div className="mb-4">
                    <p>{riskAnalysis?.summary || 'No risk assessment summary available.'}</p>
                  </div>
                  
                  <h6 className="mb-2">Risk Factors</h6>
                  
                  {riskFactors.length === 0 ? (
                    <p className="text-muted">No specific risk factors identified.</p>
                  ) : (
                    <div>
                      {riskFactors.slice(0, 3).map((factor) => (
                        <div key={factor.id} className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold">{factor.name}</span>
                            <Badge bg={getRiskBadgeVariant(factor.impact)}>{factor.impact}</Badge>
                          </div>
                          <p className="text-muted small mb-0">{factor.description}</p>
                        </div>
                      ))}
                      
                      {riskFactors.length > 3 && (
                        <Button 
                          variant="link" 
                          className="p-0" 
                          onClick={() => setActiveTab('factors')}
                        >
                          View all {riskFactors.length} risk factors
                        </Button>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Compliance Details</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Table className="table-borderless">
                        <tbody>
                          <tr>
                            <th style={{ width: '30%' }}>Title:</th>
                            <td>{compliance?.title}</td>
                          </tr>
                          <tr>
                            <th>Status:</th>
                            <td>
                              <Badge 
                                bg={compliance?.status?.toLowerCase() === 'completed' ? 'success' : 
                                   compliance?.status?.toLowerCase() === 'overdue' ? 'danger' : 'warning'}
                              >
                                {compliance?.status}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <th>Due Date:</th>
                            <td>{compliance?.dueDate ? formatDate(compliance.dueDate) : 'N/A'}</td>
                          </tr>
                          <tr>
                            <th>Priority:</th>
                            <td>
                              <Badge 
                                bg={compliance?.priority?.toLowerCase() === 'high' ? 'danger' : 
                                   compliance?.priority?.toLowerCase() === 'medium' ? 'warning' : 'success'}
                              >
                                {compliance?.priority}
                              </Badge>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                    <Col md={6}>
                      <Table className="table-borderless">
                        <tbody>
                          <tr>
                            <th style={{ width: '30%' }}>Category:</th>
                            <td>{compliance?.category}</td>
                          </tr>
                          <tr>
                            <th>Assigned To:</th>
                            <td>{compliance?.assignedTo?.name || 'Unassigned'}</td>
                          </tr>
                          <tr>
                            <th>Created:</th>
                            <td>{compliance?.createdAt ? formatDate(compliance.createdAt) : 'N/A'}</td>
                          </tr>
                          <tr>
                            <th>Last Updated:</th>
                            <td>{compliance?.updatedAt ? formatDate(compliance.updatedAt) : 'N/A'}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Recommended Mitigations</h5>
                </Card.Header>
                <Card.Body>
                  {mitigations.length === 0 ? (
                    <div className="text-center py-3">
                      <p className="text-muted">No mitigation recommendations available.</p>
                    </div>
                  ) : (
                    <ListGroup variant="flush">
                      {mitigations.map((mitigation) => (
                        <ListGroup.Item key={mitigation.id} className="py-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{mitigation.title}</h6>
                              <p className="mb-2">{mitigation.description}</p>
                              
                              <div className="d-flex align-items-center small text-muted">
                                <span className="me-3">
                                  <i className="bi bi-graph-down me-1"></i>
                                  Risk Reduction: {mitigation.riskReduction}%
                                </span>
                                <span>
                                  <i className="bi bi-clock me-1"></i>
                                  Estimated Effort: {mitigation.effort}
                                </span>
                              </div>
                            </div>
                            <div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => applyMitigation(mitigation.id)}
                                disabled={loadingAction || mitigation.applied}
                              >
                                {mitigation.applied ? (
                                  <>
                                    <i className="bi bi-check-circle me-1"></i>
                                    Applied
                                  </>
                                ) : loadingAction ? (
                                  <>
                                    <Spinner animation="border" size="sm" className="me-1" />
                                    Applying...
                                  </>
                                ) : (
                                  'Apply Mitigation'
                                )}
                              </Button>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="factors" title="Risk Factors">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Detailed Risk Factors</h5>
            </Card.Header>
            <Card.Body>
              {riskFactors.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted">No risk factors identified for this compliance item.</p>
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
        </Tab>
        
        <Tab eventKey="history" title="Assessment History">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Risk Assessment History</h5>
            </Card.Header>
            <Card.Body>
              {riskHistory.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted">No previous risk assessments found.</p>
                </div>
              ) : (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Risk Score</th>
                      <th>Risk Level</th>
                      <th>Assessed By</th>
                      <th>Changes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskHistory.map((history) => (
                      <tr key={history.id}>
                        <td>{formatDate(history.assessedAt)}</td>
                        <td>
                          <Badge bg={getRiskScoreColor(history.riskScore)}>
                            {history.riskScore}/100
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getRiskBadgeVariant(history.riskLevel)}>
                            {history.riskLevel}
                          </Badge>
                        </td>
                        <td>{history.assessedBy || 'AI System'}</td>
                        <td>
                          {history.changes ? (
                            <ul className="mb-0 ps-3">
                              {history.changes.map((change, index) => (
                                <li key={index}>{change}</li>
                              ))}
                            </ul>
                          ) : (
                            'Initial assessment'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="predictions" title="Risk Predictions">
          <Card>
            <Card.Body>
              <h5 className="mb-4">AI-Based Risk Predictions</h5>
              
              <Alert variant="info">
                <i className="bi bi-info-circle-fill me-2"></i>
                Our AI analyzes this compliance item to predict potential future risks. These predictions help you take proactive measures before issues arise.
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
                  {riskAnalysis?.predictions?.map((prediction, index) => (
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
                  {(!riskAnalysis?.predictions || riskAnalysis.predictions.length === 0) && (
                    <tr>
                      <td colSpan="5" className="text-center py-3">
                        <p className="text-muted mb-0">No risk predictions available for this compliance item.</p>
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

export default ComplianceRiskAnalysis;