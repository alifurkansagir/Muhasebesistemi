import { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartDataPoint } from "@/lib/types";
import { CHART_PERIODS } from "@/lib/constants";
import { getLastNMonths } from "@/lib/utils/date-utils";

// Mock data for chart demonstration
const generateChartData = (months: string[]): ChartDataPoint[] => {
  return months.map((month) => ({
    date: month,
    income: Math.floor(Math.random() * 15000) + 30000,
    expense: Math.floor(Math.random() * 10000) + 20000,
    netIncome: 0, // Will be calculated
  })).map(point => ({
    ...point,
    netIncome: point.income - point.expense
  }));
};

const FinancialChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  
  useEffect(() => {
    const months = getLastNMonths(selectedPeriod === "12months" ? 12 : 6);
    setChartData(generateChartData(months));
  }, [selectedPeriod]);

  return (
    <div className="bg-white shadow rounded-lg p-4 lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-lg">Finansal Özet</h2>
        <div className="flex items-center space-x-2">
          <Select defaultValue={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px] h-8 text-sm">
              <SelectValue placeholder="Dönem Seçin" />
            </SelectTrigger>
            <SelectContent>
              {CHART_PERIODS.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button className="text-neutral-400 hover:text-primary">
            <i className="fas fa-download"></i>
          </button>
        </div>
      </div>
      
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`₺${value}`, ""]}
              labelFormatter={(label) => `Tarih: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              name="Gelir"
              stroke="#107C10" 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              name="Gider"
              stroke="#D13438" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="netIncome" 
              name="Net Gelir"
              stroke="#0078D4" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-success mr-2"></div>
          <span className="text-sm">Gelir</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-danger mr-2"></div>
          <span className="text-sm">Gider</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
          <span className="text-sm">Net Gelir</span>
        </div>
      </div>
    </div>
  );
};

export default FinancialChart;
