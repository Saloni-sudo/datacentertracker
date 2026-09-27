-- Adds citation columns to a database created before they existed.
-- MySQL has no ADD COLUMN IF NOT EXISTS, so re-running this on an already-migrated
-- database fails with "Duplicate column name" — that error is safe to ignore.
ALTER TABLE reports
  ADD COLUMN source_name VARCHAR(255) NULL AFTER source,
  ADD COLUMN source_url VARCHAR(2048) NULL AFTER source_name;
