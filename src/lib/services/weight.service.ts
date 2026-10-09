import { createAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/db-tables'

export async function logWeight(userId: string, weightKg: number, date?: string, note?: string) {
  const supabase = createAdminClient()
  const logDate = date || new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from(TABLES.WEIGHT_LOGS)
    .insert({ user_id: userId, weight_kg: weightKg, date: logDate, note })
    .select()
    .single()
    
  if (error) throw error
  return data
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
  const logDate = date || new Date().toISOString().split('T')[0]

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
    return data
  }

  return logWeight(userId, weightKg, logDate, note)
}

export async function getWeightChange(userId: string, days: number) {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days)
  
  const startIso = startDate.toISOString().split('T')[0]
  const endIso = endDate.toISOString().split('T')[0]
  
  const history = await getWeightHistory(userId, startIso, endIso)
  
  if (history.length < 2) return 0
  
  const first = history[0].weight_kg
  const last = history[history.length - 1].weight_kg
  
  return last - first
}
