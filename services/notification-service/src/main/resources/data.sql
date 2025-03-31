-- Notification Service Initial Data

-- Insert notification types
INSERT INTO notification_types (name, description, template)
VALUES
    ('Task Assignment', 'Notification for new task assignments', 'You have been assigned a new task: ${taskName}'),
    ('Task Deadline', 'Notification for upcoming task deadlines', 'Task deadline approaching: ${taskName} is due on ${dueDate}'),
    ('Document Update', 'Notification for document updates', 'Document ${documentName} has been updated by ${updatedBy}'),
    ('Compliance Alert', 'Notification for compliance issues', 'Compliance alert: ${alertMessage}');

-- Insert sample user notification preferences
INSERT INTO user_notification_preferences (user_id, notification_type_id, email_enabled, push_enabled, sms_enabled)
VALUES
    ('user1@company.com', 1, true, true, false),
    ('user1@company.com', 2, true, true, false),
    ('user2@company.com', 1, true, false, false),
    ('user2@company.com', 3, true, true, false);

-- Insert sample notifications
INSERT INTO notifications (user_id, notification_type_id, title, message, status)
VALUES
    ('user1@company.com', 1, 'New Task Assignment', 'You have been assigned a new task: GDPR Documentation Review', 'UNREAD'),
    ('user2@company.com', 2, 'Task Deadline Reminder', 'Task deadline approaching: Security Assessment is due on 2024-01-25', 'UNREAD'),
    ('user1@company.com', 3, 'Document Updated', 'Document Privacy Policy has been updated by admin@company.com', 'READ');

-- Insert sample delivery attempts
INSERT INTO notification_delivery_attempts (notification_id, channel, status)
VALUES
    (1, 'EMAIL', 'SUCCESS'),
    (1, 'PUSH', 'SUCCESS'),
    (2, 'EMAIL', 'SUCCESS'),
    (3, 'EMAIL', 'SUCCESS'),
    (3, 'PUSH', 'FAILED');