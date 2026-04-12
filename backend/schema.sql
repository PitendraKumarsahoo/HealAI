
-- Create Database
CREATE DATABASE IF NOT EXISTS healai;
USE healai;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('USER','MEDICAL','ADMIN') NOT NULL DEFAULT 'USER',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    disease VARCHAR(50) NOT NULL,
    prediction INT NOT NULL,
    probability FLOAT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Insert Admin User (Password: admin123)
-- Note: The password hash below corresponds to 'admin123'
INSERT INTO users (name, email, password_hash, role, is_active)
SELECT * FROM (SELECT 'System Admin', 'admin@healai.com', 'scrypt:32768:8:1$umfyBjEo3BSwLvEr$88c171e8c76999a007d17a065195da0f2c0de18a6a2735db293a3f2b9505bd533ab30532be09c49050258b6434a8a41b2862ed88b908afacc784583a9c2a29d9', 'ADMIN', 1) AS tmp
WHERE NOT EXISTS (
    SELECT email FROM users WHERE email = 'admin@healai.com'
) LIMIT 1;
