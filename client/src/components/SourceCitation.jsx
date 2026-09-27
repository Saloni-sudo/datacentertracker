function SourceCitation({ report }) {
  if (report.source !== 'documented_facility' || !report.source_name || !report.source_url) {
    return null
  }

  return (
    <p className="citation">
      Source:{' '}
      <a href={report.source_url} target="_blank" rel="noopener noreferrer">
        {report.source_name} ↗
      </a>
    </p>
  )
}

export default SourceCitation
