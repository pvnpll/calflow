import { createAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/db-tables'
import { getUserToday } from '@/lib/services/user-time'
import { validateWaterAmount, validateWaterDate, validateWaterDateRange } from '@/lib/water-validation'

export async function logWater(userId: string, amountMl: number, date?: string) {
  const validAmount = validateWaterAmount(amountMl)
  const validDate = validateWaterDate(date)
  const supabase = createAdminClient()
  const logDate = validDate || await getUserToday(userId)
  
  const { data, error } = await supabase
    .from(TABLES.WATER_LOGS)
    .insert({ user_id: userId, amount_ml: validAmount, date: logDate })
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function getWaterByDate(userId: string, date: string) {
  const validDate = validateWaterDate(date) || await getUserToday(userId)
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from(TABLES.WATER_LOGS)
    .select('amount_ml')
    .eq('user_id', userId)
    .eq('date', validDate)
    
  if (error) throw error
  return data.reduce((acc, log) => acc + (log.amount_ml || 0), 0)
}

export async function getWaterByDateRange(userId: string, startDate: string, endDate: string) {
  const { start, end } = validateWaterDateRange(startDate, endDate)
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(TABLES.WATER_LOGS)
    .select('*')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true })
    
  if (error) throw error
  return data
}

export async function getWaterSummary(userId: string, startDate: string, endDate: string) {
  const logs = await getWaterByDateRange(userId, startDate, endDate)
  const summary: Record<string, number> = {}
  
  for (const log of logs) {
    summary[log.date] = (summary[log.date] || 0) + (log.amount_ml || 0)
  }
  
  return summary
}
