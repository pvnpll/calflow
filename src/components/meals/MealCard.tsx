'use client';
import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ChevronDown, ChevronUp, Flame, Beef, Wheat, Droplet, Leaf, Sparkles, List } from 'lucide-react';
import EditMealDialog from './EditMealDialog';
import { formatMicroKey, formatMicroValue } from '@/lib/format-micros';
import { cn } from '@/lib/utils';

interface MealCardProps {
  meal: any;
  onUpdate: () => void;
}

function safeNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function MealCard({ meal, onUpdate }: MealCardProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [detailsTab, setDetailsTab] = useState<'contents' | 'micros'>('contents');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meal?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/meals/${meal.id}`, { method: 'DELETE' });
      if (res.ok) onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const items = meal.cf_meal_items || meal.items || [];

  const sumItems = (pick: (item: any) => unknown) =>
    items.length > 0
      ? items.reduce((sum: number, item: any) => sum + safeNum(pick(item)), 0)
      : 0;

  const totalCalories =
    safeNum(meal.estimated_calories ?? meal.estimatedCalories) ||
    sumItems((i) => i.estimated_calories ?? i.calories);
  const totalProtein =
    safeNum(meal.estimated_protein ?? meal.estimatedProtein) ||
    sumItems((i) => i.estimated_protein ?? i.protein);
  const totalCarbs =
    safeNum(meal.estimated_carbs ?? meal.estimatedCarbs) ||
    sumItems((i) => i.estimated_carbs ?? i.carbs);
  const totalFat =
    safeNum(meal.estimated_fat ?? meal.estimatedFat) ||
    sumItems((i) => i.estimated_fat ?? i.fat);
  const totalFiber =
    safeNum(meal.estimated_fiber ?? meal.estimatedFiber) ||
    sumItems((i) => i.estimated_fiber ?? i.fiber);

  const microEntries =
    meal.micronutrients && typeof meal.micronutrients === 'object'
      ? Object.entries(meal.micronutrients).filter(
          ([, v]) => v !== null && v !== undefined && String(v).trim() !== ''
        )
      : [];
  const microCount = microEntries.length;

  const hasDetails = items.length > 0 || microCount > 0;
  const showDetails = detailsExpanded || items.length <= 1;

  const macros = [
    { label: 'Calories', value: `${Math.round(totalCalories)}`, unit: 'kcal', icon: Flame, color: 'text-orange-500' },
    { label: 'Protein', value: `${Math.round(totalProtein)}`, unit: 'g', icon: Beef, color: 'text-sky-500' },
    { label: 'Carbs', value: `${Math.round(totalCarbs)}`, unit: 'g', icon: Wheat, color: 'text-amber-500' },
    { label: 'Fat', value: `${Math.round(totalFat)}`, unit: 'g', icon: Droplet, color: 'text-violet-500' },
    { label: 'Fiber', value: `${Math.round(totalFiber)}`, unit: 'g', icon: Leaf, color: 'text-emerald-500' },
  ];

  return (
    <>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-snug text-balance">
              {meal.description || `${meal.meal_type ?? 'Meal'} Meal`}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {meal.meal_type && (
                <Badge variant="secondary" className="capitalize">{meal.meal_type}</Badge>
              )}
              {meal.source && (
                <Badge variant="outline" className="font-normal gap-1">
                  <Sparkles className="h-3 w-3 opacity-60" />
                  {meal.source === 'chatgpt' ? 'ChatGPT' : 
                   meal.source === 'claude' ? 'Claude' : 
                   meal.source === 'calflow_ai' ? 'CalFlow AI' : 
                   meal.source === 'web_app' ? 'Web App' : 
                   meal.source === 'mcp' ? 'MCP' : 
                   meal.source}
                </Badge>
              )}
            </div>
          </div>
          <div className="-mr-1 -mt-1 flex shrink-0 items-center">
            <Button variant="ghost" size="icon-sm" onClick={() => setIsEditOpen(true)} aria-label="Edit meal" className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleDelete} disabled={isDeleting} aria-label="Delete meal" className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="px-4 pb-4 pt-3 sm:px-5">
          <dl className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {macros.map((m) => (
              <div key={m.label} className="flex min-w-0 flex-col items-center rounded-lg bg-muted/50 px-1 py-2 text-center">
                <m.icon className={`mb-1 h-3.5 w-3.5 ${m.color}`} aria-hidden />
                <dd className="text-sm font-bold tabular-nums leading-tight">
                  {m.value}<span className="ml-0.5 text-[10px] font-medium text-muted-foreground">{m.unit}</span>
                </dd>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{m.label}</dt>
              </div>
            ))}
          </dl>

          {showDetails && hasDetails && (
            <div className="mt-3 overflow-hidden rounded-xl border bg-muted/20">
              <div className="flex items-center gap-1 border-b border-muted bg-muted/30 p-1.5" role="tablist" aria-label="Meal details">
                <button
                  type="button"
                  role="tab"
                  aria-selected={detailsTab === 'contents'}
                  onClick={() => setDetailsTab('contents')}
                  className={cn(
                    'flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors',
                    detailsTab === 'contents'
                      ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <List className="h-3.5 w-3.5" aria-hidden />
                  Contents
                  {items.length > 0 && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">{items.length}</span>
                  )}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={detailsTab === 'micros'}
                  onClick={() => setDetailsTab('micros')}
                  className={cn(
                    'flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors',
                    detailsTab === 'micros'
                      ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Micronutrients
                  {microCount > 0 && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">{microCount}</span>
                  )}
                </button>
              </div>
              {detailsTab === 'contents' ? (
                items.length > 0 ? (
                  <ul className="divide-y divide-muted">
                    {items.map((item: any, i: number) => {
                      const cals = safeNum(item.estimated_calories ?? item.calories);
                      const p = safeNum(item.estimated_protein ?? item.protein);
                      const c = safeNum(item.estimated_carbs ?? item.carbs);
                      const f = safeNum(item.estimated_fat ?? item.fat);
                      const bits = [
                        p > 0 ? `${p}g P` : '',
                        c > 0 ? `${c}g C` : '',
                        f > 0 ? `${f}g F` : '',
                      ].filter(Boolean).join(' · ');
                      return (
                        <li key={item.id ?? i} className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{item.food_name || item.name || `Item ${i + 1}`}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {[item.quantity, item.unit].filter(Boolean).join(' ') || '1 serving'}
                              {bits ? ` · ${bits}` : ''}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                            ~{Math.round(cals)} kcal
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="px-3 py-6 text-center text-xs text-muted-foreground">No items logged for this meal.</p>
                )
              ) : microCount > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-3">
                  {microEntries.map(([key, val]) => {
                    const { label, unit } = formatMicroKey(key);
                    return (
                      <div key={key} className="flex items-baseline justify-between gap-1 border-b border-muted/70 py-1.5 text-sm">
                        <span className="truncate text-muted-foreground" title={label}>{label}</span>
                        <span className="shrink-0 font-semibold tabular-nums">{formatMicroValue(val)}
                          {unit && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="px-3 py-6 text-center text-xs text-muted-foreground">No micronutrient data for this meal.</p>
              )}
            </div>
          )}

        </CardContent>
        {hasDetails && items.length > 1 && (
          <CardFooter className="border-t border-muted/60 bg-muted/20 p-0">
            <Button variant="ghost" size="sm" className="h-10 w-full rounded-none text-[13px] font-semibold text-muted-foreground hover:text-foreground" onClick={() => setDetailsExpanded((v) => !v)} aria-expanded={detailsExpanded}>
              {detailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {detailsExpanded ? 'Hide Details' : 'Show Details'}
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {isEditOpen && (
        <EditMealDialog 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
          meal={meal} 
          onSuccess={onUpdate} 
        />
      )}
    </>
  );
}
