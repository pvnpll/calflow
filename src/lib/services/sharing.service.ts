import { createAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/db-tables'

/**
 * Dashboard sharing. Invariant: a cf_friendships row only exists while the owner's share is enabled —
 * disabling sharing deletes them, and enabling again issues a NEW token. So turning sharing off
 * revokes everyone, and nobody can quietly regain access when it is turned back on.
 *
 * All access control lives here (service-role client); callers pass the authenticated user's id.
 */

const TOKEN_RE = /^[A-Za-z0-9_-]{16,64}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidShareToken(token: unknown): token is string {
  return typeof token === 'string' && TOKEN_RE.test(token)
}

/** 128 bits of randomness, URL-safe (22 chars). */
function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function getShareStatus(userId: string) {
  const supabase = createAdminClient()
  const { data: share, error } = await supabase
    .from(TABLES.DASHBOARD_SHARES)
    .select('token, enabled')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error

  if (!share?.enabled) return { enabled: false as const, token: null, viewerCount: 0 }

  const { count, error: countError } = await supabase
    .from(TABLES.FRIENDSHIPS)
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', userId)
  if (countError) throw countError

  return { enabled: true as const, token: share.token as string, viewerCount: count ?? 0 }
}

/** Idempotent: if already enabled, keeps the current link. Otherwise issues a fresh token. */
export async function enableSharing(userId: string) {
  const current = await getShareStatus(userId)
  if (current.enabled) return current

  const supabase = createAdminClient()
  const { error } = await supabase
    .from(TABLES.DASHBOARD_SHARES)
    .upsert({ user_id: userId, token: generateToken(), enabled: true }, { onConflict: 'user_id' })
  if (error) throw error
  return getShareStatus(userId)
}

/** Kills the link and removes every viewer. */
export async function disableSharing(userId: string) {
  const supabase = createAdminClient()
  const { error: friendsError } = await supabase.from(TABLES.FRIENDSHIPS).delete().eq('owner_id', userId)
  if (friendsError) throw friendsError

  const { error } = await supabase
    .from(TABLES.DASHBOARD_SHARES)
    .update({ enabled: false })
    .eq('user_id', userId)
  if (error) throw error
}

export async function getOwnerName(userId: string): Promise<string> {
  const supabase = createAdminClient()
  const { data } = await supabase.from(TABLES.USER_PROFILES).select('name').eq('user_id', userId).maybeSingle()
  return data?.name?.trim() || 'CalFlow user'
}

/** Public preview for a token (used for link-preview metadata). Returns null if invalid/disabled. */
export async function previewShare(token: string): Promise<{ ownerName: string } | null> {
  if (!isValidShareToken(token)) return null
  const supabase = createAdminClient()
  const { data: share } = await supabase
    .from(TABLES.DASHBOARD_SHARES)
    .select('user_id, enabled')
    .eq('token', token)
    .maybeSingle()
  if (!share?.enabled) return null
  return { ownerName: await getOwnerName(share.user_id) }
}

export type JoinResult =
  | { status: 'ok'; ownerId: string; ownerName: string }
  | { status: 'self' }
  | { status: 'invalid' }

/** Opening a share link adds the owner to the viewer's friends. */
export async function joinByToken(viewerId: string, token: string): Promise<JoinResult> {
  if (!isValidShareToken(token)) return { status: 'invalid' }

  const supabase = createAdminClient()
  const { data: share, error } = await supabase
    .from(TABLES.DASHBOARD_SHARES)
    .select('user_id, enabled')
    .eq('token', token)
    .maybeSingle()
  if (error) throw error
  if (!share?.enabled) return { status: 'invalid' }
  if (share.user_id === viewerId) return { status: 'self' }

  const { error: insertError } = await supabase
    .from(TABLES.FRIENDSHIPS)
    .upsert({ viewer_id: viewerId, owner_id: share.user_id }, { onConflict: 'viewer_id,owner_id', ignoreDuplicates: true })
  if (insertError) throw insertError

  return { status: 'ok', ownerId: share.user_id, ownerName: await getOwnerName(share.user_id) }
}

export async function listFriends(viewerId: string) {
  const supabase = createAdminClient()
  const { data: rows, error } = await supabase
    .from(TABLES.FRIENDSHIPS)
    .select('owner_id, created_at')
    .eq('viewer_id', viewerId)
    .order('created_at', { ascending: true })
  if (error) throw error
  if (!rows?.length) return []

  const ids = rows.map((r) => r.owner_id)
  const [{ data: shares }, { data: profiles }] = await Promise.all([
    supabase.from(TABLES.DASHBOARD_SHARES).select('user_id').in('user_id', ids).eq('enabled', true),
    supabase.from(TABLES.USER_PROFILES).select('user_id, name').in('user_id', ids),
  ])
  const active = new Set((shares ?? []).map((s) => s.user_id))
  const names = new Map((profiles ?? []).map((p) => [p.user_id, p.name?.trim()]))

  return rows
    .filter((r) => active.has(r.owner_id))
    .map((r) => ({
      ownerId: r.owner_id as string,
      name: names.get(r.owner_id) || 'CalFlow user',
      since: r.created_at as string,
    }))
}

export async function removeFriend(viewerId: string, ownerId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from(TABLES.FRIENDSHIPS)
    .delete()
    .eq('viewer_id', viewerId)
    .eq('owner_id', ownerId)
  if (error) throw error
}

/** The one gate for viewing someone else's dashboard: they must be a friend AND still sharing. */
export async function canViewDashboard(viewerId: string, ownerId: string): Promise<boolean> {
  if (viewerId === ownerId) return true
  if (!UUID_RE.test(ownerId)) return false
  const supabase = createAdminClient()
  const [{ data: friendship }, { data: share }] = await Promise.all([
    supabase.from(TABLES.FRIENDSHIPS).select('id').eq('viewer_id', viewerId).eq('owner_id', ownerId).maybeSingle(),
    supabase.from(TABLES.DASHBOARD_SHARES).select('enabled').eq('user_id', ownerId).maybeSingle(),
  ])
  return !!friendship && !!share?.enabled
}
