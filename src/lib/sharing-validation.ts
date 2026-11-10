/**
 * Shared validation rules and constants for dashboard sharing.
 */

export const TOKEN_RE = /^[A-Za-z0-9_-]{16,64}$/;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidShareToken(token: unknown): token is string {
  return typeof token === 'string' && TOKEN_RE.test(token);
}

export function isValidUuid(id: unknown): id is string {
  return typeof id === 'string' && UUID_RE.test(id);
}
