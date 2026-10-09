import { createBrowserClient } from '@supabase/ssr'
import { AUTH_COOKIE_OPTIONS } from '@/lib/supabase/auth-config'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  return createBrowserClient(
    url,
    anonKey,
    {
      cookieOptions: AUTH_COOKIE_OPTIONS,
    }
  )
}
