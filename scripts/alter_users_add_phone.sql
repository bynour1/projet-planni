-- Add `phone` column to `users` table and a unique index so we can identify users by phone
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(64) NULL;

-- Add unique index on phone (ignore errors if phone duplicates exist)
SET @s:= (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
           WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND INDEX_NAME='uniq_phone');
-- Only create the index if it doesn't exist
IF @s = 0 THEN
  ALTER TABLE users ADD UNIQUE INDEX `uniq_phone` (phone);
END IF;
