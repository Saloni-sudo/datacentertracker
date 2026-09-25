-- Upgrades an existing database created before the `source` column existed.
-- MySQL has no ADD COLUMN IF NOT EXISTS, so re-running this on an already-migrated
-- database fails with "Duplicate column name" — that error is safe to ignore.
ALTER TABLE reports
  ADD COLUMN source ENUM('resident_submission', 'documented_facility')
    NOT NULL DEFAULT 'resident_submission' AFTER status,
  ADD INDEX idx_reports_source (source);
