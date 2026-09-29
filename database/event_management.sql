-- ==========================================================
-- EventHub - College Event Management System Database Schema
-- Database: event_management
-- ==========================================================

CREATE DATABASE IF NOT EXISTS event_management;
USE event_management;

-- Drop tables if they exist to allow clean re-runs
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- ----------------------------------------------------------
-- 1. Users Table
-- ----------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    student_id VARCHAR(50) NULL,
    department VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    avatar_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Events Table
-- ----------------------------------------------------------
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('Technical', 'Cultural', 'Sports', 'Workshop', 'Academic', 'Gaming', 'Entrepreneurship', 'Arts') NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    venue VARCHAR(150) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    organizer VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NULL,
    status ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_event_date (date),
    INDEX idx_event_category (category),
    INDEX idx_event_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Registrations Table
-- Enforces one registration record per student per event via UNIQUE KEY
-- ----------------------------------------------------------
CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Registered', 'Attended', 'Cancelled') NOT NULL DEFAULT 'Registered',
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_event (user_id, event_id),
    INDEX idx_reg_user (user_id),
    INDEX idx_reg_event (event_id),
    INDEX idx_reg_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED DATA
-- Default Passwords:
-- Admin (admin@eventhub.com): admin123
-- Students: student123
-- ==========================================================

-- 1. Insert 1 Admin and 5 Sample Students
INSERT INTO users (id, name, email, password, role, student_id, department, phone) VALUES
(1, 'Admin Officer', 'admin@eventhub.com', '$2a$10$Ci28hw0TK6HWYqJ9oe6t3OSrTp4CV7m4m0ZyFUSl64d9p02cbwU/K', 'admin', 'ADM-001', 'Student Affairs', '+1-555-0199'),
(2, 'Aarav Sharma', 'aarav.sharma@college.edu', '$2a$10$z9ziqxlE21XxOXt99/CHH.ICjZ1z0jYd0q65mlxNWIvYm8RbGmXIe', 'student', 'CS2023-042', 'Computer Science', '+1-555-0101'),
(3, 'Sophia Chen', 'sophia.chen@college.edu', '$2a$10$z9ziqxlE21XxOXt99/CHH.ICjZ1z0jYd0q65mlxNWIvYm8RbGmXIe', 'student', 'EC2023-118', 'Electronics & Comm', '+1-555-0102'),
(4, 'Marcus Johnson', 'marcus.j@college.edu', '$2a$10$z9ziqxlE21XxOXt99/CHH.ICjZ1z0jYd0q65mlxNWIvYm8RbGmXIe', 'student', 'ME2022-089', 'Mechanical Eng', '+1-555-0103'),
(5, 'Ananya Patel', 'ananya.patel@college.edu', '$2a$10$z9ziqxlE21XxOXt99/CHH.ICjZ1z0jYd0q65mlxNWIvYm8RbGmXIe', 'student', 'BT2024-015', 'Biotechnology', '+1-555-0104'),
(6, 'Liam Rodriguez', 'liam.r@college.edu', '$2a$10$z9ziqxlE21XxOXt99/CHH.ICjZ1z0jYd0q65mlxNWIvYm8RbGmXIe', 'student', 'DS2023-067', 'Data Science', '+1-555-0105');

-- 2. Insert 8 Sample Events
INSERT INTO events (id, title, description, category, date, time, venue, capacity, organizer, image_url, status, created_by) VALUES
(1, 'HackForge 2026: 36-Hour National Hackathon', 'Join the premier annual inter-college hackathon! Build game-changing solutions in AI, Web3, and GreenTech with industry mentors and $10k in prizes.', 'Technical', '2026-10-15', '09:00 AM', 'Main Auditorium & CS Labs', 150, 'ACM Student Chapter', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1),
(2, 'Nexus Cultural Fest & Musical Night', 'A vibrant celebration of music, dance, theatrical acts, and battle of the bands featuring headline performances and art installations.', 'Cultural', '2026-10-22', '05:30 PM', 'Open Air Amphitheatre', 300, 'Cultural Committee', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1),
(3, 'Applied GenAI & LLM Masterclass', 'Hands-on practical workshop covering retrieval augmented generation (RAG), fine-tuning local models, and deploying production AI agents.', 'Workshop', '2026-10-08', '02:00 PM', 'Seminar Hall B', 60, 'AI & Robotics Club', 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1),
(4, 'Inter-College Esports Championship', 'Compete in Valorant, Rocket League, and EA Sports FC tournaments for collegiate bragging rights and streaming showcase.', 'Gaming', '2026-10-18', '11:00 AM', 'Student Activity Center', 80, 'Esports Society', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1),
(5, 'Campus Basketball League - Finals', 'Cheer on your department team in the thrilling final matches of the autumn basketball tournament. Refreshments and halftime contests included!', 'Sports', '2026-10-05', '04:00 PM', 'Indoor Sports Complex', 120, 'Sports Council', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1),
(6, 'InnovateX: Startup Pitch & VC Summit', 'Pitch your entrepreneurial venture to angel investors, network with founders, and learn how to secure seed funding.', 'Entrepreneurship', '2026-11-02', '10:00 AM', 'Executive Conference Hall', 50, 'E-Cell & Incubator', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1),
(7, 'Quantum Computing & Algorithms Symposium', 'Distinguished faculty lecture and research paper symposium delving into quantum supremacy, Qiskit simulations, and cryptographic implications.', 'Academic', '2026-11-10', '01:30 PM', 'Science Block Aud-2', 75, 'Physics & Computing Dept', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1),
(8, 'Canvas & Clay: Visual Arts Exhibition', 'Showcase of contemporary student artwork, pottery demonstrations, live portrait sketching, and gallery auction.', 'Arts', '2026-11-14', '11:00 AM', 'Fine Arts Gallery', 90, 'Fine Arts Guild', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80', 'Upcoming', 1);

-- 3. Insert Initial Registrations
INSERT INTO registrations (user_id, event_id, status, notes) VALUES
(2, 1, 'Registered', 'Looking forward to the hackathon!'),
(2, 3, 'Registered', 'Interested in LLM agents'),
(3, 1, 'Registered', 'Team lead for HackForge'),
(3, 2, 'Registered', 'Performing in acoustic set'),
(4, 5, 'Registered', 'Center player for Mech team'),
(5, 3, 'Registered', 'Bioinformatics application focus'),
(6, 4, 'Registered', 'Valorant captain');
