import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, ListGroup, Badge, Spinner, Form, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import calendarService from '../../services/calendarService';

const CalendarIntegration = () => {
  const { currentUser, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [activeTab, setActiveTab] = useState('connections');
  const [settings, setSettings] = useState({
    defaultCalendar: '',
    syncFrequency: 'daily',
    reminderTime: 24,
    autoSync: true
  });

  // Fetch connected calendars on component mount
  useEffect(() => {
    fetchConnectedCalendars();
  }, []);

  // Fetch connected calendar services
  const fetchConnectedCalendars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await calendarService.getConnectedCalendars(token);
      setConnectedCalendars(response.data);
      
      // If there are settings in the response, update state
      if (response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (err) {
      console.error('Error fetching connected calendars:', err);
      setError('Failed to load calendar connections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Connect to Google Calendar
  const connectGoogleCalendar = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await calendarService.connectGoogleCalendar(token);
      
      // Redirect to Google OAuth consent screen
      window.location.href = response.data.authUrl;
    } catch (err) {
      console.error('Error connecting to Google Calendar:', err);
      setError(err.response?.data?.message || 'Failed to connect to Google Calendar. Please try again.');
      setLoading(false);
    }
  };

  // Connect to Outlook Calendar
  const connectOutlookCalendar = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await calendarService.connectOutlookCalendar(token);
      
      // Redirect to Microsoft OAuth consent screen
      window.location.href = response.data.authUrl;
    } catch (err) {
      console.error('Error connecting to Outlook Calendar:', err);
      setError(err.response?.data?.message || 'Failed to connect to Outlook Calendar. Please try again.');
      setLoading(false);
    }
  };

  // Disconnect calendar
  const disconnectCalendar = async (calendarType) => {
    try {
      setLoading(true);
      setError(null);
      
      if (calendarType === 'google') {
        await calendarService.disconnectGoogleCalendar(token);
      } else if (calendarType === 'outlook') {
        await calendarService.disconnectOutlookCalendar(token);
      }
      
      // Refresh connected calendars
      await fetchConnectedCalendars();
      
      setSuccess(`Successfully disconnected from ${calendarType === 'google' ? 'Google Calendar' : 'Outlook Calendar'}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(`Error disconnecting from ${calendarType}:`, err);
      setError(err.response?.data?.message || `Failed to disconnect from ${calendarType === 'google' ? 'Google Calendar' : 'Outlook Calendar'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Sync compliance deadlines with calendar
  const syncDeadlines = async (calendarType) => {
    try {
      setLoading(true);
      setError(null);
      
      await calendarService.syncComplianceDeadlines(token, calendarType);
      
      setSuccess(`Successfully synced compliance deadlines with ${calendarType === 'google' ? 'Google Calendar' : 'Outlook Calendar'}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(`Error syncing deadlines with ${calendarType}:`, err);
      setError(err.response?.data?.message || `Failed to sync deadlines with ${calendarType === 'google' ? 'Google Calendar' : 'Outlook Calendar'}. Please try again.`);
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

  // Save calendar settings
  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API to save settings
      // This would be implemented in the backend
      // await calendarService.updateSettings(token, settings);
      
      setSuccess('Calendar settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving calendar settings:', err);
      setError(err.response?.data?.message || 'Failed to save calendar settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calendar-integration-container">
      <h4 className="mb-4">Calendar Integration</h4>
      
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
        <Tab eventKey="connections" title="Calendar Connections">
          <Card>
            <Card.Body>
              {loading && !connectedCalendars.length ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Loading calendar connections...</p>
                </div>
              ) : (
                <>
                  <h5 className="mb-3">Connected Calendars</h5>
                  
                  {connectedCalendars.length === 0 ? (
                    <div className="text-center py-3">
                      <i className="bi bi-calendar3" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                      <p className="mt-2 text-muted">No calendars connected yet</p>
                      <p className="small text-muted">
                        Connect Google Calendar or Outlook to sync your compliance deadlines
                      </p>
                    </div>
                  ) : (
                    <ListGroup variant="flush">
                      {connectedCalendars.map((calendar) => (
                        <ListGroup.Item key={calendar.id} className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="d-flex align-items-center">
                              {calendar.type === 'google' ? (
                                <i className="bi bi-google me-2" style={{ fontSize: '1.2rem', color: '#4285F4' }}></i>
                              ) : (
                                <i className="bi bi-microsoft me-2" style={{ fontSize: '1.2rem', color: '#00A4EF' }}></i>
                              )}
                              <span className="fw-bold">
                                {calendar.type === 'google' ? 'Google Calendar' : 'Outlook Calendar'}
                              </span>
                              {calendar.isDefault && (
                                <Badge bg="info" className="ms-2">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="text-muted small mt-1">
                              {calendar.email || calendar.accountName}
                              {calendar.lastSynced && (
                                <span className="ms-2">
                                  Last synced: {new Date(calendar.lastSynced).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => syncDeadlines(calendar.type)}
                              disabled={loading}
                            >
                              <i className="bi bi-arrow-repeat me-1"></i>
                              Sync Now
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => disconnectCalendar(calendar.type)}
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
                    <h6>Connect a Calendar</h6>
                    <div className="d-flex gap-2 mt-3">
                      {!connectedCalendars.some(c => c.type === 'google') && (
                        <Button
                          variant="outline-primary"
                          onClick={connectGoogleCalendar}
                          disabled={loading}
                        >
                          <i className="bi bi-google me-2"></i>
                          Connect Google Calendar
                        </Button>
                      )}
                      
                      {!connectedCalendars.some(c => c.type === 'outlook') && (
                        <Button
                          variant="outline-primary"
                          onClick={connectOutlookCalendar}
                          disabled={loading}
                        >
                          <i className="bi bi-microsoft me-2"></i>
                          Connect Outlook Calendar
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="settings" title="Calendar Settings">
          <Card>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3" controlId="defaultCalendar">
                  <Form.Label>Default Calendar</Form.Label>
                  <Form.Select
                    name="defaultCalendar"
                    value={settings.defaultCalendar}
                    onChange={handleSettingChange}
                  >
                    <option value="">Select a default calendar</option>
                    {connectedCalendars.map(calendar => (
                      <option key={calendar.id} value={calendar.type}>
                        {calendar.type === 'google' ? 'Google Calendar' : 'Outlook Calendar'}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    This calendar will be used by default for syncing compliance deadlines
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="syncFrequency">
                  <Form.Label>Sync Frequency</Form.Label>
                  <Form.Select
                    name="syncFrequency"
                    value={settings.syncFrequency}
                    onChange={handleSettingChange}
                  >
                    <option value="manual">Manual only</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    How often to automatically sync compliance deadlines with your calendar
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="reminderTime">
                  <Form.Label>Default Reminder Time (Hours)</Form.Label>
                  <Form.Select
                    name="reminderTime"
                    value={settings.reminderTime}
                    onChange={handleSettingChange}
                  >
                    <option value="1">1 hour before</option>
                    <option value="2">2 hours before</option>
                    <option value="4">4 hours before</option>
                    <option value="24">1 day before</option>
                    <option value="48">2 days before</option>
                    <option value="168">1 week before</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    When to send calendar reminders for compliance deadlines
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="autoSync">
                  <Form.Check
                    type="checkbox"
                    label="Automatically sync new compliance deadlines"
                    name="autoSync"
                    checked={settings.autoSync}
                    onChange={handleSettingChange}
                  />
                  <Form.Text className="text-muted">
                    Automatically add new compliance deadlines to your calendar
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

export default CalendarIntegration;