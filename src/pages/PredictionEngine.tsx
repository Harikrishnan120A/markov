/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Zap, 
  Settings2, 
  Play, 
  History, 
  Info, 
  ArrowRight,
  TrendingUp,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { STATES, calculateDistribution, calculateSteadyState, type State } from '../lib/markov';

interface PredictionEngineProps {
  matrix: number[][];
  selectedStudent: any;
}

export default function PredictionEngine({ matrix, selectedStudent }: PredictionEngineProps) {
  const [draftSemesters, setDraftSemesters] = useState(4);
  const [draftInitialState, setDraftInitialState] = useState<State>(selectedStudent.state);

  const [chartMode, setChartMode] = useState<'area' | 'line'>('area');

  const [semesters, setSemesters] = useState(4);
  const [initialState, setInitialState] = useState<State>(selectedStudent.state);
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null);

  useEffect(() => {
    // When switching students, sync both draft + committed params
    setDraftInitialState(selectedStudent.state);
    setInitialState(selectedStudent.state);
  }, [selectedStudent]);

  const hasPendingChanges = draftSemesters !== semesters || draftInitialState !== initialState;

  const runAnalysis = () => {
    setSemesters(draftSemesters);
    setInitialState(draftInitialState);
    setLastRunAt(new Date());
  };

  const predictionData = useMemo(() => {
    const initialStateVector = STATES.map(s => s === initialState ? 1 : 0);
    const distributions = calculateDistribution(initialStateVector, matrix, semesters);
    
    return distributions.map((dist, i) => ({
      semester: `Sem ${i}`,
      Poor: dist[0] * 100,
      Average: dist[1] * 100,
      Good: dist[2] * 100,
      Excellent: dist[3] * 100,
      meanScore: dist[0] * 1 + dist[1] * 2 + dist[2] * 3 + dist[3] * 4
    }));
  }, [initialState, matrix, semesters]);

  const steadyState = useMemo(() => calculateSteadyState(matrix), [matrix]);

  const dominantState = useMemo(() => {
    const last = predictionData[predictionData.length - 1];
    const values = [last.Poor, last.Average, last.Good, last.Excellent];
    const maxIdx = values.indexOf(Math.max(...values));
    return STATES[maxIdx];
  }, [predictionData]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Markov Prediction Engine</h2>
          <p className="text-sm text-slate-500 font-medium">Stochastic forecasting of student academic trajectories.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={runAnalysis}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-colors",
              hasPendingChanges ? "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700" : "bg-slate-900 text-white shadow-slate-200"
            )}
            title={hasPendingChanges ? 'Apply inputs and run analysis' : 'Analysis is up to date'}
          >
            <Play size={14} />
            {hasPendingChanges ? 'Run Analysis' : 'Up to date'}
          </button>
          <button
            type="button"
            disabled
            title="History (coming soon)"
            className="p-2 text-slate-300 transition-colors cursor-not-allowed"
          >
            <History size={20} />
          </button>
          {lastRunAt && (
            <span className="hidden sm:block px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Ran {lastRunAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-display font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Settings2 size={24} className="text-indigo-600" />
              Engine Parameters
            </h3>
            
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Initial Performance State</label>
                <div className="grid grid-cols-2 gap-3">
                  {STATES.map((state) => (
                    <button
                      key={state}
                      onClick={() => setDraftInitialState(state)}
                      className={cn(
                        "px-4 py-3.5 rounded-2xl text-sm font-bold border transition-all",
                        draftInitialState === state 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" 
                          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50"
                      )}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Forecast Horizon</label>
                  <span className="text-sm font-bold text-indigo-600">{draftSemesters} Semesters</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  value={draftSemesters}
                  onChange={(e) => setDraftSemesters(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                  <span>1 SEM</span>
                  <span>8 SEMS</span>
                </div>
                {hasPendingChanges && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-xs text-amber-900/70 font-medium leading-relaxed">
                      You have changes that haven’t been applied yet. Click <strong>Run Analysis</strong> to update the charts.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <Info size={18} className="text-indigo-600 shrink-0" />
                  <p className="text-xs text-indigo-900/60 font-medium leading-relaxed">
                    Predictions are based on the current transition matrix. Modify the matrix in the <strong>Scenario Lab</strong> to test different environments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200">
            <h3 className="text-xl font-display font-bold mb-8 flex items-center gap-3">
              <Zap size={24} className="text-indigo-400" />
              Engine Insights
            </h3>
            <div className="space-y-8">
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Dominant Future State</p>
                <p className="text-3xl font-display font-bold text-indigo-400">{dominantState}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Convergence Probability</p>
                <p className="text-3xl font-display font-bold text-white">
                  {(Math.max(...steadyState) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-xs text-white/60 font-medium leading-relaxed italic">
                  “The model suggests a high likelihood of the student stabilizing in the{' '}
                  <span className="text-white font-bold">{dominantState}</span>
                  {' '}state within{' '}
                  <span className="text-white font-bold">{semesters}</span>
                  {' '}semesters.”
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Chart */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-1">State Probability Evolution</h3>
                <p className="text-sm text-slate-500 font-medium">Predicted probability distribution across performance states.</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setChartMode('area')}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    chartMode === 'area' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                  title="Area view"
                >
                  <AreaChartIcon size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('line')}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    chartMode === 'line' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                  title="Line view"
                >
                  <LineChartIcon size={18} />
                </button>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'area' ? (
                  <AreaChart data={predictionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPoor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExcellent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="semester" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="Poor" stroke="#f43f5e" fillOpacity={1} fill="url(#colorPoor)" strokeWidth={3} />
                    <Area type="monotone" dataKey="Average" stroke="#f59e0b" fill="transparent" strokeWidth={3} />
                    <Area type="monotone" dataKey="Good" stroke="#0d9488" fill="transparent" strokeWidth={3} />
                    <Area type="monotone" dataKey="Excellent" stroke="#4f46e5" fillOpacity={1} fill="url(#colorExcellent)" strokeWidth={3} />
                  </AreaChart>
                ) : (
                  <LineChart data={predictionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="semester" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="Poor" stroke="#f43f5e" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="Average" stroke="#f59e0b" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="Good" stroke="#0d9488" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="Excellent" stroke="#4f46e5" strokeWidth={3} dot={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
              <h4 className="text-xl font-display font-bold text-slate-900 mb-8 flex items-center gap-3">
                <TrendingUp size={20} className="text-emerald-500" />
                Performance Trend
              </h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="semester" hide />
                    <YAxis hide domain={[1, 4]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: number) => [val.toFixed(2), 'Mean Score']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="meanScore" 
                      stroke="#4f46e5" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: '#4f46e5', strokeWidth: 3, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-6 leading-relaxed">
                The mean performance score (1-4) indicates the overall academic health trajectory over time.
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
              <h4 className="text-xl font-display font-bold text-slate-900 mb-8 flex items-center gap-3">
                <Activity size={20} className="text-indigo-600" />
                Final Distribution
              </h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Poor', value: predictionData[predictionData.length-1].Poor, color: '#f43f5e' },
                    { name: 'Average', value: predictionData[predictionData.length-1].Average, color: '#f59e0b' },
                    { name: 'Good', value: predictionData[predictionData.length-1].Good, color: '#0d9488' },
                    { name: 'Excellent', value: predictionData[predictionData.length-1].Excellent, color: '#4f46e5' },
                  ]}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                      {[0, 1, 2, 3].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#f43f5e', '#f59e0b', '#0d9488', '#4f46e5'][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between mt-6">
                {STATES.map((s, i) => (
                  <div key={s} className="text-center">
                    <div className={cn("w-2 h-2 rounded-full mx-auto mb-2", ['bg-rose-500', 'bg-amber-500', 'bg-teal-500', 'bg-indigo-600'][i])} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{s.slice(0, 3)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
