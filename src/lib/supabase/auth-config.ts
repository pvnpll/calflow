/**
 * Auth cookie options — must be identical in the browser client, server client and proxy,
 * otherwise whichever one last refreshes the session rewrites the cookie with its own lifetime.
 *
 * 400 days is the longest a browser will keep a cookie (Chrome's cap). The session cookie is
 * re-issued whenever the access token refreshes, so active users are never logged out; the refresh
 * token itself doesn't expire unless a session timeout is configured in the Supabase dashboard.
 */
export const AUTH_COOKIE_OPTIONS = {
  maxAge: 400 * 24 * 60 * 60,
} as const

/**
 * True only when Supabase definitively says there is no valid session. Network failures, 5xx and
 * rate limits are NOT a logout — treating them as one is what kicks users out on flaky connections.
 */
export function isDefinitelyUnauthenticated(error: { name?: string; status?: number } | null | undefined): boolean {
  if (!error) return true // no error and no user/claims => simply not signed in
  if (error.name === 'AuthSessionMissingError') return true
  return error.status === 400 || error.status === 401 || error.status === 403
}
