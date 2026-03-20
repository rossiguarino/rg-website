import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Spinner } from "./ui/Spinner"
import type { ReactNode } from "react"

/** Props for the ProtectedRoute component. */
interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Route guard that redirects unauthenticated users to the login page.
 * Shows a loading spinner while verifying authentication status.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
