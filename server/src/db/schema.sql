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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_reports_status (status),
  INDEX idx_reports_concern_type (concern_type)
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
