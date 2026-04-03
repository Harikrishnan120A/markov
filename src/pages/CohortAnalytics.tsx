/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  PieChart as PieChartIcon, 
  BarChart3, 
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
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
  BarChart,
  Bar
} from 'recharts';
import { calculateDistribution, STATES } from '../lib/markov';
import { type StudentData } from '../lib/student';

interface CohortAnalyticsProps {
  matrix: number[][];
  students: StudentData[];
}

const COLORS = ['#f43f5e', '#f59e0b', '#0d9488', '#4f46e5'];

export default function CohortAnalytics({ matrix, students }: CohortAnalyticsProps) {
  const totalStudents = students.length;
  const [chartMode, setChartMode] = useState<'area' | 'bar'>('area');

  const initialVector = useMemo(() => {
    if (totalStudents === 0) return null;
    const counts = students.reduce(
      (acc, s) => {
        const idx = STATES.indexOf(s.state);
        if (idx >= 0) acc[idx] += 1;
        return acc;
      },
      new Array(STATES.length).fill(0) as number[]
    );
    return counts.map((c) => c / totalStudents);
  }, [students, totalStudents]);

  const cohortData = useMemo(() => {
    if (!initialVector) return [];
    const distributions = calculateDistribution(initialVector, matrix, 8);
    
    return distributions.map((dist, i) => ({
      semester: `Sem ${i}`,
      Poor: dist[0] * 100,
      Average: dist[1] * 100,
      Good: dist[2] * 100,
      Excellent: dist[3] * 100,
      retention: (dist[1] + dist[2] + dist[3]) * 100
    }));
  }, [initialVector, matrix]);

  const finalDist = useMemo(() => {
    if (cohortData.length === 0) return null;
    const last = cohortData[cohortData.length - 1];
    return [
      { name: 'Poor', value: last.Poor, color: COLORS[0] },
      { name: 'Average', value: last.Average, color: COLORS[1] },
      { name: 'Good', value: last.Good, color: COLORS[2] },
      { name: 'Excellent', value: last.Excellent, color: COLORS[3] },
    ];
  }, [cohortData]);

  const kpis = useMemo(() => {
    if (cohortData.length === 0) return null;
    const first = cohortData[0];
    const last = cohortData[cohortData.length - 1];

    const retention = first.retention;
    const predictedExcellence = last.Excellent;
    const atRiskTrend = last.Poor - first.Poor; // percentage-point change
    const retentionDelta = last.retention - first.retention;

    return { retention, predictedExcellence, atRiskTrend, retentionDelta };
  }, [cohortData]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Batch & Cohort Analytics</h2>
          <p className="text-sm text-slate-500 font-medium">Aggregate institutional performance trends and long-term forecasts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Target size={18} />
            Based on current cohort
          </div>
        </div>
      </div>

      {totalStudents === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-900 mb-1">No cohort data loaded</p>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Add students to compute cohort analytics and long-term forecasts.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Batch Size</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold text-slate-900">{totalStudents}</p>
            <Users size={24} className="text-indigo-600" />
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Retention Rate</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold text-slate-900">{kpis ? `${kpis.retention.toFixed(0)}%` : '—'}</p>
            <ArrowUpRight size={24} className="text-emerald-500" />
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Predicted Excellence</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold text-slate-900">{kpis ? `${kpis.predictedExcellence.toFixed(0)}%` : '—'}</p>
            <Zap size={24} className="text-amber-500" />
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">At-Risk Trend</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-display font-bold text-slate-900">
              {kpis
                ? `${kpis.atRiskTrend > 0 ? '+' : kpis.atRiskTrend < 0 ? '−' : ''}${Math.abs(kpis.atRiskTrend).toFixed(1)}%`
                : '—'}
            </p>
            <ArrowDownRight size={24} className="text-rose-500" />
          </div>
        </div>
      </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Evolution Chart */}
            <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 mb-1">Cohort State Evolution</h3>
                  <p className="text-sm text-slate-500 font-medium">Long-term performance distribution over 8 semesters.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <button
                    type="button"
                    onClick={() => setChartMode('area')}
                    aria-pressed={chartMode === 'area'}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      chartMode === 'area' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                    title="Area view"
                  >
                    <Activity size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode('bar')}
                    aria-pressed={chartMode === 'bar'}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      chartMode === 'bar' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                    title="Bar view"
                  >
                    <BarChart3 size={18} />
                  </button>
                </div>
              </div>

              <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === 'area' ? (
                    <AreaChart data={cohortData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                      <Area type="monotone" dataKey="Poor" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={3} />
                      <Area type="monotone" dataKey="Average" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={3} />
                      <Area type="monotone" dataKey="Good" stackId="1" stroke="#0d9488" fill="#0d9488" fillOpacity={0.1} strokeWidth={3} />
                      <Area type="monotone" dataKey="Excellent" stackId="1" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} strokeWidth={3} />
                    </AreaChart>
                  ) : (
                    <BarChart data={cohortData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                      <Bar dataKey="Poor" stackId="1" fill="#f43f5e" fillOpacity={0.25} stroke="#f43f5e" strokeWidth={2} />
                      <Bar dataKey="Average" stackId="1" fill="#f59e0b" fillOpacity={0.25} stroke="#f59e0b" strokeWidth={2} />
                      <Bar dataKey="Good" stackId="1" fill="#0d9488" fillOpacity={0.25} stroke="#0d9488" strokeWidth={2} />
                      <Bar dataKey="Excellent" stackId="1" fill="#4f46e5" fillOpacity={0.25} stroke="#4f46e5" strokeWidth={2} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

        {/* Distribution & Insights */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-display font-bold text-slate-900 mb-8 flex items-center gap-3">
              <PieChartIcon size={24} className="text-indigo-600" />
              Final Distribution
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={finalDist ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {(finalDist ?? []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {(finalDist ?? []).map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</p>
                    <p className="text-sm font-bold text-slate-900">{item.value.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200">
            <h3 className="text-xl font-display font-bold mb-8 flex items-center gap-3">
              <TrendingUp size={24} className="text-indigo-400" />
              Cohort Forecast
            </h3>
            <div className="space-y-8">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Steady State Convergence</p>
                <p className="text-sm text-white/80 font-medium leading-relaxed">
                  The cohort is predicted to stabilize with{' '}
                  <strong>
                    {finalDist ? `${(finalDist[2].value + finalDist[3].value).toFixed(1)}%` : '—'}
                  </strong>
                  {' '}of students in Good or Excellent states.
                </p>
              </div>
              <div className="flex items-center gap-3 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <Info size={18} className="text-indigo-400 shrink-0" />
                <p className="text-xs text-white/60 font-medium leading-relaxed">
                  Forecasted retention change over the horizon: <strong>{kpis ? `${kpis.retentionDelta > 0 ? '+' : kpis.retentionDelta < 0 ? '−' : ''}${Math.abs(kpis.retentionDelta).toFixed(1)}%` : '—'}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
