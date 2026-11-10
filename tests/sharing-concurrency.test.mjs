import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  isValidShareToken,
} from '../src/lib/sharing-validation.ts';

describe('Dashboard Sharing Token Validation (CF-202)', () => {
  it('validates 16-64 character URL-safe share tokens', () => {
    assert.strictEqual(isValidShareToken('abcdefghijklmnop'), true); // 16 chars
    assert.strictEqual(isValidShareToken('A_12-34_B-567890abcdef1234567890'), true); // 32 chars
    assert.strictEqual(isValidShareToken('short'), false); // < 16 chars
    assert.strictEqual(isValidShareToken('a'.repeat(65)), false); // > 64 chars
    assert.strictEqual(isValidShareToken('token with spaces!'), false);
    assert.strictEqual(isValidShareToken(null), false);
    assert.strictEqual(isValidShareToken(undefined), false);
    assert.strictEqual(isValidShareToken(123456), false);
  });
});

describe('Dashboard Share Concurrency & Revocation Invariants (CF-202)', () => {
  // In-memory model of Supabase state to simulate concurrent DB actions with exact invariants
  function createSharingSimulator() {
    let share = null; // { user_id, token, enabled }
    const friendships = new Map(); // key: "viewer_id:owner_id" -> { viewer_id, owner_id }
    let profiles = new Map([
      ['owner-1', { name: 'Alice Walker' }],
      ['viewer-1', { name: 'Bob Smith' }],
    ]);

    function generateToken() {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      let bin = '';
      bytes.forEach((b) => (bin += String.fromCharCode(b)));
      return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    return {
      enableSharing(userId) {
        if (share && share.user_id === userId && share.enabled) {
          return { enabled: true, token: share.token, viewerCount: friendships.size };
        }
        const newToken = generateToken();
        share = { user_id: userId, token: newToken, enabled: true };
        return { enabled: true, token: newToken, viewerCount: friendships.size };
      },

      disableSharing(userId) {
        // CF-202 fix: 1. Immediately disable and rotate token so any in-flight join sees stale token
        if (share && share.user_id === userId) {
          share = { ...share, enabled: false, token: generateToken() };
        }
        // 2. Delete all friendships for this owner
        for (const [key, val] of friendships.entries()) {
          if (val.owner_id === userId) {
            friendships.delete(key);
          }
        }
      },

      // Simulates joinByToken with optional race hook
      async joinByToken(viewerId, token, onBeforeFriendshipInsert) {
        if (!isValidShareToken(token)) return { status: 'invalid' };
        if (!share || share.token !== token || !share.enabled) return { status: 'invalid' };
        if (share.user_id === viewerId) return { status: 'self' };

        // Potential race window: another thread calls disableSharing here!
        if (onBeforeFriendshipInsert) {
          await onBeforeFriendshipInsert();
        }

        // Upsert friendship
        const key = `${viewerId}:${share.user_id}`;
        friendships.set(key, { viewer_id: viewerId, owner_id: share.user_id });

        // CF-202 concurrency fence: verify that the share is still active and unchanged
        const isStillActive = share && share.user_id === share.user_id && share.token === token && share.enabled;
        if (!isStillActive) {
          // Clean up the racy friendship immediately
          friendships.delete(key);
          return { status: 'invalid' };
        }

        const ownerName = profiles.get(share.user_id)?.name || 'CalFlow user';
        return { status: 'ok', ownerId: share.user_id, ownerName };
      },

      previewShare(token) {
        if (!isValidShareToken(token)) return null;
        if (!share || share.token !== token || !share.enabled) return null;
        return { ownerName: profiles.get(share.user_id)?.name || 'CalFlow user' };
      },

      getOwnerIdByToken(token) {
        if (!isValidShareToken(token)) return null;
        if (!share || share.token !== token || !share.enabled) return null;
        return share.user_id;
      },

      canViewDashboard(viewerId, ownerId) {
        if (viewerId === ownerId) return true;
        const hasFriendship = friendships.has(`${viewerId}:${ownerId}`);
        const isShareActive = share && share.user_id === ownerId && share.enabled;
        return hasFriendship && isShareActive;
      },

      getFriendshipsCount(ownerId) {
        let count = 0;
        for (const val of friendships.values()) {
          if (val.owner_id === ownerId) count++;
        }
        return count;
      },

      getShare() {
        return share;
      },
    };
  }

  it('normal lifecycle: enable -> preview -> join -> canViewDashboard -> disable', async () => {
    const sim = createSharingSimulator();

    // 1. Enable sharing
    const status = sim.enableSharing('owner-1');
    assert.strictEqual(status.enabled, true);
    assert.ok(status.token);

    // 2. Public preview exposes only owner name
    const preview = sim.previewShare(status.token);
    assert.deepStrictEqual(preview, { ownerName: 'Alice Walker' });

    // 3. Viewer joins
    const joinResult = await sim.joinByToken('viewer-1', status.token);
    assert.strictEqual(joinResult.status, 'ok');
    assert.strictEqual(joinResult.ownerId, 'owner-1');
    assert.strictEqual(joinResult.ownerName, 'Alice Walker');

    // 4. Viewer can view dashboard
    assert.strictEqual(sim.canViewDashboard('viewer-1', 'owner-1'), true);
    assert.strictEqual(sim.canViewDashboard('unauthorized-user', 'owner-1'), false);

    // 5. Disable sharing revokes access immediately
    sim.disableSharing('owner-1');
    assert.strictEqual(sim.canViewDashboard('viewer-1', 'owner-1'), false);
    assert.strictEqual(sim.previewShare(status.token), null);
    assert.strictEqual(sim.getOwnerIdByToken(status.token), null);
    assert.strictEqual(sim.getFriendshipsCount('owner-1'), 0);
  });

  it('concurrency race: join racing with disable cannot leave a usable friendship after re-enable', async () => {
    const sim = createSharingSimulator();

    // Owner enables sharing
    const { token: originalToken } = sim.enableSharing('owner-1');

    // Viewer starts joinByToken, but right before friendship insert, disableSharing runs!
    const joinResult = await sim.joinByToken('viewer-1', originalToken, async () => {
      // Interleaved concurrent execution:
      sim.disableSharing('owner-1');
    });

    // The join must be rejected as invalid and no friendship left behind
    assert.strictEqual(joinResult.status, 'invalid');
    assert.strictEqual(sim.getFriendshipsCount('owner-1'), 0);

    // Owner now re-enables sharing tomorrow
    const newStatus = sim.enableSharing('owner-1');
    assert.strictEqual(newStatus.enabled, true);
    assert.notStrictEqual(newStatus.token, originalToken); // Must issue a fresh token

    // The old viewer must NOT have regained access!
    assert.strictEqual(sim.canViewDashboard('viewer-1', 'owner-1'), false);
    assert.strictEqual(sim.getFriendshipsCount('owner-1'), 0);

    // The old token must remain completely invalid
    assert.strictEqual(sim.previewShare(originalToken), null);
    assert.strictEqual(sim.getOwnerIdByToken(originalToken), null);
    const retryWithOldToken = await sim.joinByToken('viewer-1', originalToken);
    assert.strictEqual(retryWithOldToken.status, 'invalid');

    // Joining with the NEW token succeeds
    const joinWithNew = await sim.joinByToken('viewer-1', newStatus.token);
    assert.strictEqual(joinWithNew.status, 'ok');
    assert.strictEqual(sim.canViewDashboard('viewer-1', 'owner-1'), true);
  });

  it('rejects self-joins', async () => {
    const sim = createSharingSimulator();
    const { token } = sim.enableSharing('owner-1');
    const result = await sim.joinByToken('owner-1', token);
    assert.strictEqual(result.status, 'self');
    assert.strictEqual(sim.getFriendshipsCount('owner-1'), 0);
  });
});
