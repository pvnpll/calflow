'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function AddMealDialog({ open, onOpenChange, date, onSuccess, initialMealType }: any) {
  const [loading, setLoading] = useState(false);
  const [mealType, setMealType] = useState(initialMealType || 'lunch');
  const [description, setDescription] = useState('');
  
  // Minimal manual item entry
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');

  useEffect(() => {
    if (open && initialMealType) setMealType(initialMealType);
  }, [open, initialMealType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        date,
        meal_type: mealType,
        description,
        items: foodName ? [{
          food_name: foodName,
          quantity: 1,
          unit: 'serving',
          calories: parseFloat(calories) || 0
        }] : []
      };

      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSuccess();
        onOpenChange(false);
        setDescription('');
        setFoodName('');
        setCalories('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Meal</DialogTitle>
          <DialogDescription>
            Tip: Describe your meal naturally to ChatGPT for automatic logging!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="meal_type">Meal Type</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v ?? 'breakfast')}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="e.g. Chicken salad with olive oil dressing" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="border-t pt-4 mt-4 space-y-4">
            <Label>Quick Add Item</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Food name" value={foodName} onChange={e => setFoodName(e.target.value)} />
              <Input placeholder="Calories" type="number" value={calories} onChange={e => setCalories(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Meal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
