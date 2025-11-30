-- Migrate existing `codes` table (which used `email` primary key) to a generic `contact` key
-- This script creates a new table, copies data, drops old table and renames the new one.
CREATE TABLE IF NOT EXISTS `codes_new` (
  `contact` VARCHAR(255) NOT NULL,
  `code` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`contact`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO codes_new (contact, code)
  SELECT email, code FROM codes;

DROP TABLE IF EXISTS codes;
RENAME TABLE codes_new TO codes;
