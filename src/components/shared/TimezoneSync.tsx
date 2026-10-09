'use client';
import { useEffect } from 'react';
import { getBrowserTimezone } from '@/lib/date';

/**
 * Keeps the profile's stored timezone equal to the browser's, so server-side "today"
 * (dashboard, AI chat, Claude/ChatGPT tools) matches the user's local date — including after travel.
 * Uses PUT (upsert) so it also creates the profile row for a brand-new user.
 * Runs once per browser session; renders nothing.
 */
export function TimezoneSync() {
  useEffect(() => {
    const tz = getBrowserTimezone();
    if (!tz) return;

    const key = `calflow_tz_synced:${tz}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      // storage unavailable — just sync this time
    }

    fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone: tz }),
    })
      .then((res) => {
        // A failure (e.g. timezone column not migrated yet) is retried on the next session.
        if (res.ok) {
          try { sessionStorage.setItem(key, '1'); } catch { /* ignore */ }
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
