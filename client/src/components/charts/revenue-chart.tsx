import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';

// Mock data
const monthlyData = [
  { name: 'Oca', income: 45000, expense: 32000 },
  { name: 'Şub', income: 41000, expense: 28000 },
  { name: 'Mar', income: 48000, expense: 36000 },
  { name: 'Nis', income: 52000, expense: 34000 },
  { name: 'May', income: 47000, expense: 33000 },
  { name: 'Haz', income: 55000, expense: 35000 },
];

const yearlyData = [
  { name: '2019', income: 420000, expense: 310000 },
  { name: '2020', income: 480000, expense: 350000 },
  { name: '2021', income: 520000, expense: 380000 },
  { name: '2022', income: 560000, expense: 400000 },
  { name: '2023', income: 615000, expense: 425000 },
];

const weeklyData = [
  { name: 'Paz', income: 8000, expense: 6000 },
  { name: 'Pzt', income: 12000, expense: 8500 },
  { name: 'Sal', income: 11000, expense: 7500 },
  { name: 'Çar', income: 10000, expense: 7000 },
  { name: 'Per', income: 13000, expense: 9000 },
  { name: 'Cum', income: 14000, expense: 9500 },
  { name: 'Cmt', income: 9000, expense: 6500 },
];

const RevenueChart = () => {
  const [period, setPeriod] = useState('monthly');
  
  const data = 
    period === 'yearly' ? yearlyData :
    period === 'weekly' ? weeklyData :
    monthlyData;
    
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `₺${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `₺${(value / 1000).toFixed(0)}K`;
    return `₺${value}`;
  };
  
  const formatTooltip = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Gelir ve Gider Analizi</CardTitle>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Haftalık</SelectItem>
            <SelectItem value="monthly">Aylık</SelectItem>
            <SelectItem value="yearly">Yıllık</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip 
                formatter={(value: number) => [formatTooltip(value), '']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem'
                }}
              />
              <Legend />
              <Bar dataKey="income" name="Gelir" fill="#0078D4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Gider" fill="#D13438" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
