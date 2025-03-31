import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import documentService from '../../services/documentService';

const DocumentUpload = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    expiryDate: '',
    requiresSignature: false,
    signatories: []
  });
  const [signatory, setSignatory] = useState({ email: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    // Create preview for supported file types
    if (selectedFile.type === 'application/pdf' || selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
    
    // Auto-fill name if empty
    if (!formData.name) {
      setFormData({
        ...formData,
        name: selectedFile.name.split('.')[0] // Remove file extension
      });
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle signatory input changes
  const handleSignatoryChange = (e) => {
    const { name, value } = e.target;
    setSignatory({
      ...signatory,
      [name]: value
    });
  };

  // Add signatory to the list
  const addSignatory = () => {
    if (!signatory.email || !signatory.name) return;
    
    setFormData({
      ...formData,
      signatories: [...formData.signatories, signatory]
    });
    
    // Clear signatory form
    setSignatory({ email: '', name: '' });
  };

  // Remove signatory from the list
  const removeSignatory = (index) => {
    const updatedSignatories = [...formData.signatories];
    updatedSignatories.splice(index, 1);
    
    setFormData({
      ...formData,
      signatories: updatedSignatories
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (formData.requiresSignature && formData.signatories.length === 0) {
      setError('Please add at least one signatory');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);
      
      // Create a custom axios instance with upload progress tracking
      const uploadWithProgress = async () => {
        const formDataToSend = new FormData();
        formDataToSend.append('file', file);
        
        // Add document metadata
        Object.keys(formData).forEach(key => {
          if (key === 'signatories') {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        });
        
        const response = await documentService.uploadDocument(
          currentUser.token, 
          formData, 
          file, 
          (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        );
        
        return response;
      };
      
      const response = await uploadWithProgress();
      
      setSuccess(true);
      
      // If document requires signature, initiate signature request
      if (formData.requiresSignature && formData.signatories.length > 0) {
        await documentService.requestSignature(
          currentUser.token,
          response.data.id,
          { signatories: formData.signatories }
        );
      }
      
      // Redirect to document list after a short delay
      setTimeout(() => {
        navigate('/documents');
      }, 2000);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload document. Please try again.');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3">Upload Document</h1>
          <p className="text-muted">Upload and manage your compliance documents</p>
        </Col>
      </Row>

      {success && (
        <Alert variant="success" className="mb-4">
          <Alert.Heading>Document Uploaded Successfully!</Alert.Heading>
          <p>
            Your document has been uploaded successfully.
            {formData.requiresSignature && ' A signature request has been sent to the specified signatories.'}
          </p>
          <p className="mb-0">Redirecting to document list...</p>
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12} className="mb-4">
                    <div className="document-upload-area p-4 border rounded text-center">
                      {!file ? (
                        <div>
                          <i className="bi bi-cloud-arrow-up text-primary" style={{ fontSize: '3rem' }}></i>
                          <p className="mt-3 mb-4">Drag and drop your file here, or click to browse</p>
                          <Form.Control 
                            type="file" 
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png" 
                            onChange={handleFileChange}
                            className="d-none"
                            id="document-upload"
                          />
                          <label htmlFor="document-upload" className="btn btn-primary">
                            Browse Files
                          </label>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-3 d-flex align-items-center justify-content-center">
                            {preview ? (
                              <div className="document-preview mb-3">
                                {file.type.startsWith('image/') ? (
                                  <img src={preview} alt="Preview" className="img-fluid" style={{ maxHeight: '200px' }} />
                                ) : (
                                  <iframe src={preview} title="Document Preview" width="100%" height="200px" />
                                )}
                              </div>
                            ) : (
                              <i className="bi bi-file-earmark-check text-success" style={{ fontSize: '3rem' }}></i>
                            )}
                          </div>
                          <p className="mb-2">{file.name}</p>
                          <p className="text-muted small mb-3">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => {
                              setFile(null);
                              setPreview(null);
                            }}
                          >
                            Remove File
                          </Button>
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group controlId="documentName">
                      <Form.Label>Document Name*</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group controlId="documentCategory">
                      <Form.Label>Category*</Form.Label>
                      <Form.Select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="compliance">Compliance</option>
                        <option value="contract">Contract</option>
                        <option value="policy">Policy</option>
                        <option value="report">Report</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group controlId="documentDescription">
                      <Form.Label>Description</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3} 
                        name="description" 
                        value={formData.description} 
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group controlId="documentExpiry">
                      <Form.Label>Expiry Date (if applicable)</Form.Label>
                      <Form.Control 
                        type="date" 
                        name="expiryDate" 
                        value={formData.expiryDate} 
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-4">
                    <Form.Group controlId="requiresSignature">
                      <Form.Check 
                        type="checkbox" 
                        label="This document requires digital signature" 
                        name="requiresSignature" 
                        checked={formData.requiresSignature} 
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>

                  {formData.requiresSignature && (
                    <Col md={12} className="mb-4">
                      <Card className="border-light bg-light">
                        <Card.Body>
                          <h5 className="mb-3">Signatories</h5>
                          
                          {formData.signatories.length > 0 && (
                            <div className="mb-3">
                              <div className="list-group">
                                {formData.signatories.map((sig, index) => (
                                  <div key={index} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                      <div className="fw-medium">{sig.name}</div>
                                      <div className="text-muted small">{sig.email}</div>
                                    </div>
                                    <Button 
                                      variant="link" 
                                      className="text-danger p-0" 
                                      onClick={() => removeSignatory(index)}
                                    >
                                      <i className="bi bi-x-circle"></i>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <Row>
                            <Col md={5}>
                              <Form.Group controlId="signatoryName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control 
                                  type="text" 
                                  name="name" 
                                  value={signatory.name} 
                                  onChange={handleSignatoryChange}
                                  placeholder="Enter name"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={5}>
                              <Form.Group controlId="signatoryEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control 
                                  type="email" 
                                  name="email" 
                                  value={signatory.email} 
                                  onChange={handleSignatoryChange}
                                  placeholder="Enter email"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={2} className="d-flex align-items-end">
                              <Button 
                                variant="outline-primary" 
                                className="w-100" 
                                onClick={addSignatory}
                                disabled={!signatory.name || !signatory.email}
                              >
                                Add
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}

                  {loading && (
                    <Col md={12} className="mb-3">
                      <ProgressBar 
                        now={uploadProgress} 
                        label={`${uploadProgress}%`} 
                        animated 
                        variant="primary" 
                      />
                    </Col>
                  )}

                  <Col md={12} className="mt-3">
                    <div className="d-flex justify-content-end">
                      <Button 
                        variant="secondary" 
                        className="me-2" 
                        onClick={() => navigate('/documents')}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading || !file}
                      >
                        {loading ? 'Uploading...' : 'Upload Document'}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-3">Document Guidelines</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Maximum file size: 10MB
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  For documents requiring signatures, add all signatories before uploading
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Properly categorize documents for easier management
                </li>
              </ul>
              
              <hr className="my-4" />
              
              <h5 className="mb-3">Digital Signature</h5>
              <p className="text-muted">
                Documents requiring signatures will be processed through our secure digital signature service. Signatories will receive an email with instructions to complete the signature process.
              </p>
              <p className="text-muted mb-0">
                Digital signatures are legally binding and comply with eSign regulations.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DocumentUpload;