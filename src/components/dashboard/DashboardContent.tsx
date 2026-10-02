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

      {/* Today's Micronutrients Summary */}
      {(() => {
        const aggregatedMicros: Record<string, string | number> = {};
        for (const m of meals) {
          if (m.micronutrients && typeof m.micronutrients === 'object') {
            for (const [k, v] of Object.entries(m.micronutrients)) {
              if (typeof v === 'number') {
                aggregatedMicros[k] = ((Number(aggregatedMicros[k]) || 0) + v);
              } else if (typeof v === 'string') {
                aggregatedMicros[k] = v;
              }
            }
          }
        }
        const microEntries = Object.entries(aggregatedMicros);
        if (microEntries.length === 0) return null;

        return (
          <div className="p-4 border rounded-xl bg-card shadow-sm space-y-3">
            <h3 className="font-semibold text-sm flex items-center justify-between">
              <span>Today's Micronutrients</span>
              <span className="text-xs text-muted-foreground font-normal">Logged from meals</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {microEntries.map(([key, val]) => (
                <div key={key} className="px-3 py-1.5 rounded-lg bg-muted text-xs flex items-center gap-1.5 border">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-semibold text-foreground">
                    {typeof val === 'number' ? `~${Math.round(val * 10) / 10}` : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
