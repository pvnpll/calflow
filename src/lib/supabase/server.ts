import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Standard cookie-based Supabase client for Next.js App Router (browser sessions).
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  try {
    const cookieStore = await cookies()
    return createServerClient(
      url,
      anonKey,
      {
        cookieOptions: {
          maxAge: 30 * 24 * 60 * 60, // 30 days of inactivity
        },
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore inside Server Component
            }
          },
        },
      }
    )
  } catch {
    // If called outside of a request context where cookies() is unavailable (e.g. background job / MCP tool),
    // fallback to admin service role client
    return createAdminClient()
  }
}

/**
 * Admin client with service-role key for backend operations like MCP tool executions.
 * Service role bypasses RLS and allows operations on behalf of validated user IDs.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  
  return createSupabaseClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })
}
