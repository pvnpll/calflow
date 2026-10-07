import { createAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/db-tables'

export async function logWater(userId: string, amountMl: number, date?: string) {
  const supabase = createAdminClient()
  let logDate = date || new Date().toISOString().split('T')[0]
  const today = new Date().toISOString().split('T')[0];
  if (logDate > today) logDate = today;
  
  const { data, error } = await supabase
    .from(TABLES.WATER_LOGS)
    .insert({ user_id: userId, amount_ml: amountMl, date: logDate })
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function getWaterByDate(userId: string, date: string) {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0];
  if (date > today) date = today;
  
  const { data, error } = await supabase
    .from(TABLES.WATER_LOGS)
    .select('amount_ml')
    .eq('user_id', userId)
    .eq('date', date)
    
  if (error) throw error
  return data.reduce((acc, log) => acc + (log.amount_ml || 0), 0)
}

export async function getWaterByDateRange(userId: string, startDate: string, endDate: string) {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0];
  if (startDate > today) startDate = today;
  if (endDate > today) endDate = today;
  const { data, error } = await supabase
    .from(TABLES.WATER_LOGS)
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
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
