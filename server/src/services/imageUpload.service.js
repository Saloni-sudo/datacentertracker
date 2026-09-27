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
    const stream = cloudinary.uploader.upload_stream(
      { folder: FOLDER, resource_type: 'image' },
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
