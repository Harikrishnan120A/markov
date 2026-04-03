/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  User, 
  Play, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  BarChart3, 
  Clock 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { motion } from 'motion/react';
import { STATES, type State, type TransitionMatrix, simulateStudentPath } from '../lib/markov';

interface SingleStudentProps {
  matrix: TransitionMatrix;
}

const STATE_VALUES: Record<State, number> = {
  'Poor': 1,
  'Average': 2,
  'Good': 3,
  'Excellent': 4
};

const STATE_COLORS: Record<State, string> = {
  'Poor': '#f43f5e', // Rose 500
  'Average': '#f59e0b', // Amber 500
  'Good': '#0d9488', // Teal 600
  'Excellent': '#4f46e5' // Indigo 600
};

export default function SingleStudent({ matrix }: SingleStudentProps) {
  const [initialState, setInitialState] = useState<State>('Average');
  const [semesters, setSemesters] = useState(8);
  const [simulation, setSimulation] = useState<State[] | null>(null);

  const handleSimulate = () => {
    const path = simulateStudentPath(initialState, matrix, semesters);
    setSimulation(path);
  };

  const chartData = useMemo(() => {
    if (!simulation) return [];
    return simulation.map((state, idx) => ({
      semester: idx === 0 ? 'Initial' : `Sem ${idx}`,
      value: STATE_VALUES[state],
      state: state
    }));
  }, [simulation]);

  const frequencyData = useMemo(() => {
    if (!simulation) return [];
    const counts = simulation.reduce((acc, state) => {
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return STATES.map(state => ({
      name: state,
      count: counts[state] || 0,
      color: STATE_COLORS[state]
    }));
  }, [simulation]);

  const finalState = simulation ? simulation[simulation.length - 1] : null;
  const initialStateVal = STATE_VALUES[initialState];
  const finalStateVal = finalState ? STATE_VALUES[finalState] : 0;
  const trend = finalStateVal > initialStateVal ? 'Improved' : finalStateVal < initialStateVal ? 'Declined' : 'Stable';

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-ink mb-4">Single Student Simulation</h1>
        <p className="text-lg text-muted leading-relaxed">
          Predict the academic progression of an individual student over multiple semesters based on current standing.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Parameters
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Initial State</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATES.map(state => (
                    <button
                      key={state}
                      onClick={() => setInitialState(state)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                        initialState === state 
                          ? 'bg-primary text-white border-primary shadow-sm' 
                          : 'bg-white text-ink border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Duration (Semesters)</label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={semesters}
                  onChange={(e) => setSemesters(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs font-bold text-muted mt-1">
                  <span>2</span>
                  <span className="text-primary">{semesters} Semesters</span>
                  <span>20</span>
                </div>
              </div>

              <button 
                onClick={handleSimulate}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                <Play size={18} />
                Run Simulation
              </button>
            </div>
          </div>

          {simulation && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card bg-slate-900 text-white"
            >
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Outcome Summary</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/40 font-medium">Final Predicted State</p>
                  <p className={`text-2xl font-bold`} style={{ color: STATE_COLORS[finalState!] }}>{finalState}</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    trend === 'Improved' ? 'bg-emerald-500/20 text-emerald-400' : 
                    trend === 'Declined' ? 'bg-rose-500/20 text-rose-400' : 
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {trend === 'Improved' ? <TrendingUp size={20} /> : 
                     trend === 'Declined' ? <TrendingDown size={20} /> : 
                     <Minus size={20} />}
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-medium">Academic Trend</p>
                    <p className="text-sm font-bold">{trend}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-8">
          {!simulation ? (
            <div className="card h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 border-dashed border-2 border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                <Play size={40} />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Ready to Simulate</h3>
              <p className="text-muted max-w-xs mx-auto">Configure the parameters on the left and click "Run Simulation" to see the results.</p>
            </div>
          ) : (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" />
                    Performance Progression
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-muted">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Academic State
                    </div>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="semester" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                        dy={10}
                      />
                      <YAxis 
                        domain={[1, 4]} 
                        ticks={[1, 2, 3, 4]} 
                        tickFormatter={(val) => STATES[val - 1]}
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 700, marginBottom: '4px' }}
                      />
                      <Line 
                        type="stepAfter" 
                        dataKey="value" 
                        stroke="#4f46e5" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card">
                  <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
                    <BarChart3 size={20} className="text-primary" />
                    State Distribution
                  </h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={frequencyData} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                        />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                          {frequencyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
                    <Clock size={20} className="text-primary" />
                    Timeline Path
                  </h3>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {simulation.map((state, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-muted shrink-0">
                          {idx === 0 ? 'Init' : idx}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-muted uppercase tracking-wider">{idx === 0 ? 'Starting State' : `Semester ${idx}`}</p>
                          <p className="text-sm font-bold text-ink">{state}</p>
                        </div>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATE_COLORS[state] }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
