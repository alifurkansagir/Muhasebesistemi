import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Define the colors for each status
const COLORS = ['#0078D4', '#D13438', '#FFB900'];

// Mock data for the pie chart
const chartData = [
  { name: 'Ödendi', value: 35, color: '#0078D4' },
  { name: 'Gecikti', value: 12, color: '#D13438' },
  { name: 'Bekliyor', value: 6, color: '#FFB900' },
];

const InvoiceStatusChart = () => {
  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Fatura Durumları</CardTitle>
        <Button variant="link" className="text-[#0078D4] p-0">
          <Link href="/invoices">Tümünü Gör</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="block text-2xl font-bold text-neutral-700">{total}</span>
              <span className="text-sm text-neutral-500">Toplam</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className={`p-2 bg-opacity-10 rounded`} style={{ backgroundColor: `${item.color}20` }}>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs">{item.name}</span>
              </div>
              <p className="text-lg font-semibold mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceStatusChart;
