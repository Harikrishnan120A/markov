/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Activity,
  Bell,
  ChevronRight,
  HeartPulse,
  FlaskConical
} from 'lucide-react';
import { motion } from 'motion/react';
import { calculateRisk, type StudentData } from '../lib/student';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface DashboardProps {
  onNavigate: (page: any) => void;
  students: StudentData[];
}
export default function Dashboard({ onNavigate, students }: DashboardProps) {
  const withRisk = students
    .map((s) => ({
      student: s,
      risk: calculateRisk(s, s.state),
    }))
    .sort((a, b) => {
      const riskOrder = { High: 0, Medium: 1, Low: 2 } as const;
      return riskOrder[a.risk.level] - riskOrder[b.risk.level];
    });

  const counts = withRisk.reduce(
    (acc, x) => {
      acc[x.risk.level] += 1;
      return acc;
    },
    { High: 0, Medium: 0, Low: 0 }
  );

  const total = students.length;

  const STATS = [
    { label: 'Total Students', value: total.toString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'High Risk', value: counts.High.toString(), icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Medium Risk', value: counts.Medium.toString(), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Low Risk', value: counts.Low.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const stateCounts = students.reduce(
    (acc, s) => {
      acc[s.state] = (acc[s.state] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const DISTRIBUTION_DATA = [
    { name: 'Poor', value: total ? (stateCounts.Poor ?? 0) / total * 100 : 0, color: '#f43f5e' },
    { name: 'Average', value: total ? (stateCounts.Average ?? 0) / total * 100 : 0, color: '#f59e0b' },
    { name: 'Good', value: total ? (stateCounts.Good ?? 0) / total * 100 : 0, color: '#0d9488' },
    { name: 'Excellent', value: total ? (stateCounts.Excellent ?? 0) / total * 100 : 0, color: '#4f46e5' },
  ];

  const RECENT_ALERTS = withRisk
    .filter((x) => x.risk.level !== 'Low')
    .slice(0, 3)
    .map((x) => ({
      id: x.student.id,
      name: x.student.name,
      risk: x.risk.level,
      reason: x.risk.reasons[0] ?? 'Risk trigger detected',
    }));

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-indigo-950 text-white p-10 lg:p-16 shadow-2xl shadow-indigo-200">
        <div className="relative z-10 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest mb-8 border border-white/10"
          >
            <Zap size={14} className="text-indigo-400" />
            Institutional Decision Support System
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-display font-bold leading-tight mb-6"
          >
            Markov-Based Academic <br />
            <span className="text-indigo-400">Monitoring & Intervention</span> System
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 mb-10 leading-relaxed max-w-2xl"
          >
            A professional intelligence platform leveraging stochastic processes to predict student performance, 
            identify risks, and recommend targeted academic interventions.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={() => onNavigate(students.length ? 'prediction' : 'profile')}
              className="px-8 py-4 bg-white text-indigo-950 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 group shadow-lg shadow-indigo-900/20"
            >
              Analyze Student
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('cohort')}
              className="px-8 py-4 bg-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/10"
            >
              Batch Insights
            </button>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[140px]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={28} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-display font-bold text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-1">Current State Distribution</h3>
              <p className="text-sm text-slate-500 font-medium">Academic performance breakdown for the current semester.</p>
            </div>
            <button 
              onClick={() => onNavigate('cohort')}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-indigo-900 transition-colors"
            >
              <Activity size={20} />
            </button>
          </div>
          
          {total === 0 ? (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl">
              <p className="text-sm font-bold text-slate-900 mb-1">No cohort data loaded</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">Add students to see the current state distribution.</p>
              <button
                onClick={() => onNavigate('profile')}
                className="mt-6 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                Add students
              </button>
            </div>
          ) : (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DISTRIBUTION_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fontWeight: 700, fill: '#64748b' }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}
                    formatter={(val: number) => [`${val.toFixed(1)}%`, 'Share']}
                  />
                  <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={60}>
                    {DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-display font-bold text-slate-900 mb-8 flex items-center gap-3">
            <Bell size={24} className="text-rose-500" />
            Critical Alerts
          </h3>
          <div className="space-y-6">
            {RECENT_ALERTS.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                <p className="text-sm font-bold text-slate-900 mb-1">No active alerts</p>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Alerts will appear here when students have Medium/High risk signals.
                </p>
              </div>
            ) : (
              RECENT_ALERTS.map((alert, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 group-hover:border-indigo-200 group-hover:bg-indigo-50/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-900 font-bold shrink-0 shadow-sm">
                    {alert.id.slice(1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{alert.name}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{alert.id}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-3 line-clamp-1">{alert.reason}</p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        alert.risk === 'High' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {alert.risk} Risk
                      </span>
                      <button 
                        onClick={() => onNavigate('risk')}
                        className="ml-auto text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
          <button 
            onClick={() => onNavigate('risk')}
            className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            All Risk Reports
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Feature Navigation */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          onClick={() => onNavigate('prediction')}
          className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-10 cursor-pointer hover:shadow-xl hover:shadow-indigo-100 transition-all group"
        >
          <div className="w-16 h-16 bg-indigo-900 rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <Zap size={32} />
          </div>
          <h4 className="text-2xl font-display font-bold text-indigo-950 mb-3">Prediction Engine</h4>
          <p className="text-sm text-indigo-900/60 font-medium leading-relaxed mb-8">
            Leverage Markov stochastic matrices to forecast future academic states with high precision.
          </p>
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
            Launch Engine
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('intervention')}
          className="bg-teal-50 border border-teal-100 rounded-[2.5rem] p-10 cursor-pointer hover:shadow-xl hover:shadow-teal-100 transition-all group"
        >
          <div className="w-16 h-16 bg-teal-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg shadow-teal-200 group-hover:scale-110 transition-transform">
            <HeartPulse size={32} />
          </div>
          <h4 className="text-2xl font-display font-bold text-teal-950 mb-3">Intervention Lab</h4>
          <p className="text-sm text-teal-900/60 font-medium leading-relaxed mb-8">
            Generate data-driven support strategies tailored to individual student risk profiles.
          </p>
          <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
            Open Lab
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('scenario')}
          className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-10 cursor-pointer hover:shadow-xl hover:shadow-amber-100 transition-all group"
        >
          <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
            <FlaskConical size={32} />
          </div>
          <h4 className="text-2xl font-display font-bold text-amber-950 mb-3">Scenario Lab</h4>
          <p className="text-sm text-amber-900/60 font-medium leading-relaxed mb-8">
            Simulate the impact of institutional policy changes on long-term student outcomes.
          </p>
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            Start Simulation
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
