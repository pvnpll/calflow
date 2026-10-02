'use client';
import { useState, useEffect, useMemo } from 'react';
import { format, subDays, addDays, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Coffee, Sun, Moon, Cookie, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import MealCard from '@/components/meals/MealCard';
import AddMealDialog from '@/components/meals/AddMealDialog';

export default function MealsPage() {
  const [date, setDate] = useState(new Date());
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addPreset, setAddPreset] = useState('lunch');
  const [refreshKey, setRefreshKey] = useState(0);

  const formattedDate = format(date, 'yyyy-MM-dd');
  const refresh = () => setRefreshKey((k) => k + 1);

  const openAdd = (type = 'lunch') => {
    setAddPreset(type);
    setIsAddOpen(true);
  };

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/meals?date=${formattedDate}`);
        if (res.ok) {
          const data = await res.json();
          setMeals(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching meals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, [formattedDate, refreshKey]);

  const handlePrevDay = () => setDate(subDays(date, 1));
  const handleNextDay = () => setDate(addDays(date, 1));
  const handleToday = () => setDate(new Date());

  const groupedMeals = useMemo(() => {
    return meals.reduce((acc, meal) => {
      const type = (meal.meal_type || 'other').toLowerCase();
      if (!acc[type]) acc[type] = [];
      acc[type].push(meal);
      return acc;
    }, {} as Record<string, any[]>);
  }, [meals]);

  const totals = useMemo(() => {
    const t = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    for (const m of meals) {
      const items = m.cf_meal_items || m.items || [];
      const sum = (pick: (x: any) => unknown) =>
        items.reduce((s: number, x: any) => {
          const n = Number(pick(x));
          return s + (Number.isFinite(n) ? n : 0);
        }, 0);
      const num = (v: unknown) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };
      t.calories += num(m.estimated_calories ?? m.estimatedCalories) || sum((x) => x.estimated_calories ?? x.calories);
      t.protein += num(m.estimated_protein ?? m.estimatedProtein) || sum((x) => x.estimated_protein ?? x.protein);
      t.carbs += num(m.estimated_carbs ?? m.estimatedCarbs) || sum((x) => x.estimated_carbs ?? x.carbs);
      t.fat += num(m.estimated_fat ?? m.estimatedFat) || sum((x) => x.estimated_fat ?? x.fat);
      t.fiber += num(m.estimated_fiber ?? m.estimatedFiber) || sum((x) => x.estimated_fiber ?? x.fiber);
    }
    return t;
  }, [meals]);

  const META: Record<string, { label: string; icon: any; blurb: string }> = {
    breakfast: { label: 'Breakfast', icon: Coffee, blurb: 'Morning fuel' },
    lunch: { label: 'Lunch', icon: Sun, blurb: 'Midday refuel' },
    dinner: { label: 'Dinner', icon: Moon, blurb: 'Evening wind-down' },
    snack: { label: 'Snacks', icon: Cookie, blurb: 'Bites in between' },
    other: { label: 'Other', icon: UtensilsCrossed, blurb: 'Anything else' },
  };
  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-28 pt-1 sm:px-0">
      {/* Header + date nav */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meals</h1>
          <p className="text-sm text-muted-foreground">
            {isToday(date) ? 'Today' : format(date, 'EEEE')} · {format(date, 'MMM d, yyyy')} · {meals.length} meal{meals.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon-sm" onClick={handlePrevDay} aria-label="Previous day">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex min-w-[132px] items-center justify-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5 text-sm font-medium">
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
            {format(date, 'MMM d, yyyy')}
          </div>
          <Button variant="outline" size="icon-sm" onClick={handleNextDay} aria-label="Next day">
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isToday(date) && (
            <Button variant="secondary" size="sm" onClick={handleToday}>
              Today
            </Button>
          )}
        </div>
      </div>

      {/* Day total strip */}
      {!loading && meals.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border bg-card px-4 py-3 text-sm">
          <span className="font-semibold">Day total</span>
          <span className="font-bold tabular-nums text-orange-500">{Math.round(totals.calories)} kcal</span>
          <span className="tabular-nums text-muted-foreground"><span className="font-semibold text-sky-500">{Math.round(totals.protein)}g</span> protein</span>
          <span className="tabular-nums text-muted-foreground"><span className="font-semibold text-amber-500">{Math.round(totals.carbs)}g</span> carbs</span>
          <span className="tabular-nums text-muted-foreground"><span className="font-semibold text-violet-500">{Math.round(totals.fat)}g</span> fat</span>
          <span className="tabular-nums text-muted-foreground"><span className="font-semibold text-emerald-500">{Math.round(totals.fiber)}g</span> fiber</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-8">
          {[0, 1].map((s) => (
            <div key={s} className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : meals.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center">
          <div className="mb-3 rounded-full bg-muted p-3">
            <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-semibold">No meals logged for this date</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">Log breakfast, lunch, dinner or a snack to see calories, macros and micros here.</p>
          <Button className="mt-4" onClick={() => openAdd('breakfast')}>
            <Plus className="h-4 w-4" /> Add your first meal
          </Button>
        </div>
      ) : (
        <div className="space-y-9">
          {mealOrder.map((type) => {
            const list = groupedMeals[type];
            const meta = META[type];
            if (!list || list.length === 0) return null;
            const Icon = meta.icon;
            return (
              <section key={type} className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full bg-muted p-1.5">
                      <Icon className="h-4 w-4 text-foreground" />
                    </span>
                    <div>
                      <h2 className="text-base font-bold leading-tight">{meta.label}</h2>
                      <p className="text-xs text-muted-foreground">{meta.blurb} · {list.length}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openAdd(type === 'other' ? 'lunch' : type)}>
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
                <div className="grid gap-3">
                  {list.map((meal: any) => (
                    <MealCard key={meal.id} meal={meal} onUpdate={refresh} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="fixed bottom-20 right-4 sm:right-6 md:bottom-6">
        <Button size="icon-lg" className="rounded-full shadow-lg" onClick={() => openAdd()} aria-label="Add meal">
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <AddMealDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        date={formattedDate}
        initialMealType={addPreset}
        onSuccess={refresh}
      />
    </div>
  );
}
