import { Navigate } from 'react-router-dom'
import { getToken } from '../auth/token'

function RequireAuth({ children }) {
  return getToken() ? children : <Navigate to="/admin/login" replace />
}

export default RequireAuth
