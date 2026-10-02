'use client';
import { useState, useEffect } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import MealCard from '@/components/meals/MealCard';
import AddMealDialog from '@/components/meals/AddMealDialog';

export default function MealsPage() {
  const [date, setDate] = useState(new Date());
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const formattedDate = format(date, 'yyyy-MM-dd');

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/meals?date=${formattedDate}`);
        if (res.ok) {
          const data = await res.json();
          setMeals(data);
        }
      } catch (error) {
        console.error('Error fetching meals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, [formattedDate]);

  const handlePrevDay = () => setDate(subDays(date, 1));
  const handleNextDay = () => setDate(addDays(date, 1));
  const handleToday = () => setDate(new Date());

  const groupedMeals = meals.reduce((acc, meal) => {
    const type = meal.meal_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(meal);
    return acc;
  }, {} as Record<string, any[]>);

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meals</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 font-medium min-w-[140px] justify-center">
            <CalendarIcon className="h-4 w-4" />
            {format(date, 'MMM d, yyyy')}
          </div>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={handleToday} className="hidden sm:inline-flex">
            Today
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : meals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
          <p>No meals logged for this date.</p>
          <Button variant="link" onClick={() => setIsAddOpen(true)}>Add your first meal</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {mealTypes.map(type => (
            groupedMeals[type] && groupedMeals[type].length > 0 && (
              <div key={type} className="space-y-4">
                <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
                  {type}
                </h2>
                <div className="grid gap-4">
                  {groupedMeals[type].map((meal: any) => (
                    <MealCard key={meal.id} meal={meal} onUpdate={() => {
                      // refresh trigger
                      setDate(new Date(date));
                    }} />
                  ))}
                </div>
              </div>
            )
          ))}
          {/* Other meals */}
          {groupedMeals['other'] && groupedMeals['other'].length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
                Other
              </h2>
              <div className="grid gap-4">
                {groupedMeals['other'].map((meal: any) => (
                  <MealCard key={meal.id} meal={meal} onUpdate={() => setDate(new Date(date))} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-6 right-6">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <AddMealDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        date={formattedDate}
        onSuccess={() => setDate(new Date(date))}
      />
    </div>
  );
}
