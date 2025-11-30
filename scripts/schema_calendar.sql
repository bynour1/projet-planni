-- Calendar/event schema for planning app
CREATE TABLE IF NOT EXISTS `calendars` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `owner_email` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `calendar_id` INT DEFAULT NULL,
  `organizer_email` VARCHAR(255) DEFAULT NULL,
  `title` VARCHAR(255) DEFAULT '',
  `description` TEXT,
  `start_at` DATETIME NOT NULL,
  `end_at` DATETIME NOT NULL,
  `timezone` VARCHAR(64) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `recurrence` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_calendar` (`calendar_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attendees` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `event_id` INT NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `status` ENUM('invited','accepted','declined','tentative') DEFAULT 'invited',
  `can_edit` TINYINT(1) DEFAULT 0,
  `invited_by` VARCHAR(255) DEFAULT NULL,
  `invited_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `reminders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `event_id` INT NOT NULL,
  `method` VARCHAR(32) DEFAULT 'email',
  `minutes_before` INT DEFAULT 15,
  PRIMARY KEY (`id`),
  KEY `idx_reminder_event` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
