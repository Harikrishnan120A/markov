/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  HeartPulse, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight, 
  Target, 
  Users, 
  BookOpen, 
  Calendar,
  Activity,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { STATES, type State } from '../lib/markov';
import { calculateRisk, recommendInterventions, type StudentData } from '../lib/student';

interface InterventionLabProps {
  selectedStudent: StudentData | null;
  matrix: number[][];
}

export default function InterventionLab({ selectedStudent, matrix }: InterventionLabProps) {
  const risk = useMemo(() => {
    if (!selectedStudent) return null;
    return calculateRisk(selectedStudent, selectedStudent.state);
  }, [selectedStudent]);

  const interventions = useMemo(() => {
    if (!selectedStudent || !risk) return [];
    return recommendInterventions(selectedStudent, risk);
  }, [selectedStudent, risk]);

  const gpaDelta = useMemo(() => {
    if (!selectedStudent) return 0;
    return selectedStudent.gpa - selectedStudent.previousGPA;
  }, [selectedStudent]);

  const markovProjection = useMemo(() => {
    if (!selectedStudent) return null;
    const idx = STATES.indexOf(selectedStudent.state as State);
    if (idx < 0) return null;
    const row = matrix[idx];
    if (!row || row.length !== STATES.length) return null;
    let bestIdx = 0;
    for (let i = 1; i < row.length; i++) {
      if (row[i] > row[bestIdx]) bestIdx = i;
    }
    const improveProb = row.slice(idx + 1).reduce((a, b) => a + b, 0);
    return {
      currentIndex: idx,
      currentState: STATES[idx],
      nextLikelyState: STATES[bestIdx],
      nextLikelyProb: row[bestIdx],
      improveProb,
    };
  }, [matrix, selectedStudent]);

  const formatSigned = (value: number, digits: number) => {
    const sign = value > 0 ? '+' : value < 0 ? '−' : '';
    return `${sign}${Math.abs(value).toFixed(digits)}`;
  };

  if (!selectedStudent) {
    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Intervention Intelligence Lab</h2>
          <p className="text-sm text-slate-500 font-medium">Data-driven academic support strategies for targeted student success.</p>
        </div>
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-900 mb-1">No student selected</p>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">Select a student from the directory to view interventions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Intervention Intelligence Lab</h2>
          <p className="text-sm text-slate-500 font-medium">Data-driven academic support strategies for targeted student success.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Uses current student + matrix
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Student Context Card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-3xl bg-indigo-900 flex items-center justify-center text-white text-2xl font-display font-bold shadow-xl shadow-indigo-200">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedStudent.id} • {selectedStudent.department}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Academic State</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-display font-bold text-slate-900">{selectedStudent.state}</p>
                  <div className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    selectedStudent.state === 'Excellent' ? "bg-indigo-600" : selectedStudent.state === 'Good' ? "bg-teal-500" : selectedStudent.state === 'Average' ? "bg-amber-500" : "bg-rose-500"
                  )} />
                </div>
              </div>

              <div className={cn(
                "p-6 rounded-3xl border",
                risk?.level === 'High' ? "bg-rose-50 border-rose-100" : risk?.level === 'Medium' ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
              )}>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest mb-2",
                  risk?.level === 'High' ? "text-rose-900/40" : risk?.level === 'Medium' ? "text-amber-900/40" : "text-emerald-900/40"
                )}>
                  Risk Classification
                </p>
                <p className={cn(
                  "text-2xl font-display font-bold",
                  risk?.level === 'High' ? "text-rose-950" : risk?.level === 'Medium' ? "text-amber-950" : "text-emerald-950"
                )}>
                  {risk?.level ?? '—'}
                </p>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertCircle size={16} className="text-indigo-600" />
                Primary Triggers
              </h4>
              <div className="space-y-3">
                {(risk?.reasons ?? []).map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-slate-500 font-medium leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-teal-200/20">
            <h3 className="text-xl font-display font-bold mb-8 flex items-center gap-3">
              <Target size={24} className="text-teal-400" />
              Success Metrics
            </h3>
            <div className="space-y-8">
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">GPA change (prev → current)</p>
                <p className="text-3xl font-display font-bold text-teal-400">{formatSigned(gpaDelta, 2)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Most likely next state (1 step)</p>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-white/60">{selectedStudent.state}</p>
                  <ArrowRight size={16} className="text-teal-400" />
                  <p className="text-2xl font-display font-bold text-white">
                    {markovProjection ? markovProjection.nextLikelyState : '—'}
                  </p>
                  {markovProjection && (
                    <span className="text-xs font-bold text-white/50">
                      ({Math.round(markovProjection.nextLikelyProb * 100)}%)
                    </span>
                  )}
                </div>
                {markovProjection && (
                  <p className="mt-3 text-xs text-white/50 font-medium">
                    Improvement probability: {Math.round(markovProjection.improveProb * 100)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Interventions */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-display font-bold text-slate-900 mb-10 flex items-center gap-3">
              <HeartPulse size={28} className="text-teal-600" />
              Tailored Intervention Plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {interventions.map((intervention, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <div className="h-full p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-teal-600 shadow-sm group-hover:scale-110 transition-transform">
                        {intervention.type === 'Academic' ? <BookOpen size={24} /> : intervention.type === 'Attendance' ? <Calendar size={24} /> : <Users size={24} />}
                      </div>
                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {intervention.type}
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-display font-bold text-slate-900 mb-3">{intervention.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-1">
                      {intervention.description}
                    </p>

                    <div className="pt-6 border-t border-slate-200/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Expected Impact</p>
                      <div className="flex items-center gap-2 text-teal-600 font-bold text-sm">
                        <Activity size={16} />
                        {intervention.impact}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Methodology Card */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-10">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
                <Lightbulb size={28} />
              </div>
              <div>
                <h4 className="text-xl font-display font-bold text-indigo-950 mb-3">AI Recommendation Logic</h4>
                <p className="text-sm text-indigo-900/60 font-medium leading-relaxed mb-6">
                  Our system uses a multi-factor classification engine that maps student risk triggers (attendance, internal marks, GPA trends) 
                  to validated academic support frameworks. These recommendations are designed to optimize the transition probabilities 
                  within the Markov model, shifting the student toward "Good" or "Excellent" states.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                    <CheckCircle2 size={14} className="text-indigo-600" />
                    Evidence-Based
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                    <CheckCircle2 size={14} className="text-indigo-600" />
                    Personalized
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                    <CheckCircle2 size={14} className="text-indigo-600" />
                    Actionable
                  </div>
                </div>
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
