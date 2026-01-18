import React, { useState } from 'react';
import { Sliders, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../services/storage';

const Simulator = () => {
  const [loan, setLoan] = useState(0);
  const [cutback, setCutback] = useState(0);
  const [extraIncome, setExtraIncome] = useState(0);

  const baseIncome = 1500;
  const baseExpense = 1200;

  const simulatedExpense = baseExpense - (baseExpense * (cutback / 100)) + loan;
  const simulatedIncome = baseIncome + extraIncome;
  const monthlyNet = simulatedIncome - simulatedExpense;
  const sixMonthProj = monthlyNet * 6;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-8 rounded-3xl text-center border border-white/10">
        <h2 className="text-3xl font-bold mb-2">Future Simulator</h2>
        <p className="text-indigo-200">Test financial decisions before you make them.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-surface p-6 rounded-2xl border border-gray-800">
          <div>
            <label className="flex justify-between mb-2 text-sm font-medium text-gray-400">
              <span>New Monthly Loan Payment</span>
              <span className="text-white">{loan} JOD</span>
            </label>
            <input 
              type="range" min="0" max="1000" step="50" 
              value={loan} onChange={(e) => setLoan(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="flex justify-between mb-2 text-sm font-medium text-gray-400">
              <span>Expense Cutback (Save %)</span>
              <span className="text-success">{cutback}%</span>
            </label>
            <input 
              type="range" min="0" max="50" step="5" 
              value={cutback} onChange={(e) => setCutback(Number(e.target.value))}
              className="w-full accent-success h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="flex justify-between mb-2 text-sm font-medium text-gray-400">
              <span>Extra Side Income</span>
              <span className="text-primary">{extraIncome} JOD</span>
            </label>
            <input 
              type="range" min="0" max="2000" step="100" 
              value={extraIncome} onChange={(e) => setExtraIncome(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-elevated border border-gray-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
            <span className="text-gray-400 uppercase text-xs tracking-widest mb-2">Projected 6-Month Savings</span>
            <div className={`text-4xl font-bold mb-2 ${sixMonthProj >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(sixMonthProj, 'JOD', false)}
            </div>
            {sixMonthProj < 0 && (
              <div className="flex items-center gap-2 text-danger text-sm bg-danger/10 px-3 py-1 rounded-full">
                <AlertTriangle size={14} />
                <span>Warning: Debt Trajectory</span>
              </div>
            )}
            {sixMonthProj > 5000 && (
              <div className="flex items-center gap-2 text-success text-sm bg-success/10 px-3 py-1 rounded-full">
                <TrendingUp size={14} />
                <span>Wealth Building Trajectory</span>
              </div>
            )}
          </div>

          <div className="bg-surface border border-gray-800 p-4 rounded-xl">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Sliders size={16} className="text-accent" />
              <span>AI Analysis</span>
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              {sixMonthProj > 0 
                ? "This scenario is sustainable. Increasing your cutback percentage by another 5% would accelerate your goal achievement by 2 months."
                : "This scenario leads to financial instability. Prioritize reducing the new loan amount or finding additional income sources."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;