'use client';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InsightCard from '@/components/insights/InsightCard';
import NutritionChart from '@/components/insights/NutritionChart';
import WeightChart from '@/components/insights/WeightChart';
import WaterChart from '@/components/insights/WaterChart';

export default function InsightsPage() {
  const [period, setPeriod] = useState('7');
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchInsightsData = async () => {
      setLoading(true);
      try {
        const days = parseInt(period, 10) || 7;
        const endDate = new Date().toISOString().split('T')[0];
        const startDateObj = new Date();
        startDateObj.setDate(startDateObj.getDate() - (days - 1));
        const startDate = startDateObj.toISOString().split('T')[0];

        const [insightsRes, mealsRes, waterRes] = await Promise.allSettled([
          fetch(`/api/insights?days=${days}`),
          fetch(`/api/meals?start=${startDate}&end=${endDate}`),
          fetch(`/api/water?start=${startDate}&end=${endDate}`)
        ]);

        if (insightsRes.status === 'fulfilled' && insightsRes.value.ok) {
          const data = await insightsRes.value.json();
          setInsights(data);
        }

        // Build continuous chart series for the period
        const dailyMap: Record<string, any> = {};
        for (let i = 0; i < days; i++) {
          const d = new Date(startDateObj);
          d.setDate(d.getDate() + i);
          const dateKey = d.toISOString().split('T')[0];
          const displayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
          dailyMap[dateKey] = {
            date: displayLabel,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            water: 0
          };
        }

        if (mealsRes.status === 'fulfilled' && mealsRes.value.ok) {
          const mealsData = await mealsRes.value.json();
          if (Array.isArray(mealsData)) {
            for (const meal of mealsData) {
              const d = meal.date;
              if (dailyMap[d]) {
                dailyMap[d].calories += Number(meal.estimated_calories || 0);
                dailyMap[d].protein += Number(meal.estimated_protein || 0);
                dailyMap[d].carbs += Number(meal.estimated_carbs || 0);
                dailyMap[d].fat += Number(meal.estimated_fat || 0);
              }
            }
          }
        }

        if (waterRes.status === 'fulfilled' && waterRes.value.ok) {
          const waterData = await waterRes.value.json();
          if (Array.isArray(waterData)) {
            for (const log of waterData) {
              const d = log.date;
              if (dailyMap[d]) {
                dailyMap[d].water += Number(log.amount_ml || 0);
              }
            }
          }
        }

        setChartData(Object.values(dailyMap));
      } catch (err) {
        console.error('Error fetching insights:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsightsData();
  }, [period]);

  const averages = insights?.averages || {};
  const consistency = insights?.consistency || {};
  const avgCalories = Number(averages.calories || 0);
  const avgProtein = Number(averages.protein || 0);
  const avgWater = Number(averages.water || 0);

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Insights</h1>
        <Select value={period} onValueChange={(v) => setPeriod(v ?? '7')}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InsightCard 
          title="Avg Calories" 
          value={isNaN(avgCalories) ? '0' : Math.round(avgCalories).toLocaleString()} 
          subtitle="kcal/day" 
        />
        <InsightCard 
          title="Avg Protein" 
          value={isNaN(avgProtein) ? '0g' : `${Math.round(avgProtein)}g`} 
          subtitle="per day" 
        />
        <InsightCard 
          title="Avg Water" 
          value={isNaN(avgWater) ? '0L' : `${(avgWater / 1000).toFixed(1)}L`} 
          subtitle="per day" 
        />
        <InsightCard 
          title="Consistency" 
          value={`${consistency.daysLogged || 0}/${period}`} 
          subtitle="days logged" 
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <NutritionChart 
          title="Calorie Trend" 
          data={chartData} 
          dataKey="calories" 
          color="#f97316" 
          targetValue={2000} 
        />
        
        <NutritionChart 
          title="Protein Trend" 
          data={chartData} 
          dataKey="protein" 
          color="#3b82f6" 
          targetValue={150} 
        />

        <WaterChart data={chartData} targetValue={2500} />

        <div className="p-6 bg-card border rounded-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-4">Summary Report</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Average Daily Intake:</span>
                <span className="font-semibold">{Math.round(avgCalories)} kcal</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Average Daily Protein:</span>
                <span className="font-semibold">{Math.round(avgProtein)}g</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Hydration Average:</span>
                <span className="font-semibold">{(avgWater / 1000).toFixed(1)} L</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Logging Consistency:</span>
                <span className="font-semibold text-primary">{Math.round(consistency.percentage || 0)}%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
