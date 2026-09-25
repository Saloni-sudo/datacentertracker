import { thumbnailUrl } from '../config'

function ReportThumbnails({ images = [], width = 300 }) {
  if (images.length === 0) {
    return null
  }

  return (
    <div className="thumbs">
      {images.map((url) => (
        <a key={url} href={url} target="_blank" rel="noreferrer noopener">
          <img className="thumbs__img" src={thumbnailUrl(url, width)} alt="" loading="lazy" />
        </a>
      ))}
    </div>
  )
}

export default ReportThumbnails
