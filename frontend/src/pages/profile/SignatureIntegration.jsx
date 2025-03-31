import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, ListGroup, Badge, Spinner, Form, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import signatureService from '../../services/signatureService';

const SignatureIntegration = () => {
  const { currentUser, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [providers, setProviders] = useState([]);
  const [activeTab, setActiveTab] = useState('providers');
  const [settings, setSettings] = useState({
    defaultProvider: '',
    signatureExpiration: 7,
    reminderFrequency: 2,
    allowSignatureDrawing: true,
    allowSignatureTyping: true,
    allowSignatureUpload: true
  });

  // Fetch signature providers on component mount
  useEffect(() => {
    fetchSignatureProviders();
  }, []);

  // Fetch available signature providers
  const fetchSignatureProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await signatureService.getSignatureProviders(token);
      setProviders(response.data);
      
      // If there are settings in the response, update state
      if (response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (err) {
      console.error('Error fetching signature providers:', err);
      setError('Failed to load signature providers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Connect to DocuSign
  const connectDocuSign = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await signatureService.getDocuSignAuthUrl(token);
      
      // Redirect to DocuSign OAuth consent screen
      window.location.href = response.data.authUrl;
    } catch (err) {
      console.error('Error connecting to DocuSign:', err);
      setError(err.response?.data?.message || 'Failed to connect to DocuSign. Please try again.');
      setLoading(false);
    }
  };

  // Connect to Adobe Sign
  const connectAdobeSign = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await signatureService.getAdobeSignAuthUrl(token);
      
      // Redirect to Adobe Sign OAuth consent screen
      window.location.href = response.data.authUrl;
    } catch (err) {
      console.error('Error connecting to Adobe Sign:', err);
      setError(err.response?.data?.message || 'Failed to connect to Adobe Sign. Please try again.');
      setLoading(false);
    }
  };

  // Disconnect from signature provider
  const disconnectProvider = async (providerType) => {
    try {
      setLoading(true);
      setError(null);
      
      await signatureService.disconnectProvider(token, providerType);
      
      // Refresh providers
      await fetchSignatureProviders();
      
      setSuccess(`Successfully disconnected from ${providerType === 'docusign' ? 'DocuSign' : 'Adobe Sign'}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(`Error disconnecting from ${providerType}:`, err);
      setError(err.response?.data?.message || `Failed to disconnect from ${providerType === 'docusign' ? 'DocuSign' : 'Adobe Sign'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle settings change
  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Save signature settings
  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await signatureService.updateSettings(token, settings);
      
      setSuccess('Signature settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving signature settings:', err);
      setError(err.response?.data?.message || 'Failed to save signature settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signature-integration-container">
      <h4 className="mb-4">Digital Signature Integration</h4>
      
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
        <Tab eventKey="providers" title="Signature Providers">
          <Card>
            <Card.Body>
              {loading && !providers.length ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Loading signature providers...</p>
                </div>
              ) : (
                <>
                  <h5 className="mb-3">Connected Providers</h5>
                  
                  {providers.length === 0 ? (
                    <div className="text-center py-3">
                      <i className="bi bi-pen" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                      <p className="mt-2 text-muted">No signature providers connected yet</p>
                      <p className="small text-muted">
                        Connect DocuSign or Adobe Sign to enable digital signatures for your documents
                      </p>
                    </div>
                  ) : (
                    <ListGroup variant="flush">
                      {providers.map((provider) => (
                        <ListGroup.Item key={provider.id} className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="d-flex align-items-center">
                              {provider.type === 'docusign' ? (
                                <i className="bi bi-pen-fill me-2" style={{ fontSize: '1.2rem', color: '#2B5796' }}></i>
                              ) : (
                                <i className="bi bi-pen-fill me-2" style={{ fontSize: '1.2rem', color: '#EB1C26' }}></i>
                              )}
                              <span className="fw-bold">
                                {provider.type === 'docusign' ? 'DocuSign' : 'Adobe Sign'}
                              </span>
                              {provider.isDefault && (
                                <Badge bg="info" className="ms-2">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="text-muted small mt-1">
                              {provider.email || provider.accountName}
                              {provider.expiresAt && (
                                <span className="ms-2">
                                  Expires: {new Date(provider.expiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => {
                                setSettings({
                                  ...settings,
                                  defaultProvider: provider.type
                                });
                                saveSettings();
                              }}
                              disabled={loading || provider.isDefault}
                            >
                              Set as Default
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => disconnectProvider(provider.type)}
                              disabled={loading}
                            >
                              <i className="bi bi-x-circle me-1"></i>
                              Disconnect
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                  
                  <div className="mt-4">
                    <h6>Connect a Signature Provider</h6>
                    <div className="d-flex gap-2 mt-3">
                      {!providers.some(p => p.type === 'docusign') && (
                        <Button
                          variant="outline-primary"
                          onClick={connectDocuSign}
                          disabled={loading}
                        >
                          <i className="bi bi-pen me-2"></i>
                          Connect DocuSign
                        </Button>
                      )}
                      
                      {!providers.some(p => p.type === 'adobesign') && (
                        <Button
                          variant="outline-primary"
                          onClick={connectAdobeSign}
                          disabled={loading}
                        >
                          <i className="bi bi-pen me-2"></i>
                          Connect Adobe Sign
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="settings" title="Signature Settings">
          <Card>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3" controlId="defaultProvider">
                  <Form.Label>Default Signature Provider</Form.Label>
                  <Form.Select
                    name="defaultProvider"
                    value={settings.defaultProvider}
                    onChange={handleSettingChange}
                  >
                    <option value="">Select a default provider</option>
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.type}>
                        {provider.type === 'docusign' ? 'DocuSign' : 'Adobe Sign'}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    This provider will be used by default when requesting signatures
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="signatureExpiration">
                  <Form.Label>Signature Request Expiration (Days)</Form.Label>
                  <Form.Select
                    name="signatureExpiration"
                    value={settings.signatureExpiration}
                    onChange={handleSettingChange}
                  >
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Signature requests will expire after this many days
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="reminderFrequency">
                  <Form.Label>Reminder Frequency (Days)</Form.Label>
                  <Form.Select
                    name="reminderFrequency"
                    value={settings.reminderFrequency}
                    onChange={handleSettingChange}
                  >
                    <option value="0">No reminders</option>
                    <option value="1">Every day</option>
                    <option value="2">Every 2 days</option>
                    <option value="3">Every 3 days</option>
                    <option value="7">Every week</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    How often to send reminders to signatories who haven't signed
                  </Form.Text>
                </Form.Group>
                
                <h6 className="mt-4 mb-3">Signature Methods</h6>
                
                <Form.Group className="mb-3" controlId="allowSignatureDrawing">
                  <Form.Check
                    type="checkbox"
                    label="Allow signature drawing"
                    name="allowSignatureDrawing"
                    checked={settings.allowSignatureDrawing}
                    onChange={handleSettingChange}
                  />
                  <Form.Text className="text-muted">
                    Allow signatories to draw their signature using mouse or touchscreen
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="allowSignatureTyping">
                  <Form.Check
                    type="checkbox"
                    label="Allow signature typing"
                    name="allowSignatureTyping"
                    checked={settings.allowSignatureTyping}
                    onChange={handleSettingChange}
                  />
                  <Form.Text className="text-muted">
                    Allow signatories to type their signature using different fonts
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="allowSignatureUpload">
                  <Form.Check
                    type="checkbox"
                    label="Allow signature image upload"
                    name="allowSignatureUpload"
                    checked={settings.allowSignatureUpload}
                    onChange={handleSettingChange}
                  />
                  <Form.Text className="text-muted">
                    Allow signatories to upload an image of their signature
                  </Form.Text>
                </Form.Group>
                
                <div className="d-flex justify-content-end mt-4">
                  <Button
                    variant="primary"
                    onClick={saveSettings}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
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

export default SignatureIntegration;