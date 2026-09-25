import { Popup } from 'react-leaflet'
import { concernLabel, sourceLabel } from '../config'

function ReportPopup({ report }) {
  const isDocumented = report.source === 'documented_facility'

  return (
    <Popup>
      <div className="popup">
        <p className={isDocumented ? 'popup__label popup__label--documented' : 'popup__label'}>
          {sourceLabel(report.source)}
        </p>
        <h3 className="popup__concern">{concernLabel(report.concern_type)}</h3>
        <p className="popup__description">{report.description}</p>
        {report.region && <p className="popup__region">{report.region}</p>}
        <p className="popup__address">{report.address}</p>
      </div>
    </Popup>
  )
}

export default ReportPopup
