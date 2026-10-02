'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { CalorieRing } from '@/components/dashboard/CalorieRing';
import { MacroCard } from '@/components/dashboard/MacroCard';
import { WaterTracker } from '@/components/dashboard/WaterTracker';
import { RecentMeals } from '@/components/dashboard/RecentMeals';
import { WeightCard } from '@/components/dashboard/WeightCard';
import { createClient } from '@/lib/supabase/client';

export default function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  
  const [nutrition, setNutrition] = useState({
    calories: { consumed: 0, target: 2000 },
    protein: { consumed: 0, target: 150 },
    carbs: { consumed: 0, target: 250 },
    fat: { consumed: 0, target: 65 },
    fiber: { consumed: 0, target: 30 }
  });
  
  const [water, setWater] = useState({ consumed: 0, target: 2500 });
  const [meals, setMeals] = useState<any[]>([]);
  const [weight, setWeight] = useState<{ current: number; trend: 'up' | 'down' | 'stable'; trendValue: number }>({ current: 0, trend: 'stable', trendValue: 0 });

  const fetchDashboardData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserName(user.user_metadata?.full_name?.split(' ')[0] || '');
      }

      const dateStr = new Date().toISOString().split('T')[0];

      const [nutritionRes, waterRes, mealsRes, weightRes] = await Promise.allSettled([
        fetch('/api/nutrition/today'),
        fetch(`/api/water?date=${dateStr}`),
        fetch(`/api/meals?date=${dateStr}`),
        fetch('/api/weight')
      ]);

      // Parse nutrition summary
      if (nutritionRes.status === 'fulfilled' && nutritionRes.value.ok) {
        const data = await nutritionRes.value.json();
        if (data) {
          const targets = data.targets || {};
          const consumed = data.consumed || {};
          setNutrition({
            calories: { 
              consumed: Math.round(consumed.calories || 0), 
              target: targets.calorie_target || 2000 
            },
            protein: { 
              consumed: Math.round(consumed.protein || 0), 
              target: targets.protein_target || 150 
            },
            carbs: { 
              consumed: Math.round(consumed.carbs || 0), 
              target: targets.carbohydrate_target || 250 
            },
            fat: { 
              consumed: Math.round(consumed.fat || 0), 
              target: targets.fat_target || 65 
            },
            fiber: { 
              consumed: Math.round(consumed.fiber || 0), 
              target: targets.fiber_target || 30 
            }
          });

          if (targets.water_target_ml) {
            setWater(prev => ({ ...prev, target: targets.water_target_ml }));
          }
        }
      }

      // Parse water
      if (waterRes.status === 'fulfilled' && waterRes.value.ok) {
        const waterData = await waterRes.value.json();
        const waterAmount = typeof waterData === 'number' ? waterData : (waterData?.total || 0);
        setWater(prev => ({ ...prev, consumed: waterAmount }));
      }

      // Parse meals
      if (mealsRes.status === 'fulfilled' && mealsRes.value.ok) {
        const mealsData = await mealsRes.value.json();
        setMeals(Array.isArray(mealsData) ? mealsData : []);
      }

      // Parse weight
      if (weightRes.status === 'fulfilled' && weightRes.value.ok) {
        const weightData = await weightRes.value.json();
        if (Array.isArray(weightData) && weightData.length > 0) {
          const latest = weightData[weightData.length - 1];
          let trend: 'up' | 'down' | 'stable' = 'stable';
          let trendValue = 0;
          
          if (weightData.length >= 2) {
            const previous = weightData[weightData.length - 2];
            const diff = latest.weight_kg - previous.weight_kg;
            trendValue = Math.abs(Number(diff.toFixed(1)));
            trend = diff > 0.1 ? 'up' : diff < -0.1 ? 'down' : 'stable';
          }
          
          setWeight({ 
            current: Number(latest.weight_kg), 
            trend, 
            trendValue 
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}{userName ? `, ${userName}` : ''}
        </h1>
        <p className="text-muted-foreground">{todayStr}</p>
      </div>

      <div className="flex justify-center py-6">
        <CalorieRing 
          consumed={nutrition.calories.consumed} 
          target={nutrition.calories.target} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MacroCard 
          name="Protein" 
          consumed={nutrition.protein.consumed} 
          target={nutrition.protein.target} 
          colorClass="bg-blue-500" 
        />
        <MacroCard 
          name="Carbs" 
          consumed={nutrition.carbs.consumed} 
          target={nutrition.carbs.target} 
          colorClass="bg-amber-500" 
        />
        <MacroCard 
          name="Fat" 
          consumed={nutrition.fat.consumed} 
          target={nutrition.fat.target} 
          colorClass="bg-purple-500" 
        />
        <MacroCard 
          name="Fiber" 
          consumed={nutrition.fiber.consumed} 
          target={nutrition.fiber.target} 
          colorClass="bg-emerald-500" 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <WaterTracker 
            initialConsumed={water.consumed} 
            target={water.target} 
          />
          {weight.current > 0 && (
            <WeightCard 
              currentWeight={weight.current}
              trend={weight.trend}
              trendValue={weight.trendValue}
            />
          )}
        </div>
        
        <div>
          <RecentMeals meals={meals} />
        </div>
      </div>

      {/* Today's Micronutrients & Daily Requirements Summary */}
      {(() => {
        const aggregatedMicros: Record<string, number> = {};
        for (const m of meals) {
          if (m.micronutrients && typeof m.micronutrients === 'object') {
            for (const [k, v] of Object.entries(m.micronutrients)) {
              const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''));
              if (!isNaN(num) && num > 0) {
                aggregatedMicros[k] = ((aggregatedMicros[k] || 0) + num);
              }
            }
          }
        }
        const microEntries = Object.entries(aggregatedMicros);
        if (microEntries.length === 0) return null;

        // Import helper dynamically inline
        const findRef = (key: string) => {
          const norm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
          const FDA_REFS: Record<string, { name: string; dv: number; unit: string }> = {
            vitamina: { name: 'Vitamin A', dv: 900, unit: 'mcg' },
            vitaminc: { name: 'Vitamin C', dv: 90, unit: 'mg' },
            vitamind: { name: 'Vitamin D', dv: 20, unit: 'mcg' },
            vitamine: { name: 'Vitamin E', dv: 15, unit: 'mg' },
            vitamink: { name: 'Vitamin K', dv: 120, unit: 'mcg' },
            vitaminb1: { name: 'Thiamin (B1)', dv: 1.2, unit: 'mg' },
            thiamin: { name: 'Thiamin (B1)', dv: 1.2, unit: 'mg' },
            vitaminb2: { name: 'Riboflavin (B2)', dv: 1.3, unit: 'mg' },
            riboflavin: { name: 'Riboflavin (B2)', dv: 1.3, unit: 'mg' },
            vitaminb3: { name: 'Niacin (B3)', dv: 16, unit: 'mg' },
            niacin: { name: 'Niacin (B3)', dv: 16, unit: 'mg' },
            vitaminb6: { name: 'Vitamin B6', dv: 1.7, unit: 'mg' },
            folate: { name: 'Folate (B9)', dv: 400, unit: 'mcg' },
            vitaminb9: { name: 'Folate (B9)', dv: 400, unit: 'mcg' },
            vitaminb12: { name: 'Vitamin B12', dv: 2.4, unit: 'mcg' },
            choline: { name: 'Choline', dv: 550, unit: 'mg' },
            biotin: { name: 'Biotin (B7)', dv: 30, unit: 'mcg' },
            pantothenicacid: { name: 'Pantothenic Acid (B5)', dv: 5, unit: 'mg' },
            calcium: { name: 'Calcium', dv: 1300, unit: 'mg' },
            iron: { name: 'Iron', dv: 18, unit: 'mg' },
            magnesium: { name: 'Magnesium', dv: 420, unit: 'mg' },
            potassium: { name: 'Potassium', dv: 4700, unit: 'mg' },
            sodium: { name: 'Sodium', dv: 2300, unit: 'mg' },
            zinc: { name: 'Zinc', dv: 11, unit: 'mg' },
            selenium: { name: 'Selenium', dv: 55, unit: 'mcg' },
            phosphorus: { name: 'Phosphorus', dv: 1250, unit: 'mg' },
            copper: { name: 'Copper', dv: 0.9, unit: 'mg' },
            manganese: { name: 'Manganese', dv: 2.3, unit: 'mg' },
            iodine: { name: 'Iodine', dv: 150, unit: 'mcg' },
            chromium: { name: 'Chromium', dv: 35, unit: 'mcg' },
            fiber: { name: 'Dietary Fiber', dv: 28, unit: 'g' },
          };
          for (const [k, ref] of Object.entries(FDA_REFS)) {
            if (norm.includes(k) || k.includes(norm)) return ref;
          }
          return null;
        };

        return (
          <div className="p-5 border rounded-2xl bg-card shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="font-semibold text-base">Vitamins & Micronutrients</h3>
                <p className="text-xs text-muted-foreground">
                  Today's intake compared against trusted FDA / NIH Daily Values (DV)
                </p>
              </div>
              <span className="text-[11px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium self-start sm:self-auto">
                Official FDA/NIH Standards
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {microEntries.map(([key, val]) => {
                const ref = findRef(key);
                const percent = ref ? Math.min(100, Math.round((val / ref.dv) * 100)) : null;
                const formattedVal = Math.round(val * 10) / 10;

                return (
                  <div key={key} className="p-3 rounded-xl border bg-background/50 space-y-2">
                    <div className="flex justify-between items-start text-xs">
                      <span className="font-medium text-foreground">
                        {ref?.name || key.replace(/_/g, ' ')}
                      </span>
                      {percent !== null && (
                        <span className={`text-[11px] font-bold ${percent >= 100 ? 'text-emerald-500' : percent >= 50 ? 'text-blue-500' : 'text-amber-500'}`}>
                          {percent}% DV
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>~{formattedVal} {ref?.unit || ''}</span>
                      {ref && <span>Target: {ref.dv} {ref.unit}</span>}
                    </div>

                    {percent !== null && (
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${percent >= 100 ? 'bg-emerald-500' : percent >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
