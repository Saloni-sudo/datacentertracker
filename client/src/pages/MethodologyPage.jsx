import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Methodology from '../components/Methodology'

function MethodologyPage() {
  const { hash } = useLocation()

  // The footer links straight to #data-sources; the router doesn't scroll for us.
  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hash])

  return (
    <div className="page">
      <Methodology />
    </div>
  )
}

export default MethodologyPage
