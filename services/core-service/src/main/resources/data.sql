-- Core Service Initial Data

-- Insert sample compliance requirements
INSERT INTO compliance_requirements (title, description, category, priority, status)
VALUES
    ('GDPR Compliance', 'Ensure compliance with General Data Protection Regulation', 'Privacy', 'High', 'In Progress'),
    ('ISO 27001', 'Information Security Management System certification', 'Security', 'High', 'Pending'),
    ('SOC 2 Type II', 'Service Organization Control 2 Type II compliance', 'Security', 'Medium', 'Planned');

-- Insert sample compliance tasks
INSERT INTO compliance_tasks (requirement_id, title, description, assignee, status)
VALUES
    (1, 'Data Mapping', 'Create comprehensive data flow diagrams', 'john.doe@company.com', 'In Progress'),
    (1, 'Privacy Policy Update', 'Update privacy policy to reflect GDPR requirements', 'jane.smith@company.com', 'Pending'),
    (2, 'Security Assessment', 'Conduct initial security assessment', 'security.team@company.com', 'Planned');

-- Insert sample evidence records
INSERT INTO compliance_evidence (task_id, file_path, description, uploaded_by)
VALUES
    (1, '/documents/data-flow-diagram-v1.pdf', 'Initial data flow diagram', 'john.doe@company.com'),
    (2, '/documents/privacy-policy-draft.docx', 'Draft of updated privacy policy', 'jane.smith@company.com');