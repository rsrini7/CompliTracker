-- Email Service Initial Data

-- Insert sample email templates
INSERT INTO email_templates (name, subject, body, variables)
VALUES
    ('Welcome Email', 'Welcome to CompliTracker', 'Dear ${userName},

Welcome to CompliTracker! We''re excited to have you on board.

Best regards,
The CompliTracker Team', '{"userName": "string"}'),
    ('Task Assignment', 'New Compliance Task Assigned', 'Dear ${assigneeName},

A new compliance task has been assigned to you: ${taskName}
Due Date: ${dueDate}

Please review and take necessary action.

Best regards,
CompliTracker System', '{"assigneeName": "string", "taskName": "string", "dueDate": "date"}'),
    ('Deadline Reminder', 'Task Deadline Reminder', 'Dear ${userName},

This is a reminder that the following task is due soon:
Task: ${taskName}
Due Date: ${dueDate}

Please ensure timely completion.

Best regards,
CompliTracker System', '{"userName": "string", "taskName": "string", "dueDate": "date"}');

-- Insert sample email logs
INSERT INTO email_logs (template_id, recipient, subject, body, status)
VALUES
    (1, 'john.doe@company.com', 'Welcome to CompliTracker', 'Dear John,

Welcome to CompliTracker! We''re excited to have you on board.

Best regards,
The CompliTracker Team', 'SENT'),
    (2, 'jane.smith@company.com', 'New Compliance Task Assigned', 'Dear Jane,

A new compliance task has been assigned to you: GDPR Documentation Review
Due Date: 2024-02-01

Please review and take necessary action.

Best regards,
CompliTracker System', 'SENT'),
    (3, 'mike.wilson@company.com', 'Task Deadline Reminder', 'Dear Mike,

This is a reminder that the following task is due soon:
Task: Security Assessment
Due Date: 2024-01-25

Please ensure timely completion.

Best regards,
CompliTracker System', 'SENT');

-- Insert sample scheduled emails
INSERT INTO scheduled_emails (template_id, recipient, subject, body, scheduled_time, status)
VALUES
    (3, 'sarah.jones@company.com', 'Task Deadline Reminder', 'Dear Sarah,

This is a reminder that the following task is due soon:
Task: Quarterly Compliance Review
Due Date: 2024-03-31

Please ensure timely completion.

Best regards,
CompliTracker System', '2024-03-24 09:00:00', 'PENDING');