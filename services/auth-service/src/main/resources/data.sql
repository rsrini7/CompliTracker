-- Insert default roles
INSERT INTO roles (name) VALUES ('ROLE_USER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_COMPLIANCE_MANAGER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_DOCUMENT_MANAGER') ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password is 'admin123' - should be changed in production)
INSERT INTO users (id, email, password_hash, first_name, last_name, created_at, updated_at)
SELECT
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'admin@complitracker.com',
    '$2a$10$rBV2JDeWW3.vKyeQo0pJ8eO/BZQZk5.wQZhF8wIOBGz7EHJXcS9Fa',
    'System',
    'Admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@complitracker.com'
);

-- Associate admin user with ROLE_ADMIN
INSERT INTO user_roles (user_id, role_id)
SELECT
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    id
FROM roles
WHERE name = 'ROLE_ADMIN'
AND EXISTS (
    SELECT 1 FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid
);