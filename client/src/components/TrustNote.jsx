import { Link } from 'react-router-dom'

function TrustNote() {
  return (
    <p className="trustnote">
      Resident reports are reviewed by a moderator before publication. Reviewed does not mean
      verified. <Link to="/methodology">How this works</Link>
    </p>
  )
}

export default TrustNote
