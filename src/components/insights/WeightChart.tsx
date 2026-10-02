'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function WeightChart({ data }: any) {
  // calculate domain to make the line more pronounced
  const minWeight = Math.min(...data.map((d: any) => d.weight)) - 1;
  const maxWeight = Math.max(...data.map((d: any) => d.weight)) + 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weight Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[minWeight, maxWeight]} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
