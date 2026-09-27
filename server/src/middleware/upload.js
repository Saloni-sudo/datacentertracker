const multer = require('multer');

const MAX_FILES = 3;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Memory storage only: nothing is written to the host's disk, which is ephemeral
// on the deploy target anyway. Buffers go straight to Cloudinary after validation.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    // The mimetype comes from the client, so this is a first filter, not proof.
    // Cloudinary's resource_type: 'image' upload is the second check.
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'photos'));
    }

    cb(null, true);
  }
});

const MESSAGES = {
  LIMIT_FILE_SIZE: 'Each photo must be 5 MB or smaller',
  LIMIT_FILE_COUNT: `You can attach at most ${MAX_FILES} photos`,
  LIMIT_UNEXPECTED_FILE: 'Photos must be JPEG, PNG or WebP, sent as "photos"'
};

// Turns multer's own errors into 400s rather than letting them reach the 500 handler.
function uploadReportPhotos(req, res, next) {
  upload.array('photos', MAX_FILES)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: MESSAGES[err.code] ?? 'Photo upload failed' });
    }

    next(err);
  });
}

module.exports = uploadReportPhotos;
