/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Activity, 
  Info, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { motion } from 'motion/react';
import { STATES, type TransitionMatrix, calculateSteadyState } from '../lib/markov';

interface SteadyStateProps {
  matrix: TransitionMatrix;
}

const STATE_COLORS: Record<string, string> = {
  'Poor': '#f43f5e', // Rose 500
  'Average': '#f59e0b', // Amber 500
  'Good': '#0d9488', // Teal 600
  'Excellent': '#4f46e5' // Indigo 600
};

export default function SteadyState({ matrix }: SteadyStateProps) {
  const steadyState = useMemo(() => calculateSteadyState(matrix), [matrix]);

  const chartData = useMemo(() => {
    return STATES.map((state, idx) => ({
      name: state,
      probability: steadyState[idx],
      percent: (steadyState[idx] * 100).toFixed(1),
      color: STATE_COLORS[state]
    }));
  }, [steadyState]);

  const dominantStateIdx = steadyState.indexOf(Math.max(...steadyState));
  const dominantState = STATES[dominantStateIdx];

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-ink mb-4">Steady-State Analysis</h1>
        <p className="text-lg text-muted leading-relaxed">
          The steady-state distribution represents the long-term equilibrium where the probability 
          of being in each state remains constant, regardless of the initial starting state.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <h3 className="text-xl font-bold text-ink mb-8 flex items-center gap-2">
              <BarChart3 size={20} className="text-primary" />
              Equilibrium Distribution
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                    tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: number) => [`${(val * 100).toFixed(2)}%`, 'Probability']}
                  />
                  <Bar dataKey="probability" radius={[8, 8, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-indigo-50 border-indigo-100">
              <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">Dominant Outcome</h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                  <Zap size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-900">{dominantState}</p>
                  <p className="text-xs font-medium text-indigo-600">Most likely long-term state</p>
                </div>
              </div>
            </div>
            <div className="card bg-emerald-50 border-emerald-100">
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4">Convergence</h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-900">Stable</p>
                  <p className="text-xs font-medium text-emerald-600">System reaches equilibrium</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card bg-slate-900 text-white">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Info size={20} className="text-primary" />
              What this means?
            </h3>
            <div className="space-y-6">
              <p className="text-sm text-white/60 leading-relaxed">
                The steady state tells us that if the current academic environment (transition probabilities) 
                remains unchanged, the student population will eventually settle into this distribution.
              </p>
              <div className="space-y-4">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-bold">{item.name}</span>
                    </div>
                    <span className="text-sm font-mono text-white/80">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-amber-50 border-amber-100">
            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Strategic Insight
            </h3>
            <p className="text-sm text-amber-800/70 leading-relaxed">
              If the steady-state for 'Poor' is too high, it indicates a systemic issue in the academic 
              progression model. Administrators should aim to shift the steady-state towards 'Good' and 
              'Excellent' by improving transition probabilities from 'Average' to 'Good'.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
