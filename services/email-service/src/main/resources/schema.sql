-- Email Service Schema

-- Drop existing tables
DROP TABLE IF EXISTS scheduled_emails;
DROP TABLE IF EXISTS email_attachments;
DROP TABLE IF EXISTS email_logs;
DROP TABLE IF EXISTS email_templates;

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    version INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES email_templates(id),
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create email_attachments table
CREATE TABLE IF NOT EXISTS email_attachments (
    id SERIAL PRIMARY KEY,
    email_log_id INTEGER REFERENCES email_logs(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    content_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create scheduled_emails table
CREATE TABLE IF NOT EXISTS scheduled_emails (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES email_templates(id),
    recipient VARCHAR(255) NOT NULL,
    template_data TEXT,
    scheduled_time TIMESTAMP NOT NULL,
    sent_time TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);