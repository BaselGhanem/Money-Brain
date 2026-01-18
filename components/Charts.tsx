import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, 
  Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area 
} from 'recharts';
import { Transaction } from '../types';
import { CATEGORIES } from '../constants';

interface ChartProps {
  transactions: Transaction[];
  theme: 'dark' | 'light';
}

const COLORS = CATEGORIES.map(c => c.color);

export const CategoryChart: React.FC<ChartProps> = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const data = CATEGORIES.map(cat => {
    const total = expenses
      .filter(t => t.category === cat.id)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name: cat.label, value: total, color: cat.color };
  }).filter(d => d.value > 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1d24', borderRadius: '8px', border: '1px solid #333' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MoodChart: React.FC<ChartProps> = ({ transactions }) => {
  const data = [
    { name: 'Happy', value: transactions.filter(t => t.mood === 'happy' && t.type === 'expense').reduce((a,c) => a + c.amount, 0) },
    { name: 'Stressed', value: transactions.filter(t => t.mood === 'stressed' && t.type === 'expense').reduce((a,c) => a + c.amount, 0) },
    { name: 'Impulsive', value: transactions.filter(t => t.mood === 'impulsive' && t.type === 'expense').reduce((a,c) => a + c.amount, 0) },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={80} tick={{fill: '#888'}} axisLine={false} tickLine={false} />
          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1a1d24', borderRadius: '8px', border: '1px solid #333' }} />
          <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 1 ? '#ff0055' : index === 2 ? '#ffcc00' : '#00d2ff'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const NetWorthChart: React.FC<ChartProps> = ({ transactions }) => {
  // Mocking cumulative data for demonstration
  const data = transactions.slice(0, 7).map((t, i) => ({
    name: `Day ${i+1}`,
    amount: Math.random() * 5000 + 1000
  }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip contentStyle={{ backgroundColor: '#1a1d24', border: 'none' }} />
          <Area type="monotone" dataKey="amount" stroke="#00d2ff" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};