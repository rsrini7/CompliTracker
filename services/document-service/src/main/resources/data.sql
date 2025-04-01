-- Document Service Initial Data

-- Insert sample documents
INSERT INTO documents (name, s3_key, description, content_type, size, version, status, created_by, last_modified_by)
VALUES
    ('Privacy Policy', 'documents/privacy-policy.pdf', 'Company privacy policy document', 'application/pdf', 1024576, 1, 'ACTIVE', 'admin@company.com', 'admin@company.com'),
    ('Security Protocol', 'documents/security-protocol.docx', 'Internal security guidelines', 'application/msword', 2048576, 1, 'ACTIVE', 'security.admin@company.com', 'security.admin@company.com'),
    ('Compliance Report 2023', 'documents/compliance-report-2023.pdf', 'Annual compliance report', 'application/pdf', 3145728, 1, 'ACTIVE', 'compliance.officer@company.com', 'compliance.officer@company.com');

-- Insert document access control entries
INSERT INTO document_access_control (document_id, allowed_users)
VALUES
    (1, 'admin@company.com'),
    (1, 'legal.team@company.com'),
    (2, 'security.admin@company.com'),
    (2, 'security.team@company.com'),
    (3, 'compliance.officer@company.com'),
    (3, 'auditor@company.com');