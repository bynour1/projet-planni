-- Alter attendees table to add phone, can_edit and invited_by if they do not exist
ALTER TABLE `attendees`
  ADD COLUMN IF NOT EXISTS `phone` VARCHAR(64) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `can_edit` TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `invited_by` VARCHAR(255) DEFAULT NULL;

-- Note: MySQL < 8.0 does not support IF NOT EXISTS on ADD COLUMN; run carefully or use migrations.
