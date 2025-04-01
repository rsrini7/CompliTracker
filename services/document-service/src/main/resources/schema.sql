-- Document Service Schema

-- Drop existing tables
DROP TABLE IF EXISTS document_access_control;
DROP TABLE IF EXISTS documents;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    s3_key VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    version INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    last_modified_by VARCHAR(100)
);

-- Create document_access_control table for managing document access
CREATE TABLE IF NOT EXISTS document_access_control (
    document_id BIGINT REFERENCES documents(id),
    allowed_users VARCHAR(255),
    PRIMARY KEY (document_id, allowed_users)
);