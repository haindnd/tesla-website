-- Reset admin password to match bcrypt('admin123')
-- Hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

USE dat_tesla_motors;

-- Delete existing admin
DELETE FROM admins;

-- Insert correct admin with bcrypt hash for 'admin123'
INSERT INTO admins (username, password, full_name) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator');

SELECT * FROM admins;
