/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Play, 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  LayoutGrid, 
  ChevronRight, 
  Info 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { motion } from 'motion/react';
import { STATES, type State, type TransitionMatrix, calculateDistribution } from '../lib/markov';

interface MultiStudentProps {
  matrix: TransitionMatrix;
}

const STATE_COLORS: Record<string, string> = {
  'Poor': '#f43f5e', // Rose 500
  'Average': '#f59e0b', // Amber 500
  'Good': '#0d9488', // Teal 600
  'Excellent': '#4f46e5' // Indigo 600
};

export default function MultiStudent({ matrix }: MultiStudentProps) {
  const [studentCount, setStudentCount] = useState(100);
  const [semesters, setSemesters] = useState(10);
  const [initialDist, setInitialDist] = useState<number[]>([0.25, 0.25, 0.25, 0.25]);
  const [distributions, setDistributions] = useState<number[][] | null>(null);

  const handleSimulate = () => {
    const results = calculateDistribution(initialDist, matrix, semesters);
    setDistributions(results);
  };

  const areaData = useMemo(() => {
    if (!distributions) return [];
    return distributions.map((dist, idx) => ({
      semester: idx === 0 ? 'Initial' : `Sem ${idx}`,
      Poor: dist[0] * studentCount,
      Average: dist[1] * studentCount,
      Good: dist[2] * studentCount,
      Excellent: dist[3] * studentCount
    }));
  }, [distributions, studentCount]);

  const finalPieData = useMemo(() => {
    if (!distributions) return [];
    const final = distributions[distributions.length - 1];
    return STATES.map((state, idx) => ({
      name: state,
      value: final[idx] * studentCount,
      color: STATE_COLORS[state]
    }));
  }, [distributions, studentCount]);

  const stats = useMemo(() => {
    if (!distributions) return null;
    const initial = distributions[0];
    const final = distributions[distributions.length - 1];
    
    const initialHigh = initial[2] + initial[3];
    const finalHigh = final[2] + final[3];
    const growth = ((finalHigh - initialHigh) / initialHigh) * 100;
    
    const mostCommonIdx = final.indexOf(Math.max(...final));
    const mostCommon = STATES[mostCommonIdx];

    return {
      growth: growth.toFixed(1),
      mostCommon,
      mostCommonColor: STATE_COLORS[mostCommon],
      excellentPercent: (final[3] * 100).toFixed(1),
      poorPercent: (final[0] * 100).toFixed(1)
    };
  }, [distributions]);

  const updateInitialDist = (idx: number, val: number) => {
    const newDist = [...initialDist];
    newDist[idx] = val;
    // Normalize others
    const sum = newDist.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      setInitialDist(newDist.map(v => v / sum));
    }
  };

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-ink mb-4">Multi-Student Analysis</h1>
        <p className="text-lg text-muted leading-relaxed">
          Analyze how a cohort of students evolves over time. This simulation tracks the distribution 
          of states across the entire group.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Cohort Config
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Cohort Size</label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={studentCount}
                  onChange={(e) => setStudentCount(parseInt(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Initial Distribution</label>
                <div className="space-y-3">
                  {STATES.map((state, idx) => (
                    <div key={state}>
                      <div className="flex justify-between text-[10px] font-bold text-muted uppercase mb-1">
                        <span>{state}</span>
                        <span>{(initialDist[idx] * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={initialDist[idx]}
                        onChange={(e) => updateInitialDist(idx, parseFloat(e.target.value))}
                        className="w-full accent-primary h-1.5"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Duration (Semesters)</label>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={semesters}
                  onChange={(e) => setSemesters(parseInt(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
                <div className="flex justify-between text-xs font-bold text-muted mt-1">
                  <span>2</span>
                  <span className="text-primary">{semesters} Semesters</span>
                  <span>50</span>
                </div>
              </div>

              <button 
                onClick={handleSimulate}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                <Play size={18} />
                Analyze Cohort
              </button>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-1 gap-4">
              <div className="card p-4 bg-indigo-50 border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">High Performers</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-indigo-900">{stats.growth}%</p>
                  <p className="text-xs font-medium text-indigo-600">Growth</p>
                </div>
              </div>
              <div className="card p-4 bg-emerald-50 border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Dominant Final State</p>
                <p className="text-xl font-bold" style={{ color: stats.mostCommonColor }}>{stats.mostCommon}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-8">
          {!distributions ? (
            <div className="card h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 border-dashed border-2 border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Cohort Simulation Ready</h3>
              <p className="text-muted max-w-xs mx-auto">Analyze how your student population shifts across states over time.</p>
            </div>
          ) : (
            <>
              <div className="card">
                <h3 className="text-xl font-bold text-ink mb-8 flex items-center gap-2">
                  <TrendingUp size={20} className="text-primary" />
                  Cohort Evolution
                </h3>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="semester" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 700, marginBottom: '4px' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" dataKey="Poor" stackId="1" stroke={STATE_COLORS.Poor} fill={STATE_COLORS.Poor} fillOpacity={0.6} />
                      <Area type="monotone" dataKey="Average" stackId="1" stroke={STATE_COLORS.Average} fill={STATE_COLORS.Average} fillOpacity={0.6} />
                      <Area type="monotone" dataKey="Good" stackId="1" stroke={STATE_COLORS.Good} fill={STATE_COLORS.Good} fillOpacity={0.6} />
                      <Area type="monotone" dataKey="Excellent" stackId="1" stroke={STATE_COLORS.Excellent} fill={STATE_COLORS.Excellent} fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card">
                  <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
                    <PieChartIcon size={20} className="text-primary" />
                    Final Distribution
                  </h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={finalPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          animationDuration={1000}
                        >
                          {finalPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card bg-slate-900 text-white p-6">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Info size={20} className="text-primary" />
                    Cohort Insights
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-primary shrink-0">
                        <ChevronRight size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Academic Health</p>
                        <p className="text-xs text-white/50 leading-relaxed">
                          After {semesters} semesters, {stats.excellentPercent}% of the cohort is in the 'Excellent' state.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-primary shrink-0">
                        <ChevronRight size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Risk Assessment</p>
                        <p className="text-xs text-white/50 leading-relaxed">
                          The 'Poor' state accounts for {stats.poorPercent}% of students in the long run.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-xs font-bold text-white/40 uppercase mb-2">Recommendation</p>
                      <p className="text-xs leading-relaxed text-white/80">
                        Focus interventions on students in the 'Average' state to maximize the transition probability to 'Good'.
                      </p>
                    </div>
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
