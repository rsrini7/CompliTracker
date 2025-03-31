-- Core Service Schema

-- Drop existing tables
DROP TABLE IF EXISTS compliance_evidence;
DROP TABLE IF EXISTS compliance_tasks;
DROP TABLE IF EXISTS compliance_requirements;

-- Create compliance_requirements table
CREATE TABLE IF NOT EXISTS compliance_requirements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority VARCHAR(20),
    due_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create compliance_tasks table
CREATE TABLE IF NOT EXISTS compliance_tasks (
    id SERIAL PRIMARY KEY,
    requirement_id INTEGER REFERENCES compliance_requirements(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignee VARCHAR(100),
    status VARCHAR(50),
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create compliance_evidence table
CREATE TABLE IF NOT EXISTS compliance_evidence (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES compliance_tasks(id),
    file_path VARCHAR(500),
    description TEXT,
    uploaded_by VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);