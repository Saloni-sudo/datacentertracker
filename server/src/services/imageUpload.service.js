const cloudinary = require('cloudinary').v2;

const FOLDER = 'datacentertracker/reports';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    // resource_type 'image' makes Cloudinary reject anything that isn't really an
    // image, and Cloudinary generates the public id so no user filename is trusted.
    //
    // The incoming transformation re-encodes the file *before* it is stored, so the
    // stored master carries no EXIF — including the GPS coordinates a phone camera
    // writes into a photo. Without it the original would sit on Cloudinary at a
    // public URL with the submitter's location intact.
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: 'image',
        transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto:good' }]
      },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );

    stream.end(buffer);
  });
}

// Photos are optional enrichment: a failed upload is logged and skipped so the
// report itself is never lost.
async function uploadReportImages(files = []) {
  const urls = [];

  for (const file of files) {
    try {
      urls.push(await uploadBuffer(file.buffer));
    } catch (err) {
      console.warn(`Image upload failed for "${file.originalname}": ${err.message}`);
    }
  }

  return urls;
}

module.exports = { uploadReportImages };
