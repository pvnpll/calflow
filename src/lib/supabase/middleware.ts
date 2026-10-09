import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_OPTIONS, isDefinitelyUnauthenticated } from '@/lib/supabase/auth-config'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookieOptions: AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // A redirect must carry the cookies set during token refresh. If they're dropped, the browser keeps
  // the old (already rotated) refresh token and the next request logs the user out.
  const redirectTo = (url: URL) => {
    const redirect = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getClaims().
  try {
    // getClaims verifies the JWT locally when the project uses asymmetric signing keys (no network
    // round-trip per navigation) and refreshes the session if the access token is about to expire.
    const { data, error } = await supabase.auth.getClaims()
    const user = data?.claims ?? null

    // Supabase unreachable / rate-limited / 5xx: we can't tell, so don't bounce a signed-in user to /login.
    if (!user && !isDefinitelyUnauthenticated(error)) {
      return supabaseResponse
    }

    const pathname = request.nextUrl.pathname
    
    // Auth routes where logged-in users shouldn't go (optional, handled in page.tsx already, but good practice)
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password') || pathname === '/'
    
    // API or static routes to ignore
    const isPublicPath = pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/static') || 
      pathname.startsWith('/.well-known') || 
      pathname.startsWith('/auth/callback') ||
      pathname.match(/\.(png|json|xml|ico|webmanifest)$/i) || // Static assets
      pathname === '/apple-icon' ||
      pathname === '/icon' ||
      pathname === '/manifest.json' ||
      pathname === '/sw.js' ||
      pathname === '/offline';

    if (!user && !isAuthRoute && !isPublicPath) {
      // User is not logged in and trying to access a protected route
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return redirectTo(url)
    }

    if (user && isAuthRoute) {
      // User is logged in and trying to access an auth route
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return redirectTo(url)
    }
  } catch (e) {
    console.error('Error fetching user in middleware:', e)
  }

  return supabaseResponse
}
