'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { CalorieRing } from '@/components/dashboard/CalorieRing';
import { MacroCard } from '@/components/dashboard/MacroCard';
import { WaterTracker } from '@/components/dashboard/WaterTracker';
import { RecentMeals } from '@/components/dashboard/RecentMeals';
import { BodyAndHealth } from '@/components/dashboard/BodyAndHealth';
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
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [weight, setWeight] = useState<{ current: number; trend: 'up' | 'down' | 'stable'; trendValue: number; targetWeight?: number }>({ current: 0, trend: 'stable', trendValue: 0 });

  const fetchDashboardData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserName(user.user_metadata?.full_name?.split(' ')[0] || '');
      }

      const dateStr = new Date().toISOString().split('T')[0];

      const [nutritionRes, waterRes, mealsRes, weightRes, profileRes] = await Promise.allSettled([
        fetch('/api/nutrition/today'),
        fetch(`/api/water?date=${dateStr}`),
        fetch(`/api/meals?date=${dateStr}`),
        fetch('/api/weight'),
        fetch('/api/profile')
      ]);

      let profileData = null;
      if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
        profileData = await profileRes.value.json();
      }

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
        setWeightHistory(Array.isArray(weightData) ? weightData : []);
        
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
            trendValue,
            targetWeight: profileData?.goal_weight_kg || undefined
          });
        } else {
          setWeight(prev => ({ ...prev, targetWeight: profileData?.goal_weight_kg || undefined }));
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
        <div className="space-y-4 flex flex-col">
          <WaterTracker 
            initialConsumed={water.consumed} 
            target={water.target} 
          />
          <div className="flex-grow">
            <BodyAndHealth 
              weight={weight} 
              weightHistory={weightHistory} 
              onWeightLogged={fetchDashboardData} 
            />
          </div>
        </div>
        
        <div className="space-y-4 flex flex-col">
          <div className="flex-grow">
            <RecentMeals meals={meals} />
          </div>
        </div>
      </div>

      {/* Today's Micronutrients & Daily Requirements Summary */}
      {(() => {
        // Collect consumed amounts for today
        const consumedMicros: Record<string, number> = {};
        for (const m of meals) {
          if (m.micronutrients && typeof m.micronutrients === 'object') {
            for (const [k, v] of Object.entries(m.micronutrients)) {
              const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''));
              if (!isNaN(num) && num > 0) {
                const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                consumedMicros[norm] = (consumedMicros[norm] || 0) + num;
              }
            }
          }
        }

        // Definitive 27 Essential Micronutrients (FDA / NIH standards)
        const ESSENTIAL_MICRONUTRIENTS = [
          // 14 Vitamins
          { id: 'vitamina', name: 'Vitamin A', category: 'Vitamin', target: 900, unit: 'mcg', aliases: ['vitamina', 'vita'] },
          { id: 'vitaminc', name: 'Vitamin C', category: 'Vitamin', target: 90, unit: 'mg', aliases: ['vitaminc', 'vitc', 'ascorbicacid'] },
          { id: 'vitamind', name: 'Vitamin D', category: 'Vitamin', target: 20, unit: 'mcg', aliases: ['vitamind', 'vitd'] },
          { id: 'vitamine', name: 'Vitamin E', category: 'Vitamin', target: 15, unit: 'mg', aliases: ['vitamine', 'vite'] },
          { id: 'vitamink', name: 'Vitamin K', category: 'Vitamin', target: 120, unit: 'mcg', aliases: ['vitamink', 'vitk'] },
          { id: 'thiamin', name: 'Thiamin (B1)', category: 'Vitamin', target: 1.2, unit: 'mg', aliases: ['thiamin', 'vitaminb1', 'b1'] },
          { id: 'riboflavin', name: 'Riboflavin (B2)', category: 'Vitamin', target: 1.3, unit: 'mg', aliases: ['riboflavin', 'vitaminb2', 'b2'] },
          { id: 'niacin', name: 'Niacin (B3)', category: 'Vitamin', target: 16, unit: 'mg', aliases: ['niacin', 'vitaminb3', 'b3'] },
          { id: 'pantothenicacid', name: 'Pantothenic Acid (B5)', category: 'Vitamin', target: 5, unit: 'mg', aliases: ['pantothenicacid', 'vitaminb5', 'b5'] },
          { id: 'vitaminb6', name: 'Vitamin B6', category: 'Vitamin', target: 1.7, unit: 'mg', aliases: ['vitaminb6', 'b6'] },
          { id: 'biotin', name: 'Biotin (B7)', category: 'Vitamin', target: 30, unit: 'mcg', aliases: ['biotin', 'vitaminb7', 'b7'] },
          { id: 'folate', name: 'Folate (B9)', category: 'Vitamin', target: 400, unit: 'mcg', aliases: ['folate', 'vitaminb9', 'b9', 'folicacid'] },
          { id: 'vitaminb12', name: 'Vitamin B12', category: 'Vitamin', target: 2.4, unit: 'mcg', aliases: ['vitaminb12', 'b12', 'cobalamin'] },
          { id: 'choline', name: 'Choline', category: 'Vitamin', target: 550, unit: 'mg', aliases: ['choline'] },
          
          // 13 Minerals & Trace Elements
          { id: 'calcium', name: 'Calcium', category: 'Mineral', target: 1300, unit: 'mg', aliases: ['calcium'] },
          { id: 'iron', name: 'Iron', category: 'Mineral', target: 18, unit: 'mg', aliases: ['iron'] },
          { id: 'magnesium', name: 'Magnesium', category: 'Mineral', target: 420, unit: 'mg', aliases: ['magnesium'] },
          { id: 'potassium', name: 'Potassium', category: 'Mineral', target: 4700, unit: 'mg', aliases: ['potassium'] },
          { id: 'sodium', name: 'Sodium', category: 'Mineral', target: 2300, unit: 'mg', aliases: ['sodium'] },
          { id: 'zinc', name: 'Zinc', category: 'Mineral', target: 11, unit: 'mg', aliases: ['zinc'] },
          { id: 'selenium', name: 'Selenium', category: 'Mineral', target: 55, unit: 'mcg', aliases: ['selenium'] },
          { id: 'phosphorus', name: 'Phosphorus', category: 'Mineral', target: 1250, unit: 'mg', aliases: ['phosphorus'] },
          { id: 'copper', name: 'Copper', category: 'Mineral', target: 0.9, unit: 'mg', aliases: ['copper'] },
          { id: 'manganese', name: 'Manganese', category: 'Mineral', target: 2.3, unit: 'mg', aliases: ['manganese'] },
          { id: 'iodine', name: 'Iodine', category: 'Mineral', target: 150, unit: 'mcg', aliases: ['iodine'] },
          { id: 'chromium', name: 'Chromium', category: 'Mineral', target: 35, unit: 'mcg', aliases: ['chromium'] },
          { id: 'molybdenum', name: 'Molybdenum', category: 'Mineral', target: 45, unit: 'mcg', aliases: ['molybdenum'] },
        ];

        const getConsumedFor = (item: typeof ESSENTIAL_MICRONUTRIENTS[0]) => {
          for (const alias of item.aliases) {
            for (const [key, val] of Object.entries(consumedMicros)) {
              if (key === alias || key.includes(alias) || alias.includes(key)) {
                return val;
              }
            }
          }
          return 0;
        };

        const totalActive = ESSENTIAL_MICRONUTRIENTS.filter(item => getConsumedFor(item) > 0).length;

        return (
          <div className="p-5 border rounded-2xl bg-card shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
              <div>
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <span>Essential Vitamins & Micronutrients</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-normal">
                    {totalActive} of 27 tracked today
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time progress compared against official US FDA & NIH Daily Values (DV)
                </p>
              </div>
              <span className="text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium self-start sm:self-auto border border-primary/20">
                27 Essential FDA/NIH Standards
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ESSENTIAL_MICRONUTRIENTS.map((nutrient) => {
                const consumed = getConsumedFor(nutrient);
                const percent = Math.min(100, Math.round((consumed / nutrient.target) * 100));
                const formattedConsumed = Math.round(consumed * 10) / 10;
                const isMet = percent >= 100;
                const isGood = percent >= 50;

                return (
                  <div
                    key={nutrient.id}
                    className={`p-3 rounded-xl border transition-colors ${
                      consumed > 0 ? 'bg-background' : 'bg-muted/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex justify-between items-start text-xs mb-1.5">
                      <div>
                        <span className="font-semibold text-foreground block">{nutrient.name}</span>
                        <span className="text-[10px] text-muted-foreground">{nutrient.category}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          consumed === 0
                            ? 'bg-muted text-muted-foreground'
                            : isMet
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : isGood
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {percent}% DV
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span className={consumed > 0 ? 'font-medium text-foreground' : ''}>
                        {consumed > 0 ? `~${formattedConsumed}` : '0'} {nutrient.unit}
                      </span>
                      <span>Target: {nutrient.target} {nutrient.unit}</span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          consumed === 0
                            ? 'w-0'
                            : isMet
                            ? 'bg-emerald-500'
                            : isGood
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
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
