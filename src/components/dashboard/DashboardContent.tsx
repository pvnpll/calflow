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
  const [showAllVitamins, setShowAllVitamins] = useState(false);
  const [showAllMinerals, setShowAllMinerals] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      
      if (data.profile) {
        setUserName(data.profile.name?.split(' ')[0] || '');
      }

      // Parse nutrition summary
      if (data.nutrition) {
        const targets = data.nutrition.targets || {};
        const consumed = data.nutrition.consumed || {};
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

      // Parse water
      if (data.waterTotal !== null) {
        const waterAmount = typeof data.waterTotal === 'number' ? data.waterTotal : (data.waterTotal?.total || 0);
        setWater(prev => ({ ...prev, consumed: waterAmount }));
      }

      // Parse meals
      if (data.meals) {
        setMeals(Array.isArray(data.meals) ? data.meals : []);
      }

      // Parse weight
      if (data.weightHistory) {
        const weightData = data.weightHistory;
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
            targetWeight: data.profile?.goal_weight_kg || undefined
          });
        } else {
          setWeight(prev => ({ ...prev, targetWeight: data.profile?.goal_weight_kg || undefined }));
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
            <RecentMeals meals={meals} />
          </div>
        </div>
        
        <div className="space-y-4 flex flex-col">
          <div className="flex-grow">
            <BodyAndHealth 
              weight={weight} 
              weightHistory={weightHistory} 
              onWeightLogged={fetchDashboardData} 
            />
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
        // Display: only 12 "key" essentials — 6 vitamins + 6 minerals.
        // Full list retained so AI logging / alias matching keeps working.
        const ESSENTIAL_MICRONUTRIENTS = [
          // 14 Vitamins
          { id: 'vitamina', name: 'Vitamin A', category: 'Vitamin', target: 900, unit: 'mcg', featured: true, aliases: ['vitamina', 'vita'] },
          { id: 'vitaminc', name: 'Vitamin C', category: 'Vitamin', target: 90, unit: 'mg', featured: true, aliases: ['vitaminc', 'vitc', 'ascorbicacid'] },
          { id: 'vitamind', name: 'Vitamin D', category: 'Vitamin', target: 20, unit: 'mcg', featured: true, aliases: ['vitamind', 'vitd'] },
          { id: 'vitamine', name: 'Vitamin E', category: 'Vitamin', target: 15, unit: 'mg', featured: false, aliases: ['vitamine', 'vite'] },
          { id: 'vitamink', name: 'Vitamin K', category: 'Vitamin', target: 120, unit: 'mcg', featured: true, aliases: ['vitamink', 'vitk'] },
          { id: 'thiamin', name: 'Thiamin (B1)', category: 'Vitamin', target: 1.2, unit: 'mg', featured: false, aliases: ['thiamin', 'vitaminb1', 'b1'] },
          { id: 'riboflavin', name: 'Riboflavin (B2)', category: 'Vitamin', target: 1.3, unit: 'mg', featured: false, aliases: ['riboflavin', 'vitaminb2', 'b2'] },
          { id: 'niacin', name: 'Niacin (B3)', category: 'Vitamin', target: 16, unit: 'mg', featured: false, aliases: ['niacin', 'vitaminb3', 'b3'] },
          { id: 'pantothenicacid', name: 'Pantothenic Acid (B5)', category: 'Vitamin', target: 5, unit: 'mg', featured: false, aliases: ['pantothenicacid', 'vitaminb5', 'b5'] },
          { id: 'vitaminb6', name: 'Vitamin B6', category: 'Vitamin', target: 1.7, unit: 'mg', featured: false, aliases: ['vitaminb6', 'b6'] },
          { id: 'biotin', name: 'Biotin (B7)', category: 'Vitamin', target: 30, unit: 'mcg', featured: false, aliases: ['biotin', 'vitaminb7', 'b7'] },
          { id: 'folate', name: 'Folate (B9)', category: 'Vitamin', target: 400, unit: 'mcg', featured: true, aliases: ['folate', 'vitaminb9', 'b9', 'folicacid'] },
          { id: 'vitaminb12', name: 'Vitamin B12', category: 'Vitamin', target: 2.4, unit: 'mcg', featured: true, aliases: ['vitaminb12', 'b12', 'cobalamin'] },
          { id: 'choline', name: 'Choline', category: 'Vitamin', target: 550, unit: 'mg', featured: false, aliases: ['choline'] },
          
          // 13 Minerals & Trace Elements
          { id: 'calcium', name: 'Calcium', category: 'Mineral', target: 1300, unit: 'mg', featured: true, aliases: ['calcium'] },
          { id: 'iron', name: 'Iron', category: 'Mineral', target: 18, unit: 'mg', featured: true, aliases: ['iron'] },
          { id: 'magnesium', name: 'Magnesium', category: 'Mineral', target: 420, unit: 'mg', featured: true, aliases: ['magnesium'] },
          { id: 'potassium', name: 'Potassium', category: 'Mineral', target: 4700, unit: 'mg', featured: true, aliases: ['potassium'] },
          { id: 'sodium', name: 'Sodium', category: 'Mineral', target: 2300, unit: 'mg', featured: true, aliases: ['sodium'] },
          { id: 'zinc', name: 'Zinc', category: 'Mineral', target: 11, unit: 'mg', featured: true, aliases: ['zinc'] },
          { id: 'selenium', name: 'Selenium', category: 'Mineral', target: 55, unit: 'mcg', featured: false, aliases: ['selenium'] },
          { id: 'phosphorus', name: 'Phosphorus', category: 'Mineral', target: 1250, unit: 'mg', featured: false, aliases: ['phosphorus'] },
          { id: 'copper', name: 'Copper', category: 'Mineral', target: 0.9, unit: 'mg', featured: false, aliases: ['copper'] },
          { id: 'manganese', name: 'Manganese', category: 'Mineral', target: 2.3, unit: 'mg', featured: false, aliases: ['manganese'] },
          { id: 'iodine', name: 'Iodine', category: 'Mineral', target: 150, unit: 'mcg', featured: false, aliases: ['iodine'] },
          { id: 'chromium', name: 'Chromium', category: 'Mineral', target: 35, unit: 'mcg', featured: false, aliases: ['chromium'] },
          { id: 'molybdenum', name: 'Molybdenum', category: 'Mineral', target: 45, unit: 'mcg', featured: false, aliases: ['molybdenum'] },
        ];

        // Only the 12 featured essentials are displayed (6 + 6) by default.
        // Toggles reveal the remaining hidden items in each group.
        // Expanded lists keep featured 6 first (stable order), extras appended after.
        const ALL_VITAMINS = ESSENTIAL_MICRONUTRIENTS.filter(n => n.category === 'Vitamin');
        const ALL_MINERALS = ESSENTIAL_MICRONUTRIENTS.filter(n => n.category === 'Mineral');
        const FEATURED_VITAMINS = ALL_VITAMINS.filter(n => n.featured);
        const FEATURED_MINERALS = ALL_MINERALS.filter(n => n.featured);
        const EXTRA_VITAMINS = ALL_VITAMINS.filter(n => !n.featured);
        const EXTRA_MINERALS = ALL_MINERALS.filter(n => !n.featured);
        const HIDDEN_VITAMIN_COUNT = EXTRA_VITAMINS.length;
        const HIDDEN_MINERAL_COUNT = EXTRA_MINERALS.length;
        const visibleVitamins = showAllVitamins ? [...FEATURED_VITAMINS, ...EXTRA_VITAMINS] : FEATURED_VITAMINS;
        const visibleMinerals = showAllMinerals ? [...FEATURED_MINERALS, ...EXTRA_MINERALS] : FEATURED_MINERALS;
        const DISPLAYED_NUTRIENTS = [...visibleVitamins, ...visibleMinerals];
        const TOTAL_COUNT = showAllVitamins || showAllMinerals ? ESSENTIAL_MICRONUTRIENTS.length : DISPLAYED_NUTRIENTS.length;

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

        const totalActive = DISPLAYED_NUTRIENTS.filter(item => getConsumedFor(item) > 0).length;

        const renderNutrientCard = (nutrient: typeof ESSENTIAL_MICRONUTRIENTS[0]) => {
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
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-foreground">{nutrient.name}</span>
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
        };

        return (
          <div className="p-5 border rounded-2xl bg-card shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
              <div>
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <span>Essential Vitamins & Minerals</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-normal">
                    {totalActive} of {TOTAL_COUNT} tracked today
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time progress compared against official US FDA & NIH Daily Values (DV)
                </p>
              </div>
              <span className="text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium self-start sm:self-auto border border-primary/20">
                {showAllVitamins || showAllMinerals ? 'All 27 FDA/NIH Standards' : '12 Key Essentials · FDA/NIH'}
              </span>
            </div>

            {/* Vitamins — 6 most essential */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <span>Vitamins</span>
                  <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-normal">
                    {showAllVitamins ? `all ${ALL_VITAMINS.length}` : `${FEATURED_VITAMINS.length} essentials`}
                  </span>
                </h4>
                <button
                  onClick={() => setShowAllVitamins(prev => !prev)}
                  className="text-xs font-medium text-primary hover:underline shrink-0"
                >
                  {showAllVitamins ? 'Show less' : `Show all ${ALL_VITAMINS.length} (+${HIDDEN_VITAMIN_COUNT} more)`}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {visibleVitamins.map(renderNutrientCard)}
              </div>
            </div>

            {/* Minerals — 6 most essential */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <span>Minerals</span>
                  <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-normal">
                    {showAllMinerals ? `all ${ALL_MINERALS.length}` : `${FEATURED_MINERALS.length} essentials`}
                  </span>
                </h4>
                <button
                  onClick={() => setShowAllMinerals(prev => !prev)}
                  className="text-xs font-medium text-primary hover:underline shrink-0"
                >
                  {showAllMinerals ? 'Show less' : `Show all ${ALL_MINERALS.length} (+${HIDDEN_MINERAL_COUNT} more)`}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {visibleMinerals.map(renderNutrientCard)}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
