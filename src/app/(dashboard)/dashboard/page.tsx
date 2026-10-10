import DashboardContent from '@/components/dashboard/DashboardContent';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ friend?: string | string[] }>;
}) {
  const { friend } = await searchParams;
  const friendId = typeof friend === 'string' && friend ? friend : undefined;

  return (
    <div className="space-y-6">
      <DashboardContent friendId={friendId} />
    </div>
  );
}
