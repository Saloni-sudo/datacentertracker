CREATE TABLE IF NOT EXISTS reports (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  address VARCHAR(500) NOT NULL,
  -- Nullable: reports are saved first, geocoded afterwards.
  latitude DECIMAL(9, 6) NULL,
  longitude DECIMAL(9, 6) NULL,
  concern_type ENUM('water_usage', 'utility_bills', 'noise', 'health', 'other') NOT NULL,
  description TEXT NOT NULL,
  region VARCHAR(255) NULL,
  status ENUM('pending', 'approved', 'rejected', 'flagged') NOT NULL DEFAULT 'pending',
  -- Keeps documented facilities distinct from unverified resident reports.
  source ENUM('resident_submission', 'documented_facility') NOT NULL DEFAULT 'resident_submission',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_reports_status (status),
  INDEX idx_reports_concern_type (concern_type),
  INDEX idx_reports_source (source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS report_images (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id INT UNSIGNED NOT NULL,
  image_url VARCHAR(2048) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_report_images_report
    FOREIGN KEY (report_id) REFERENCES reports (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  -- bcrypt hash only; plaintext passwords are never stored or logged.
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
