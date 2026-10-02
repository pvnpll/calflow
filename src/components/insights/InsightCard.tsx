import { Card, CardContent } from '@/components/ui/card';

export default function InsightCard({ title, value, subtitle }: { title: string, value: string, subtitle?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col justify-center">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
