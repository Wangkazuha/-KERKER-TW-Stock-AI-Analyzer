
import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface RevenueData {
  date: string;
  revenue: number;
  mom: string;
  yoy: string;
}

interface MarginData {
  quarter: string;
  operatingMargin: number;
  netProfitMargin: number;
}

interface RevenueCardProps {
  revenueHistory?: RevenueData[];
  marginHistory?: MarginData[];
}

const CustomTooltipRevenue = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-xs z-50">
        <p className="font-bold text-gray-700 mb-1">{data.date}</p>
        <p className="text-indigo-600 font-semibold">營收: {data.revenue}億</p>
        <p className="text-gray-500 mt-1">月增率: <span className={data.mom.includes('-') ? 'text-green-600' : 'text-red-500'}>{data.mom}</span></p>
        <p className="text-gray-500">年增率: <span className={data.yoy.includes('-') ? 'text-green-600' : 'text-red-500'}>{data.yoy}</span></p>
      </div>
    );
  }
  return null;
};

const CustomTooltipMargin = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-xs z-50">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        {payload.map((p: any, index: number) => (
          <p key={index} style={{ color: p.color }}>
            {p.name === 'Operating Margin' ? '營業利益率' : '淨利率'}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueCard: React.FC<RevenueCardProps> = ({ 
  revenueHistory = [], 
  marginHistory = [] 
}) => {

  // Sort Revenue: Oldest to Newest (Left to Right)
  const sortedRevenue = useMemo(() => {
    return [...revenueHistory].sort((a, b) => {
      // Try to parse date for accurate sorting (YYYY/MM or YYYY-MM)
      const dateA = new Date(a.date.replace('/', '-')); 
      const dateB = new Date(b.date.replace('/', '-'));
      
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA.getTime() - dateB.getTime();
      }
      // Fallback to string comparison
      return a.date.localeCompare(b.date);
    });
  }, [revenueHistory]);

  // Sort Margins: Oldest to Newest (Left to Right)
  const sortedMargins = useMemo(() => {
    return [...marginHistory].sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [marginHistory]);

  // Calculate Trend (Comparison between the Oldest and Newest month displayed)
  let trendIndicator = null;
  if (sortedRevenue.length >= 2) {
    const startRevenue = sortedRevenue[0].revenue; // Oldest (Left)
    const endRevenue = sortedRevenue[sortedRevenue.length - 1].revenue; // Newest (Right)
    
    if (startRevenue !== 0) {
      const growthPercent = ((endRevenue - startRevenue) / startRevenue) * 100;
      const isPositive = growthPercent >= 0;
      
      // TWSE Color Logic: Red is Up/Positive, Green is Down/Negative
      const TrendIcon = isPositive ? TrendingUp : TrendingDown;
      const colorClass = isPositive ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100';

      trendIndicator = (
        <div className={`flex items-center gap-1 ml-3 px-2 py-0.5 rounded-full border text-xs font-medium ${colorClass}`}>
           <TrendIcon className="w-3 h-3" />
           <span>{isPositive ? '+' : ''}{growthPercent.toFixed(1)}%</span>
        </div>
      );
    }
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
           <DollarSign className="w-5 h-5 text-indigo-600" />
           財務表現 (MOPS/TWSE)
         </h3>
         <span className="text-xs text-gray-400 px-2 py-1 bg-gray-50 rounded">經會計師查核/自結數</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Monthly Revenue (Bar Chart) - Oldest to Newest */}
        <div className="h-[280px]">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
                <h4 className="text-sm font-semibold text-gray-700">月營收 (近12個月)</h4>
                {trendIndicator}
            </div>
            <span className="text-xs text-gray-400">單位: 新台幣十億</span>
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={sortedRevenue} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: '#9ca3af' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#9ca3af' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip content={<CustomTooltipRevenue />} cursor={{fill: 'transparent'}} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                 {sortedRevenue.map((entry, index) => (
                    // Highlight the latest month (which is now the last item)
                    <Cell key={`cell-${index}`} fill={index === sortedRevenue.length - 1 ? '#4f46e5' : '#cbd5e1'} />
                 ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Profit Margins (Line Chart) - Oldest to Newest */}
        <div className="h-[280px]">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-gray-700">獲利能力 (近8季)</h4>
            <span className="text-xs text-gray-400">單位: %</span>
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={sortedMargins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="quarter" 
                tick={{ fontSize: 10, fill: '#9ca3af' }} 
                axisLine={false} 
                tickLine={false} 
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#9ca3af' }} 
                axisLine={false} 
                tickLine={false} 
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltipMargin />} />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(value) => value === 'Operating Margin' ? '營業利益率' : '淨利率'}
              />
              
              <Line 
                type="monotone" 
                name="Operating Margin" 
                dataKey="operatingMargin" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                name="Net Profit Margin" 
                dataKey="netProfitMargin" 
                stroke="#a855f7" 
                strokeWidth={2} 
                dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default RevenueCard;
