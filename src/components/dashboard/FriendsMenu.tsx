'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, UserMinus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Friend {
  ownerId: string;
  name: string;
}

/**
 * "Friends" button for the Home header. Opens a popup listing my dashboard plus every dashboard
 * shared with me; picking one switches to it.
 */
export function FriendsButton({ activeFriendId }: { activeFriendId?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[] | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/friends');
      setFriends(res.ok ? await res.json() : []);
    } catch {
      setFriends([]);
    }
  }, []);

  // Count on first paint, fresh list every time the popup opens (a friend may have stopped sharing).
  useEffect(() => {
    load();
  }, [load, activeFriendId]);
  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const choose = (friendId?: string) => {
    setOpen(false);
    router.push(friendId ? `/dashboard?friend=${friendId}` : '/dashboard');
  };

  const rowClass = (active: boolean) =>
    `flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
      active ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted/60'
    }`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="self-start">
            <Users className="h-4 w-4" />
            Friends
            {!!friends?.length && (
              <span className="rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold tabular-nums text-primary">{friends.length}</span>
            )}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Friends</DialogTitle>
          <DialogDescription>Switch between your dashboard and ones shared with you.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto pt-2">
          <button type="button" onClick={() => choose()} className={rowClass(!activeFriendId)}>
            My dashboard
            {!activeFriendId && <Check className="h-4 w-4 shrink-0" />}
          </button>

          {friends === null ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : friends.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
              No friends yet. When someone shares their dashboard link with you and you open it, they&apos;ll show up here.
            </p>
          ) : (
            friends.map((f) => (
              <button key={f.ownerId} type="button" onClick={() => choose(f.ownerId)} className={rowClass(f.ownerId === activeFriendId)}>
                <span className="truncate">{f.name}</span>
                {f.ownerId === activeFriendId && <Check className="h-4 w-4 shrink-0" />}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** "Remove friend" with an inline confirm, shown next to the friend's name on their dashboard. */
export function RemoveFriendButton({ friendId, name }: { friendId: string; name?: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);

  const remove = async () => {
    setRemoving(true);
    try {
      const res = await fetch(`/api/friends/${friendId}`, { method: 'DELETE' });
      if (res.ok) router.replace('/dashboard');
    } finally {
      setRemoving(false);
    }
  };

  if (!confirming) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(true)} className="shrink-0 text-destructive hover:text-destructive">
        <UserMinus className="h-4 w-4" /> Remove friend
      </Button>
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
      <span className="text-xs text-muted-foreground">Remove{name ? ` ${name}` : ''}?</span>
      <Button type="button" variant="destructive" size="sm" onClick={remove} disabled={removing}>
        {removing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Remove
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={removing}>
        Cancel
      </Button>
    </div>
  );
}
