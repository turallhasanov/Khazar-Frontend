import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../services/api.js'
import * as authService from '../services/authService.js'
import { clearSession, getSession, subscribeSession } from '../services/authSession.js'

/**
 * Sign-in state for the storefront. The session (JWT + refresh token) lives in localStorage via authSession.js;
 * this context mirrors it for rendering and exposes the auth actions. A refresh failure in api.js clears
 * the session, which signs the user out here as well.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(getSession)

  useEffect(() => subscribeSession(setSessionState), [])

  // Validate a session restored from storage once per page load (refreshing the access token if needed).
  useEffect(() => {
    if (!getSession()) return undefined
    const controller = new AbortController()
    authService.getCurrentUser({ signal: controller.signal }).catch((error) => {
      if (error instanceof ApiError && error.status === 401) clearSession()
    })
    return () => controller.abort()
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      login: authService.login,
      register: authService.register,
      verifyEmail: authService.verifyEmail,
      resendVerification: authService.resendVerification,
      forgotPassword: authService.forgotPassword,
      resetPassword: authService.resetPassword,
      logout: authService.logout,
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- provider + hook birlikte tutulur
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
