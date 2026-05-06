import { Navigate, useLocation } from "react-router-dom"
import { useAuthContext } from "../context/AuthContext"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    // Guarda a dónde quería ir para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}