-- Migration script to add mustChangePassword column to users table
-- This column indicates if user must change their provisional password created by admin
-- Run this script in XAMPP phpMyAdmin or mysql CLI

USE `planning`;

-- Add mustChangePassword column to users table
ALTER TABLE `users` 
ADD COLUMN `mustChangePassword` TINYINT(1) DEFAULT 0 AFTER `isConfirmed`;

-- Update existing users to not require password change (they set their own passwords)
UPDATE `users` SET `mustChangePassword` = 0;

-- Display confirmation
SELECT 'Migration completed successfully! mustChangePassword column added to users table.' AS 'Status';
