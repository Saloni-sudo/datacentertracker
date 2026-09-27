import { imageUrl, photoAlt, thumbnailUrl } from '../config'

// Both the thumbnail and the "open full size" link go through a Cloudinary
// transformation so the original file — and its EXIF/GPS metadata — is never served.
function ReportThumbnails({ report, width = 300 }) {
  const images = report.images ?? []

  if (images.length === 0) {
    return null
  }

  return (
    <div className="thumbs">
      {images.map((url) => (
        <a key={url} href={imageUrl(url)} target="_blank" rel="noopener noreferrer">
          <img
            className="thumbs__img"
            src={thumbnailUrl(url, width)}
            alt={photoAlt(report)}
            loading="lazy"
          />
        </a>
      ))}
    </div>
  )
}

export default ReportThumbnails
