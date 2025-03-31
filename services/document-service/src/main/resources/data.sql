-- Document Service Initial Data

-- Insert sample documents
INSERT INTO documents (title, description, file_path, file_type, file_size, uploaded_by)
VALUES
    ('Privacy Policy', 'Company privacy policy document', '/documents/privacy-policy.pdf', 'application/pdf', 1024576, 'admin@company.com'),
    ('Security Protocol', 'Internal security guidelines', '/documents/security-protocol.docx', 'application/msword', 2048576, 'security.admin@company.com'),
    ('Compliance Report 2023', 'Annual compliance report', '/documents/compliance-report-2023.pdf', 'application/pdf', 3145728, 'compliance.officer@company.com');

-- Insert document versions
INSERT INTO document_versions (document_id, version_number, file_path, file_size, modified_by, change_log)
VALUES
    (1, 1, '/documents/versions/privacy-policy-v1.pdf', 1024576, 'admin@company.com', 'Initial version'),
    (1, 2, '/documents/versions/privacy-policy-v2.pdf', 1048576, 'legal.team@company.com', 'Updated GDPR compliance sections');

-- Insert document tags
INSERT INTO document_tags (document_id, tag_name)
VALUES
    (1, 'Privacy'),
    (1, 'Legal'),
    (2, 'Security'),
    (2, 'Internal'),
    (3, 'Compliance'),
    (3, 'Report');

-- Insert document shares
INSERT INTO document_shares (document_id, shared_with, permission_level, shared_by)
VALUES
    (1, 'legal.team@company.com', 'EDIT', 'admin@company.com'),
    (2, 'security.team@company.com', 'VIEW', 'security.admin@company.com'),
    (3, 'auditor@company.com', 'VIEW', 'compliance.officer@company.com');