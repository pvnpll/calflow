'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Loader2, MessageCircle, Share2, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ShareStatus {
  enabled: boolean;
  token: string | null;
  viewerCount: number;
}

const SHARE_TITLE = 'My CalFlow dashboard';
const SHARE_TEXT = "Here's my CalFlow dashboard — open the link to follow along:";

/**
 * Sharing state + actions for the Home header. `active` is false while viewing a friend's dashboard
 * (no sharing controls there, and no request is made).
 *
 * share(): one click — creates the link if sharing is off, then opens the native share sheet.
 * Where that isn't available (desktop Firefox, or the browser wants a fresher click) it falls back
 * to a small dialog with the link, Copy and WhatsApp.
 */
export function useShareDashboard(active: boolean) {
  const [status, setStatus] = useState<ShareStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackLink, setFallbackLink] = useState<string | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/share');
      if (res.ok) setStatus(await res.json());
    } catch {
      // controls simply stay hidden
    }
  }, []);

  useEffect(() => {
    if (active) load();
  }, [active, load]);

  const linkFor = (token: string) => `${window.location.origin}/s/${token}`;

  const share = async () => {
    setError(null);
    let token = status?.token ?? null;

    if (!status?.enabled || !token) {
      setBusy(true);
      try {
        const res = await fetch('/api/share', { method: 'POST' });
        if (!res.ok) throw new Error();
        const next: ShareStatus = await res.json();
        setStatus(next);
        token = next.token;
      } catch {
        setError('Could not create the share link. Please try again.');
        return;
      } finally {
        setBusy(false);
      }
    }
    if (!token) return;

    const url = linkFor(token);
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // they closed the share sheet
        // anything else (e.g. NotAllowedError): fall through to the dialog
      }
    }
    setFallbackLink(url);
  };

  const stop = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/share', { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setStatus(await res.json());
      setConfirmStop(false);
    } catch {
      setError('Could not stop sharing. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return {
    loaded: status !== null,
    enabled: !!status?.enabled,
    busy,
    error,
    share,
    requestStop: () => setConfirmStop(true),
    // for <ShareDialogs />
    fallbackLink,
    closeFallback: () => setFallbackLink(null),
    confirmStop,
    cancelStop: () => setConfirmStop(false),
    stop,
  };
}

export type ShareController = ReturnType<typeof useShareDashboard>;

/** "Share" (creates the link and shares in one click) or, once sharing is on, "Stop sharing". */
export function ShareButton({ ctl }: { ctl: ShareController }) {
  if (!ctl.loaded) return null;

  return ctl.enabled ? (
    <Button type="button" variant="outline" size="sm" onClick={ctl.requestStop} disabled={ctl.busy} className="self-start text-destructive hover:text-destructive">
      <ShieldOff className="h-4 w-4" /> Stop sharing
    </Button>
  ) : (
    <Button type="button" variant="outline" size="sm" onClick={ctl.share} disabled={ctl.busy} className="self-start">
      {ctl.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
      Share
    </Button>
  );
}

/** Share icon shown next to the user's name while sharing is on: re-share the same link. */
export function ShareIconButton({ ctl }: { ctl: ShareController }) {
  if (!ctl.loaded || !ctl.enabled) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={ctl.share}
      disabled={ctl.busy}
      aria-label="Share your dashboard link again"
      title="Share your dashboard link"
      className="shrink-0 text-muted-foreground hover:text-foreground"
    >
      {ctl.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
    </Button>
  );
}

/** Dialogs for the controller: the stop-sharing confirmation and the no-share-sheet fallback. */
export function ShareDialogs({ ctl }: { ctl: ShareController }) {
  const [copied, setCopied] = useState(false);
  const link = ctl.fallbackLink ?? '';
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // the field is selectable, so they can copy by hand
    }
  };

  return (
    <>
      <Dialog open={!!ctl.fallbackLink} onOpenChange={(open) => !open && ctl.closeFallback()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share your dashboard</DialogTitle>
            <DialogDescription>Anyone with this link can view your Home dashboard (read-only).</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 pt-2">
            <Input readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Share link" className="font-mono text-xs" />
            <Button type="button" variant="outline" onClick={copy} className="shrink-0">
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {canNativeShare && (
              <Button type="button" onClick={ctl.share}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
            )}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${link}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={ctl.confirmStop} onOpenChange={(open) => !open && ctl.cancelStop()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop sharing your dashboard?</DialogTitle>
            <DialogDescription>
              This disables your link and removes everyone who joined. If you share again later, you&apos;ll get a new link.
            </DialogDescription>
          </DialogHeader>
          {ctl.error && <p className="text-sm font-medium text-destructive">{ctl.error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={ctl.cancelStop} disabled={ctl.busy}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={ctl.stop} disabled={ctl.busy}>
              {ctl.busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {ctl.busy ? 'Stopping…' : 'Stop sharing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
