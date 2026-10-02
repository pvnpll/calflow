'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import EditMealDialog from './EditMealDialog';

interface MealCardProps {
  meal: any;
  onUpdate: () => void;
}

export default function MealCard({ meal, onUpdate }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
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

  const totalCalories = meal.items?.reduce((sum: number, item: any) => sum + (item.calories || 0), 0) || 0;
  const totalProtein = meal.items?.reduce((sum: number, item: any) => sum + (item.protein || 0), 0) || 0;
  const totalCarbs = meal.items?.reduce((sum: number, item: any) => sum + (item.carbs || 0), 0) || 0;
  const totalFat = meal.items?.reduce((sum: number, item: any) => sum + (item.fat || 0), 0) || 0;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{meal.description || `${meal.meal_type} Meal`}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{meal.meal_type}</Badge>
                {meal.source && <Badge variant="outline">{meal.source}</Badge>}
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm font-medium mb-4">
            <span className="text-orange-500">~{Math.round(totalCalories)} kcal</span>
            <span className="text-blue-500">~{Math.round(totalProtein)}g P</span>
            <span className="text-green-500">~{Math.round(totalCarbs)}g C</span>
            <span className="text-yellow-600">~{Math.round(totalFat)}g F</span>
          </div>

          {expanded && (
            <div className="space-y-3 mt-4 border-t pt-4">
              {meal.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.food_name}</span>
                    <span className="text-muted-foreground ml-2">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {Math.round(item.calories || 0)} kcal
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {meal.items && meal.items.length > 0 && (
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="w-full h-8" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
              {expanded ? 'Hide Details' : 'Show Details'}
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
