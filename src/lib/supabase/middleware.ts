import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
      cookieOptions: {
        maxAge: 30 * 24 * 60 * 60, // 30 days of inactivity
      },
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser().
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname
    
    // Auth routes where logged-in users shouldn't go (optional, handled in page.tsx already, but good practice)
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password') || pathname === '/'
    
    // API or static routes to ignore
    const isPublicPath = pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/.well-known') || pathname.startsWith('/auth/callback')

    if (!user && !isAuthRoute && !isPublicPath) {
      // User is not logged in and trying to access a protected route
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } catch (e) {
    console.error('Error fetching user in middleware:', e)
  }

  return supabaseResponse
}
