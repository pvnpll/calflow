import { createAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/db-tables'
import { getUserDateRange, getUserToday } from '@/lib/services/user-time'

export async function logWeight(userId: string, weightKg: number, date?: string, note?: string) {
  const supabase = createAdminClient()
  const logDate = date || await getUserToday(userId)

  const { data, error } = await supabase
    .from(TABLES.WEIGHT_LOGS)
    .insert({ user_id: userId, weight_kg: weightKg, date: logDate, note })
    .select()
    .single()

  if (error) throw error
  await syncProfileWeight(userId)
  return data
}

/**
 * Keep the profile's current weight equal to the most recent entry in the weight trend.
 * A back-dated log doesn't change it, because "latest" is by date. Returns that latest weight.
 */
export async function syncProfileWeight(userId: string): Promise<number | null> {
  const latest = await getLatestWeight(userId)
  if (!latest) return null

  const latestKg = Number(latest.weight_kg)
  const supabase = createAdminClient()
  // update (not upsert): never create a profile row just to hold a weight.
  const { error } = await supabase
    .from(TABLES.USER_PROFILES)
    .update({ current_weight_kg: latestKg })
    .eq('user_id', userId)

  if (error) throw error
  return latestKg
}

export async function getWeightHistory(userId: string, startDate?: string, endDate?: string) {
  const supabase = createAdminClient()
  let query = supabase
    .from(TABLES.WEIGHT_LOGS)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    
  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)
    
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getLatestWeight(userId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(TABLES.WEIGHT_LOGS)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

/**
 * Create today's weight entry, or update it if one already exists.
 * Used when the current weight is edited from the profile — the trend
 * always reflects the latest value for the day instead of duplicating rows.
 */
export async function upsertWeightForDate(userId: string, weightKg: number, date?: string, note?: string) {
  const supabase = createAdminClient()
  const logDate = date || await getUserToday(userId)

  const { data: existing, error: findError } = await supabase
    .from(TABLES.WEIGHT_LOGS)
    .select('id')
    .eq('user_id', userId)
    .eq('date', logDate)
    .limit(1)
    .maybeSingle()

  if (findError) throw findError

  if (existing) {
    const { data, error } = await supabase
      .from(TABLES.WEIGHT_LOGS)
      .update({ weight_kg: weightKg, ...(note !== undefined ? { note } : {}) })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    await syncProfileWeight(userId)
    return data
  }

  return logWeight(userId, weightKg, logDate, note)
}

export async function getWeightChange(userId: string, days: number) {
  const { start, end } = await getUserDateRange(userId, days)
  
  const history = await getWeightHistory(userId, start, end)
  
  if (history.length < 2) return 0
  
  const first = history[0].weight_kg
  const last = history[history.length - 1].weight_kg
  
  return last - first
}
