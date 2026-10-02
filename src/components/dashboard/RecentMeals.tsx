import { Card } from '@/components/ui/card';
import { Utensils, Coffee, Sun, Moon } from 'lucide-react';

interface Meal {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | string;
  description?: string;
  calories?: number;
  estimated_calories?: number;
  estimatedCalories?: number;
}

interface RecentMealsProps {
  meals: any[];
}

export function RecentMeals({ meals }: RecentMealsProps) {
  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return <Coffee className="h-4 w-4 text-orange-500" />;
      case 'lunch': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'dinner': return <Moon className="h-4 w-4 text-indigo-500" />;
      case 'snack': return <Utensils className="h-4 w-4 text-green-500" />;
      default: return <Utensils className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-5 flex flex-col h-full">
      <h3 className="font-semibold mb-4">Today's Meals</h3>
      
      <div className="flex-1">
        {meals.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
            <Utensils className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No meals logged today. Talk to your AI assistant to get started!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {meals.map((meal) => {
              const cal = Number(meal.estimated_calories ?? meal.estimatedCalories ?? meal.calories ?? 0);
              return (
                <li key={meal.id} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 bg-muted rounded-full">
                      {getMealIcon(meal.meal_type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">{meal.meal_type}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{meal.description || 'Meal'}</p>
                    </div>
                  </div>
                  <div className="font-semibold whitespace-nowrap text-orange-500">
                    ~{Math.round(cal)} kcal
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
