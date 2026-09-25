import { Popup } from 'react-leaflet'
import { concernLabel, DISCLAIMER } from '../config'

function ReportPopup({ report }) {
  return (
    <Popup>
      <div className="popup">
        <p className="popup__disclaimer">{DISCLAIMER}</p>
        <h3 className="popup__concern">{concernLabel(report.concern_type)}</h3>
        <p className="popup__description">{report.description}</p>
        {report.region && <p className="popup__region">{report.region}</p>}
        <p className="popup__address">{report.address}</p>
      </div>
    </Popup>
  )
}

export default ReportPopup
