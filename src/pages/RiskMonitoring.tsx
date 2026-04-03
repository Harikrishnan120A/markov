/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Filter, 
  ChevronRight, 
  TrendingUp,
  Activity,
  UserCircle,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { calculateRisk, type StudentData } from '../lib/student';

interface RiskMonitoringProps {
  onNavigate: (page: any) => void;
  onSelectStudent: (student: any) => void;
  matrix: number[][];
  students: StudentData[];
}

export default function RiskMonitoring({ onNavigate, onSelectStudent, matrix, students }: RiskMonitoringProps) {
  const [query, setQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const studentsWithRisk = students.map(s => ({
    ...s,
    risk: calculateRisk(s, s.state)
  })).sort((a, b) => {
    const riskOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    return riskOrder[a.risk.level] - riskOrder[b.risk.level];
  });

  const visibleStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return studentsWithRisk.filter((s) => {
      const matchesQuery =
        q.length === 0 ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);
      const matchesRisk = riskFilter === 'All' ? true : s.risk.level === riskFilter;
      return matchesQuery && matchesRisk;
    });
  }, [studentsWithRisk, query, riskFilter]);

  const highRiskCount = studentsWithRisk.filter(s => s.risk.level === 'High').length;
  const mediumRiskCount = studentsWithRisk.filter(s => s.risk.level === 'Medium').length;
  const totalCount = studentsWithRisk.length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Institutional Risk Monitoring</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time identification and tracking of at-risk academic profiles.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search at-risk students..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full md:w-64"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              setRiskFilter((prev) =>
                prev === 'All' ? 'High' : prev === 'High' ? 'Medium' : prev === 'Medium' ? 'Low' : 'All'
              )
            }
            className={cn(
              "p-3.5 bg-white border rounded-2xl hover:bg-slate-50 transition-colors",
              riskFilter === 'All' ? "border-slate-200 text-slate-600" : "border-indigo-200 text-indigo-700"
            )}
            title={riskFilter === 'All' ? 'Filter risk: All' : `Filter risk: ${riskFilter}`}
            aria-label="Cycle risk filter"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-10 shadow-sm shadow-rose-100">
          <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-rose-200">
            <ShieldAlert size={28} />
          </div>
          <p className="text-xs font-bold text-rose-900/40 uppercase tracking-widest mb-1">High Risk Cohort</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-display font-bold text-rose-950">{highRiskCount}</p>
            <span className="text-sm font-bold text-rose-600 mb-1.5">Students</span>
          </div>
          <div className="mt-6 flex items-center gap-2 text-rose-600 text-xs font-bold">
            <TrendingUp size={14} />
            {totalCount === 0 ? 'No cohort loaded' : `${Math.round((highRiskCount / Math.max(totalCount, 1)) * 100)}% of cohort`}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-10 shadow-sm shadow-amber-100">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-amber-200">
            <AlertTriangle size={28} />
          </div>
          <p className="text-xs font-bold text-amber-900/40 uppercase tracking-widest mb-1">Medium Risk Cohort</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-display font-bold text-amber-950">{mediumRiskCount}</p>
            <span className="text-sm font-bold text-amber-600 mb-1.5">Students</span>
          </div>
          <div className="mt-6 flex items-center gap-2 text-amber-600 text-xs font-bold">
            <Activity size={14} />
            {totalCount === 0 ? 'No cohort loaded' : `${Math.round((mediumRiskCount / Math.max(totalCount, 1)) * 100)}% of cohort`}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200">
          <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-200">
            <Users size={28} />
          </div>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Profiles monitored</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-display font-bold text-white">{totalCount}</p>
            <span className="text-sm font-bold text-indigo-400 mb-1.5">Students</span>
          </div>
          <div className="mt-6 text-white/60 text-xs font-bold">
            Derived live from your current student list.
          </div>
        </div>
      </div>

      {/* Risk Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-display font-bold text-slate-900">Active Risk Monitoring List</h3>
          <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {visibleStudents.length} of {studentsWithRisk.length} Profiles
          </span>
        </div>
        
        {studentsWithRisk.length === 0 ? (
          <div className="p-10">
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl">
              <p className="text-sm font-bold text-slate-900 mb-1">No students to monitor</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Add students in <strong>Student Profile</strong> to populate institutional risk monitoring.
              </p>
              <button
                onClick={() => onNavigate('profile')}
                className="mt-6 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                Add students
              </button>
            </div>
          </div>
        ) : visibleStudents.length === 0 ? (
          <div className="p-10">
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl">
              <p className="text-sm font-bold text-slate-900 mb-1">No matches</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Try a different search term, or clear the active filter.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Clear search
                </button>
                <button
                  type="button"
                  onClick={() => setRiskFilter('All')}
                  className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                >
                  Reset filter
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Profile</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Academic State</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Risk Classification</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Primary Trigger</th>
                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleStudents.map((student, idx) => (
                <motion.tr 
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-0.5">{student.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{student.id} • {student.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        student.state === 'Excellent' ? "bg-indigo-600" : student.state === 'Good' ? "bg-teal-500" : student.state === 'Average' ? "bg-amber-500" : "bg-rose-500"
                      )} />
                      <span className="text-sm font-bold text-slate-700">{student.state}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      student.risk.level === 'High' ? "bg-rose-50 text-rose-600 border-rose-100" : student.risk.level === 'Medium' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                      {student.risk.level}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-xs text-slate-500 font-medium max-w-[200px] truncate">{student.risk.reasons[0]}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          onSelectStudent(student);
                          onNavigate('profile');
                        }}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                        title="View Profile"
                      >
                        <UserCircle size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          onSelectStudent(student);
                          onNavigate('intervention');
                        }}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm"
                        title="Intervention Plan"
                      >
                        <TrendingUp size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
