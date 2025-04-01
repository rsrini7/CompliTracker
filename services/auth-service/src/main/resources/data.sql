-- Insert default roles
INSERT INTO roles (name) VALUES ('ROLE_USER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_COMPLIANCE_MANAGER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_DOCUMENT_MANAGER') ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password is 'admin123' - should be changed in production)
INSERT INTO users (email, password, name, created_at, updated_at, active, enabled)
SELECT
    'admin@complitracker.com',
    '$2a$10$rBV2JDeWW3.vKyeQo0pJ8eO/BZQZk5.wQZhF8wIOBGz7EHJXcS9Fa',
    'System Admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@complitracker.com'
);

-- Associate admin user with ROLE_ADMIN
INSERT INTO user_roles (user_id, role_id)
SELECT
    u.id,
    r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@complitracker.com'
AND r.name = 'ROLE_ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = u.id AND role_id = r.id
);