-- Create planning table for storing daily schedules
-- This table stores events grouped by date (jour) with details for each entry

USE `planning`;

CREATE TABLE IF NOT EXISTS `planning` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` VARCHAR(50) NOT NULL COMMENT 'Date key (e.g., "Lundi 13 Jan", "Mardi 14 Jan")',
  `events` TEXT NOT NULL COMMENT 'JSON array of events for this date',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores planning data with events grouped by date';

-- Example data structure:
-- date: "Lundi 13 Jan"
-- events: [
--   {"medecin": "Dr. Dupont", "technicien": "Martin", "adresse": "123 rue Example"},
--   {"medecin": "Dr. Bernard", "technicien": "Durand", "adresse": "456 avenue Test"}
-- ]
