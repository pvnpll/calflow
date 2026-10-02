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

  const items = meal.cf_meal_items || meal.items || [];
  
  // Total calories and macros: prefer explicit meal columns, fallback to summing items
  const totalCalories = Number(meal.estimated_calories ?? meal.estimatedCalories ?? (items.length > 0 ? items.reduce((sum: number, item: any) => sum + Number(item.estimated_calories || item.calories || 0), 0) : 0)) || 0;
  const totalProtein = Number(meal.estimated_protein ?? meal.estimatedProtein ?? (items.length > 0 ? items.reduce((sum: number, item: any) => sum + Number(item.estimated_protein || item.protein || 0), 0) : 0)) || 0;
  const totalCarbs = Number(meal.estimated_carbs ?? meal.estimatedCarbs ?? (items.length > 0 ? items.reduce((sum: number, item: any) => sum + Number(item.estimated_carbs || item.carbs || 0), 0) : 0)) || 0;
  const totalFat = Number(meal.estimated_fat ?? meal.estimatedFat ?? (items.length > 0 ? items.reduce((sum: number, item: any) => sum + Number(item.estimated_fat || item.fat || 0), 0) : 0)) || 0;
  const totalFiber = Number(meal.estimated_fiber ?? meal.estimatedFiber ?? (items.length > 0 ? items.reduce((sum: number, item: any) => sum + Number(item.estimated_fiber || item.fiber || 0), 0) : 0)) || 0;

  const micronutrients = meal.micronutrients && typeof meal.micronutrients === 'object' && Object.keys(meal.micronutrients).length > 0 ? meal.micronutrients : null;

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
          <div className="flex flex-wrap gap-4 text-sm font-medium mb-3">
            <span className="text-orange-500 font-semibold">~{Math.round(totalCalories)} kcal</span>
            <span className="text-blue-500">~{Math.round(totalProtein)}g P</span>
            <span className="text-amber-500">~{Math.round(totalCarbs)}g C</span>
            <span className="text-purple-500">~{Math.round(totalFat)}g F</span>
            {totalFiber > 0 && <span className="text-emerald-500">~{Math.round(totalFiber)}g Fiber</span>}
          </div>

          {/* Micronutrients display */}
          {micronutrients && (
            <div className="mt-2 mb-3 p-2.5 bg-muted/40 rounded-md border text-xs">
              <span className="font-semibold text-muted-foreground block mb-1">Micronutrients:</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(micronutrients).map(([key, val]) => (
                  <Badge key={key} variant="secondary" className="font-normal text-xs py-0.5">
                    {key.replace(/_/g, ' ')}: {String(val)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {expanded && (
            <div className="space-y-3 mt-4 border-t pt-4">
              {items.map((item: any, i: number) => {
                const itemCals = Number(item.estimated_calories ?? item.calories ?? 0);
                const itemProtein = Number(item.estimated_protein ?? item.protein ?? 0);
                const itemCarbs = Number(item.estimated_carbs ?? item.carbs ?? 0);
                const itemFat = Number(item.estimated_fat ?? item.fat ?? 0);
                return (
                  <div key={i} className="flex justify-between items-center text-sm py-1 border-b last:border-0 border-muted">
                    <div>
                      <span className="font-medium">{item.food_name || item.name}</span>
                      {(item.quantity || item.unit) && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          {item.quantity} {item.unit}
                        </span>
                      )}
                      {(itemProtein > 0 || itemCarbs > 0 || itemFat > 0) && (
                        <span className="text-xs text-muted-foreground block">
                          {itemProtein > 0 ? `${itemProtein}g P ` : ''}
                          {itemCarbs > 0 ? `${itemCarbs}g C ` : ''}
                          {itemFat > 0 ? `${itemFat}g F` : ''}
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground font-medium">
                      ~{Math.round(itemCals)} kcal
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        {items.length > 0 && (
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
              {expanded ? 'Hide Items' : `Show ${items.length} Item${items.length > 1 ? 's' : ''}`}
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
