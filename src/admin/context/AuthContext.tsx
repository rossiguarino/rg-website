import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { api, setToken, removeToken, getToken } from "../api/client"

/** User object returned by the API. */
interface User {
  uuid: string
  email: string
  first_name: string
  last_name: string
  role: string
  phone?: string
}

/** Shape of the authentication context value. */
interface AuthContextValue {
  /** The currently authenticated user, or null if not logged in. */
  user: User | null
  /** Whether a valid authentication token exists and user is loaded. */
  isAuthenticated: boolean
  /** Whether the current user has the admin role. */
  isAdmin: boolean
  /** Whether authentication state is being loaded. */
  loading: boolean
  /**
   * Authenticates the user with email and password.
   * @param email - User's email address.
   * @param password - User's password.
   */
  login: (email: string, password: string) => Promise<void>
  /** Logs out the current user and clears the stored token. */
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Provides authentication state and methods to child components.
 * Checks for an existing valid token on mount.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const userData = await api.get<User>("/auth/me")
      setUser(userData)
    } catch {
      removeToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  /**
   * Authenticates with email and password, storing the returned token.
   */
  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>("/auth/login", { email, password })
    setToken(res.token)
    setUser(res.user)
  }, [])

  /**
   * Clears authentication state and redirects to login.
   */
  const logout = useCallback(() => {
    removeToken()
    setUser(null)
    window.location.hash = "#/admin/login"
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider.
 * @returns The authentication context value.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
