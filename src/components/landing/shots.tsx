// Faithful recreations of the real CalFlow app UI for the landing page.
// They mirror actual dashboard styling so they read as screenshots.
// To use a real PNG later: drop it in public/landing/ and use
// <LandingShot src="/landing/x.png" alt="..." /> instead.
import { cn } from 'cn';
import { Coffee, Sun, Utensils, Droplets, Sparkles, Plug } from 'lucide-react';

export function LandingShot({ src, alt, className }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={cn('w-full rounded-2xl border border-border/60 shadow-xl', className)} />;
}

export function ShotFrame({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-xl', className)}>
      <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
        <span className="ml-3 text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function Ring({ consumed, target }: { consumed: number; target: number }) {
  const pct = Math.min((consumed / target) * 100, 100);
  const size = 148;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = r * 2 * Math.PI;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg className="absolute -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="transparent" className="stroke-muted" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="transparent" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round" className="stroke-orange-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Calories</span>
        <span className="mt-0.5 text-2xl font-bold tabular-nums">~{consumed.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">/ {target.toLocaleString()} kcal</span>
      </div>
    </div>
  );
}

export function Bar({ value, target, className }: { value: number; target: number; className: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn('h-full rounded-full', className)} style={{ width: `${Math.min((value / target) * 100, 100)}%` }} />
    </div>
  );
}


export function DashboardShot({ className }: { className?: string }) {
  return (
    <ShotFrame label="calflow — today" className={className}>
      <div className="grid gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-border/60 p-4 sm:col-span-2">
          <Ring consumed={1842} target={2200} />
          <div className="mt-4 space-y-3">
            {[
              { n: 'Protein', v: 112, t: 150, c: 'bg-blue-500' },
              { n: 'Carbs', v: 198, t: 260, c: 'bg-emerald-500' },
              { n: 'Fat', v: 58, t: 75, c: 'bg-amber-500' },
            ].map((m) => (
              <div key={m.n}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium">{m.n}</span>
                  <span className="tabular-nums text-muted-foreground">{m.v}g / {m.t}g</span>
                </div>
                <Bar value={m.v} target={m.t} className={m.c} />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 sm:col-span-3">
          <div className="rounded-xl border border-border/60 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold">Hydration</span>
              <span className="ml-auto text-xs tabular-nums text-muted-foreground">1.75 / 2.5 L</span>
            </div>
            <Bar value={1.75} target={2.5} className="bg-blue-500" />
          </div>
          <div className="rounded-xl border border-border/60 p-4">
            <p className="mb-3 text-sm font-semibold">Today&apos;s meals</p>
            <ul className="space-y-3">
              {[
                { icon: <Coffee className="h-3.5 w-3.5 text-orange-500" />, t: 'Breakfast', d: 'Oats, milk, banana & whey', k: 520 },
                { icon: <Sun className="h-3.5 w-3.5 text-amber-500" />, t: 'Lunch', d: '3 eggs, 2 rotis, curd', k: 540 },
                { icon: <Utensils className="h-3.5 w-3.5 text-emerald-500" />, t: 'Snack', d: 'Greek yogurt & almonds', k: 280 },
              ].map((m) => (
                <li key={m.t} className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">{m.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium leading-tight">{m.t}</span>
                    <span className="block truncate text-xs text-muted-foreground">{m.d}</span>
                  </span>
                  <span className="ml-auto shrink-0 text-[13px] font-semibold tabular-nums text-orange-500">~{m.k} kcal</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/40 p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">AI insight — </span>
              close to your protein target. A protein-rich dinner would close the gap.
            </p>
          </div>
        </div>
      </div>
    </ShotFrame>
  );
}

/** A tool call as ChatGPT shows it when it talks to CalFlow over MCP. */
function ToolCall({ name }: { name: string }) {
  return (
    <div className="mr-8 flex w-fit items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
      <Plug className="h-3.5 w-3.5" />
      <span>
        Used CalFlow <span className="font-mono">{name}</span>
      </span>
    </div>
  );
}

/** ChatGPT logging a meal to CalFlow over MCP, then answering from the saved data. */
export function ChatShot({ className }: { className?: string }) {
  return (
    <ShotFrame label="ChatGPT" className={className}>
      <div className="space-y-3 text-[13px] leading-relaxed">
        <div className="ml-8 rounded-2xl rounded-br-md bg-muted/60 px-3.5 py-2.5">
          I had 3 eggs, 2 rotis and some curd for lunch.
        </div>
        <ToolCall name="log_meal" />
        <div className="mr-8 rounded-2xl rounded-bl-md border border-border/60 px-3.5 py-2.5">
          Logged — roughly 540 kcal, 27g protein. You&apos;re at 1,842 of 2,200 kcal today.
        </div>
        <div className="ml-8 rounded-2xl rounded-br-md bg-muted/60 px-3.5 py-2.5">
          What am I short on today?
        </div>
        <ToolCall name="get_daily_summary" />
        <div className="mr-8 rounded-2xl rounded-bl-md border border-border/60 px-3.5 py-2.5">
          Protein and fiber — about 38g protein and 11g fiber under target. Want a dinner idea to close it?
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/60 px-3.5 py-2.5 text-muted-foreground">
          <span className="flex-1">Message ChatGPT</span>
        </div>
      </div>
    </ShotFrame>
  );
}

/** Insights view: patterns + dinner recommendation. */
export function InsightsShot({ className }: { className?: string }) {
  return (
    <ShotFrame label="Insights" className={className}>
      <div className="space-y-3">
        {[
          { t: 'Protein consistency', d: 'Hit protein target 5 of the last 7 days.', dot: 'bg-blue-500' },
          { t: 'Water trend', d: 'Average intake up 300ml vs last week.', dot: 'bg-emerald-500' },
          { t: 'Fiber gap', d: 'Recent dinners run ~8g below fiber target.', dot: 'bg-amber-500' },
        ].map((i) => (
          <div key={i.t} className="flex items-start gap-3 rounded-xl border border-border/60 p-3.5">
            <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', i.dot)} />
            <span>
              <span className="block text-[13px] font-semibold">{i.t}</span>
              <span className="block text-[13px] text-muted-foreground">{i.d}</span>
            </span>
          </div>
        ))}
        <div className="rounded-xl bg-foreground p-4 text-background dark:bg-muted dark:text-foreground">
          <p className="text-[13px] font-semibold">Tonight: chicken + vegetables + roti</p>
          <p className="mt-0.5 text-xs opacity-70">~620 kcal · ~45g protein — closes today&apos;s gap</p>
        </div>
      </div>
    </ShotFrame>
  );
}
