import { createAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/db-tables'
import { DEFAULT_TIMEZONE, addDaysStr, isValidTimezone, todayStr } from '@/lib/date'

/**
 * The user's IANA timezone, as synced from their browser. Falls back to UTC if it was never
 * set (or the cf_user_profiles.timezone column hasn't been migrated yet).
 */
export async function getUserTimezone(userId: string): Promise<string> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from(TABLES.USER_PROFILES)
      .select('timezone')
      .eq('user_id', userId)
      .maybeSingle()
    return isValidTimezone(data?.timezone) ? data.timezone : DEFAULT_TIMEZONE
  } catch {
    return DEFAULT_TIMEZONE
  }
}

/** Today's 'YYYY-MM-DD' in the user's timezone. */
export async function getUserToday(userId: string): Promise<string> {
  return todayStr(await getUserTimezone(userId))
}

/** [today - days, today] in the user's timezone. */
export async function getUserDateRange(userId: string, days: number) {
  const end = await getUserToday(userId)
  return { start: addDaysStr(end, -days), end }
}
