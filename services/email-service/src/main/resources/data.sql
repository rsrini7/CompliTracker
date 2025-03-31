-- Email Service Initial Data

-- Insert sample email templates
INSERT INTO email_templates (name, subject, content, description, version, status, created_by, last_modified_by)
VALUES
    ('Welcome Email', 'Welcome to CompliTracker', 'Dear ${userName},

Welcome to CompliTracker! We''re excited to have you on board.

Best regards,
The CompliTracker Team', 'Default welcome email template for new users', 1, 'ACTIVE', 'system', 'system'),
    ('Task Assignment', 'New Compliance Task Assigned', 'Dear ${assigneeName},

A new compliance task has been assigned to you: ${taskName}
Due Date: ${dueDate}

Please review and take necessary action.

Best regards,
CompliTracker System', 'Template for notifying users about new task assignments', 1, 'ACTIVE', 'system', 'system'),
    ('Deadline Reminder', 'Task Deadline Reminder', 'Dear ${userName},

This is a reminder that the following task is due soon:
Task: ${taskName}
Due Date: ${dueDate}

Please ensure timely completion.

Best regards,
CompliTracker System', 'Template for sending task deadline reminders', 1, 'ACTIVE', 'system', 'system');

-- Insert sample email logs
INSERT INTO email_logs (template_id, recipient, subject, content, status)
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
INSERT INTO scheduled_emails (template_id, recipient, template_data, scheduled_time, status, retry_count, created_by)
VALUES
    (3, 'sarah.jones@company.com', '{"userName":"Sarah","taskName":"Quarterly Compliance Review","dueDate":"2024-03-31"}', '2024-03-24 09:00:00', 'PENDING', 0, 'system@complitracker.com');