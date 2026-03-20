const TOKEN_KEY = "rg_admin_token"

/**
 * Determines the API base URL based on the current environment.
 * Uses localhost:3001 in development, relative /api in production.
 */
function getBaseURL(): string {
  if (import.meta.env.DEV) {
    return "http://localhost:3001/api"
  }
  return "/api"
}

const BASE_URL = getBaseURL()

/**
 * Retrieves the stored JWT authentication token.
 * @returns The token string or null if not found.
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Stores the JWT authentication token in localStorage.
 * @param token - The JWT token to store.
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Removes the stored JWT authentication token.
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Builds request headers with optional JWT authorization.
 * @returns Headers object with Content-Type and optional Authorization.
 */
function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

/**
 * Handles the API response, parsing JSON and handling errors.
 * Redirects to login on 401 responses.
 * @param response - The fetch Response object.
 * @returns Parsed JSON data from the response.
 * @throws Error with the server error message on non-ok responses.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    removeToken()
    window.location.hash = "#/admin/login"
    throw new Error("Sesión expirada. Por favor, iniciá sesión nuevamente.")
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.error || data?.message || `Error ${response.status}`
    throw new Error(message)
  }

  return data as T
}

/**
 * API client for communicating with the backend.
 * Automatically attaches JWT tokens and handles authentication errors.
 */
export const api = {
  /**
   * Performs a GET request.
   * @param path - The API path (e.g., "/dashboard/stats").
   * @returns Parsed response data.
   */
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: buildHeaders(),
    })
    return handleResponse<T>(response)
  },

  /**
   * Performs a POST request with a JSON body.
   * @param path - The API path.
   * @param body - The request body to send as JSON.
   * @returns Parsed response data.
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(response)
  },

  /**
   * Performs a PUT request with a JSON body.
   * @param path - The API path.
   * @param body - The request body to send as JSON.
   * @returns Parsed response data.
   */
  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(response)
  },

  /**
   * Performs a DELETE request.
   * @param path - The API path.
   * @returns Parsed response data.
   */
  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: buildHeaders(),
    })
    return handleResponse<T>(response)
  },

  /**
   * Uploads files via multipart/form-data.
   * Does NOT set Content-Type header — the browser sets it with the boundary.
   * @param path - The API path.
   * @param formData - The FormData with files attached.
   * @returns Parsed response data.
   */
  async upload<T>(path: string, formData: FormData): Promise<T> {
    const headers: Record<string, string> = {}
    const token = getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    })
    return handleResponse<T>(response)
  },
}
