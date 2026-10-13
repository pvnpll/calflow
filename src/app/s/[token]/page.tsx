import type { Metadata } from 'next';
import { previewShare } from '@/lib/services/sharing.service';
import { JoinShare } from '@/components/sharing/JoinShare';

export const dynamic = 'force-dynamic';

// Link-preview text for WhatsApp / iMessage / Slack etc. Only reveals the owner's name — which the link
// itself already grants — and nothing if the link is invalid or sharing was turned off.
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const preview = await previewShare(token).catch(() => null);
  if (!preview) return { title: 'CalFlow', robots: { index: false } };
  return {
    title: `${preview.ownerName}'s CalFlow dashboard`,
    description: `${preview.ownerName} shared their nutrition dashboard with you on CalFlow.`,
    robots: { index: false, follow: false },
  };
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const preview = await previewShare(token).catch(() => null);

  return <JoinShare token={token} ownerName={preview?.ownerName ?? null} />;
}
