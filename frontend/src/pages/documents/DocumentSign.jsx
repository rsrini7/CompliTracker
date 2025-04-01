import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Form,
  Spinner,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import documentService from "../../services/documentService";

const DocumentSign = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [signatureRequest, setSignatureRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signatureData, setSignatureData] = useState({
    name: "",
    signatureType: "draw", // 'draw', 'type', or 'upload'
    signatureImage: null,
    typedSignature: "",
    signatureFont: "Indie Flower",
  });
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [canvasRef, setCanvasRef] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signingInProgress, setSigningInProgress] = useState(false);
  const [signatureComplete, setSignatureComplete] = useState(false);

  // Signature fonts
  const signatureFonts = [
    { name: "Indie Flower", label: "Handwritten" },
    { name: "Pacifico", label: "Cursive" },
    { name: "Roboto", label: "Standard" },
    { name: "Dancing Script", label: "Elegant" },
  ];

  // Fetch document and signature request details on component mount
  useEffect(() => {
    fetchDocumentAndSignatureDetails();

    // Load signature fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Dancing+Script&family=Indie+Flower&family=Pacifico&family=Roboto&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [id]);

  const fetchDocumentAndSignatureDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch document details
      const docResponse = await documentService.getDocumentById(
        currentUser?.token,
        id,
      );
      setDocument(docResponse.data);

      // Fetch signature request details
      if (docResponse.data.signatureId) {
        const signatureResponse = await documentService.checkSignatureStatus(
          currentUser?.token,
          docResponse.data.signatureId,
        );
        setSignatureRequest(signatureResponse.data);

        // Pre-fill name if current user is a signatory
        if (currentUser && signatureResponse.data.signatories) {
          const userSignatory = signatureResponse.data.signatories.find(
            (sig) => sig.email === currentUser.email,
          );

          if (userSignatory) {
            setSignatureData((prev) => ({
              ...prev,
              name: userSignatory.name,
            }));

            // Check if already signed
            if (userSignatory.status === "signed") {
              setSignatureComplete(true);
            }
          }
        }
      } else {
        setError("No signature request found for this document");
      }
    } catch (err) {
      console.error("Error fetching document details:", err);
      setError("Failed to load document details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle signature type change
  const handleSignatureTypeChange = (type) => {
    setSignatureData({
      ...signatureData,
      signatureType: type,
      signatureImage: null,
      typedSignature: "",
    });
    setSignaturePreview(null);

    // Clear canvas if switching from draw
    if (type !== "draw" && canvasRef) {
      const canvas = canvasRef;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Handle canvas reference
  const handleCanvasRef = (ref) => {
    setCanvasRef(ref);
    if (ref) {
      const ctx = ref.getContext("2d");
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000000";
    }
  };

  // Drawing functions
  const startDrawing = (e) => {
    const canvas = canvasRef;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef;
      const ctx = canvas.getContext("2d");
      ctx.closePath();
      setIsDrawing(false);

      // Save signature image
      setSignaturePreview(canvas.toDataURL("image/png"));
      setSignatureData({
        ...signatureData,
        signatureImage: canvas.toDataURL("image/png"),
      });
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    if (canvasRef) {
      const canvas = canvasRef;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignaturePreview(null);
      setSignatureData({
        ...signatureData,
        signatureImage: null,
      });
    }
  };

  // Handle typed signature change
  const handleTypedSignatureChange = (e) => {
    const value = e.target.value;
    setSignatureData({
      ...signatureData,
      typedSignature: value,
    });

    // Generate preview for typed signature
    if (value) {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      ctx.font = `30px "${signatureData.signatureFont}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(value, canvas.width / 2, canvas.height / 2);

      setSignaturePreview(canvas.toDataURL("image/png"));
      setSignatureData((prev) => ({
        ...prev,
        signatureImage: canvas.toDataURL("image/png"),
      }));
    } else {
      setSignaturePreview(null);
      setSignatureData((prev) => ({
        ...prev,
        signatureImage: null,
      }));
    }
  };

  // Handle signature font change
  const handleFontChange = (e) => {
    const font = e.target.value;
    setSignatureData((prev) => ({
      ...prev,
      signatureFont: font,
    }));

    // Update preview with new font
    if (signatureData.typedSignature) {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      ctx.font = `30px "${font}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        signatureData.typedSignature,
        canvas.width / 2,
        canvas.height / 2,
      );

      setSignaturePreview(canvas.toDataURL("image/png"));
      setSignatureData((prev) => ({
        ...prev,
        signatureImage: canvas.toDataURL("image/png"),
      }));
    }
  };

  // Handle file upload for signature
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignaturePreview(event.target.result);
      setSignatureData({
        ...signatureData,
        signatureImage: event.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  // Submit signature
  const submitSignature = async () => {
    if (!signatureData.name) {
      setError("Please enter your full name");
      return;
    }

    if (!signatureData.signatureImage) {
      setError("Please provide your signature");
      return;
    }

    try {
      setSigningInProgress(true);
      setError(null);

      // Submit signature to backend
      await documentService.signDocument(currentUser?.token, id, {
        name: signatureData.name,
        signatureImage: signatureData.signatureImage,
      });

      setSignatureComplete(true);
    } catch (err) {
      console.error("Error signing document:", err);
      setError(
        err.response?.data?.message ||
          "Failed to sign document. Please try again.",
      );
    } finally {
      setSigningInProgress(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading document...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-5">
        <Alert variant="danger">{error}</Alert>
        <div className="text-center mt-4">
          <Button variant="primary" onClick={() => navigate("/documents")}>
            Back to Documents
          </Button>
        </div>
      </Container>
    );
  }

  if (signatureComplete) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Body className="text-center p-5">
                <div className="mb-4">
                  <i
                    className="bi bi-check-circle-fill text-success"
                    style={{ fontSize: "4rem" }}
                  ></i>
                </div>
                <h2 className="mb-3">Document Signed Successfully!</h2>
                <p className="lead mb-4">
                  Thank you for signing the document. All parties will be
                  notified once everyone has completed their signatures.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/documents")}
                >
                  Back to Documents
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white py-3">
              <h4 className="mb-0">Sign Document: {document?.name}</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-4 mb-md-0">
                  <div className="document-preview-container border rounded p-3 h-100 d-flex flex-column">
                    <h5 className="mb-3">Document Preview</h5>
                    <div className="flex-grow-1 overflow-auto">
                      {document?.fileType === "pdf" ? (
                        <iframe
                          src={`${document?.previewUrl || "/api/documents/" + id + "/preview"}`}
                          title="Document Preview"
                          width="100%"
                          height="500px"
                          className="border-0"
                        />
                      ) : document?.fileType?.startsWith("image/") ? (
                        <img
                          src={`${document?.previewUrl || "/api/documents/" + id + "/preview"}`}
                          alt="Document Preview"
                          className="img-fluid"
                        />
                      ) : (
                        <div className="text-center py-5">
                          <i
                            className="bi bi-file-earmark-text text-muted"
                            style={{ fontSize: "4rem" }}
                          ></i>
                          <p className="mt-3">
                            Preview not available for this file type
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="signature-container">
                    <h5 className="mb-3">Your Signature</h5>

                    {/* Signature Type Selection */}
                    <div className="mb-4">
                      <div className="d-flex">
                        <Button
                          variant={
                            signatureData.signatureType === "draw"
                              ? "primary"
                              : "outline-primary"
                          }
                          className="me-2 flex-grow-1"
                          onClick={() => handleSignatureTypeChange("draw")}
                        >
                          <i className="bi bi-pencil me-2"></i>
                          Draw
                        </Button>
                        <Button
                          variant={
                            signatureData.signatureType === "type"
                              ? "primary"
                              : "outline-primary"
                          }
                          className="me-2 flex-grow-1"
                          onClick={() => handleSignatureTypeChange("type")}
                        >
                          <i className="bi bi-keyboard me-2"></i>
                          Type
                        </Button>
                        <Button
                          variant={
                            signatureData.signatureType === "upload"
                              ? "primary"
                              : "outline-primary"
                          }
                          className="flex-grow-1"
                          onClick={() => handleSignatureTypeChange("upload")}
                        >
                          <i className="bi bi-upload me-2"></i>
                          Upload
                        </Button>
                      </div>
                    </div>

                    {/* Name Input */}
                    <Form.Group className="mb-4">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={signatureData.name}
                        onChange={(e) =>
                          setSignatureData({
                            ...signatureData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter your full legal name"
                        required
                      />
                      <Form.Text className="text-muted">
                        This name will be associated with your signature
                      </Form.Text>
                    </Form.Group>

                    {/* Draw Signature */}
                    {signatureData.signatureType === "draw" && (
                      <div className="mb-4">
                        <div className="signature-canvas-container border rounded p-2 mb-3">
                          <canvas
                            ref={handleCanvasRef}
                            width={400}
                            height={200}
                            className="signature-canvas w-100"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            style={{ touchAction: "none" }}
                          />
                        </div>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={clearCanvas}
                        >
                          Clear
                        </Button>
                        <Form.Text className="d-block text-muted mt-2">
                          Draw your signature using your mouse or touchscreen
                        </Form.Text>
                      </div>
                    )}

                    {/* Type Signature */}
                    {signatureData.signatureType === "type" && (
                      <div className="mb-4">
                        <Form.Group className="mb-3">
                          <Form.Label>Type Your Signature</Form.Label>
                          <Form.Control
                            type="text"
                            value={signatureData.typedSignature}
                            onChange={handleTypedSignatureChange}
                            placeholder="Type your name"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Signature Style</Form.Label>
                          <Form.Select
                            value={signatureData.signatureFont}
                            onChange={handleFontChange}
                          >
                            {signatureFonts.map((font) => (
                              <option key={font.name} value={font.name}>
                                {font.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        {signatureData.typedSignature && (
                          <div className="signature-preview border rounded p-3 text-center mb-3">
                            <p
                              className="mb-0"
                              style={{
                                fontFamily: signatureData.signatureFont,
                                fontSize: "30px",
                              }}
                            >
                              {signatureData.typedSignature}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Upload Signature */}
                    {signatureData.signatureType === "upload" && (
                      <div className="mb-4">
                        <Form.Group
                          controlId="signatureUpload"
                          className="mb-3"
                        >
                          <Form.Label>Upload Signature Image</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                          />
                          <Form.Text className="text-muted">
                            Upload an image of your signature (JPG, PNG)
                          </Form.Text>
                        </Form.Group>

                        {signaturePreview && (
                          <div className="signature-preview border rounded p-3 text-center mb-3">
                            <img
                              src={signaturePreview}
                              alt="Signature Preview"
                              className="img-fluid"
                              style={{ maxHeight: "100px" }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Signature Preview */}
                    {signaturePreview && (
                      <div className="mb-4">
                        <h6>Signature Preview</h6>
                        <div className="signature-final-preview border rounded p-3 bg-light">
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <img
                                src={signaturePreview}
                                alt="Signature"
                                className="img-fluid"
                                style={{ maxHeight: "60px" }}
                              />
                            </div>
                            <div>
                              <div className="text-muted small">
                                Digitally signed by:
                              </div>
                              <div>{signatureData.name}</div>
                              <div className="text-muted small">
                                {new Date().toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="d-grid gap-2">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={submitSignature}
                        disabled={
                          !signatureData.name ||
                          !signaturePreview ||
                          signingInProgress
                        }
                      >
                        {signingInProgress ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Signing Document...
                          </>
                        ) : (
                          "Sign Document"
                        )}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => navigate("/documents")}
                        disabled={signingInProgress}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-3">Legal Disclaimer</h5>
              <p className="text-muted small mb-0">
                By clicking "Sign Document", you acknowledge that your
                electronic signature constitutes your legal signature on this
                document. This electronic signature is as legally binding as a
                physical signature under the Electronic Signatures in Global and
                National Commerce Act (ESIGN).
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DocumentSign;
