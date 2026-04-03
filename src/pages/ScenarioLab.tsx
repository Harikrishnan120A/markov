/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Save, 
  RotateCcw, 
  Wand2,
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Activity,
  Info,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  STATES,
  DEFAULT_MATRIX,
  calculateDistribution,
  calculateSteadyState,
  type State,
  type TransitionMatrix,
} from '../lib/markov';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ScenarioLabProps {
  matrix: number[][];
  onUpdateMatrix: (newMatrix: number[][]) => void;
}

const STATE_COLORS: Record<State, string> = {
  Poor: '#f43f5e',
  Average: '#f59e0b',
  Good: '#0d9488',
  Excellent: '#4f46e5',
};

function getMatrixErrors(m: number[][]): string[] {
  const errs: string[] = [];

  if (!Array.isArray(m) || m.length === 0) {
    return ['Matrix is empty.'];
  }

  for (let r = 0; r < m.length; r++) {
    const row = m[r] ?? [];
    let sum = 0;
    for (let c = 0; c < row.length; c++) {
      const v = row[c];
      if (!Number.isFinite(v)) {
        errs.push(`Row ${r + 1} (${STATES[r]}) contains an invalid number.`);
        continue;
      }
      if (v < 0 || v > 1) {
        errs.push('Each probability must be between 0 and 1.');
      }
      sum += v;
    }
    if (Math.abs(sum - 1) > 0.001) {
      errs.push(`Row ${r + 1} (${STATES[r]}) must sum to 1.0 (Current: ${sum.toFixed(2)})`);
    }
  }

  return Array.from(new Set(errs));
}

function normalizeMatrix(m: number[][]): TransitionMatrix {
  const n = m.length;
  const width = m[0]?.length ?? 0;

  return m.map((row) => {
    const cleaned = (row ?? new Array(width).fill(0)).map((v) => {
      const num = Number.isFinite(v) ? v : 0;
      return Math.min(1, Math.max(0, num));
    });

    const sum = cleaned.reduce((acc, v) => acc + v, 0);
    if (sum <= 0) {
      return new Array(n).fill(1 / n);
    }
    return cleaned.map((v) => v / sum);
  });
}

const PRESETS = [
  { 
    name: 'Standard Environment', 
    description: 'Current institutional baseline performance.',
    matrix: DEFAULT_MATRIX,
    icon: Activity,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50'
  },
  { 
    name: 'High Intervention', 
    description: 'Aggressive academic support and monitoring.',
    matrix: [
      [0.2, 0.5, 0.2, 0.1],
      [0.05, 0.3, 0.5, 0.15],
      [0.0, 0.1, 0.5, 0.4],
      [0.0, 0.0, 0.1, 0.9]
    ],
    icon: Zap,
    color: 'text-teal-600',
    bg: 'bg-teal-50'
  },
  { 
    name: 'Academic Crisis', 
    description: 'Simulate high failure rates or low engagement.',
    matrix: [
      [0.8, 0.15, 0.05, 0.0],
      [0.4, 0.4, 0.15, 0.05],
      [0.1, 0.4, 0.4, 0.1],
      [0.05, 0.15, 0.4, 0.4]
    ],
    icon: AlertCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-50'
  },
];

export default function ScenarioLab({ matrix, onUpdateMatrix }: ScenarioLabProps) {
  const [localMatrix, setLocalMatrix] = useState<number[][]>(matrix);
  const [errors, setErrors] = useState<string[]>(getMatrixErrors(matrix));
  const [success, setSuccess] = useState(false);

  const [previewInitialState, setPreviewInitialState] = useState<State>('Average');
  const [previewSemesters, setPreviewSemesters] = useState(6);

  useEffect(() => {
    setLocalMatrix(matrix);
    setErrors(getMatrixErrors(matrix));
  }, [matrix]);

  const handleCellChange = (row: number, col: number, value: string) => {
    const parsed = value.trim() === '' ? 0 : parseFloat(value);
    const numValue = Number.isFinite(parsed) ? parsed : 0;
    const newMatrix = localMatrix.map((r, rIdx) => 
      rIdx === row ? r.map((c, cIdx) => cIdx === col ? numValue : c) : r
    );
    setLocalMatrix(newMatrix);
    setErrors(getMatrixErrors(newMatrix));
    setSuccess(false);
  };

  const validateMatrix = () => {
    const newErrors = getMatrixErrors(localMatrix);
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (validateMatrix()) {
      onUpdateMatrix(localMatrix);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    setLocalMatrix(DEFAULT_MATRIX);
    setErrors(getMatrixErrors(DEFAULT_MATRIX));
    setSuccess(false);
  };

  const applyPreset = (presetMatrix: number[][]) => {
    setLocalMatrix(presetMatrix);
    setErrors(getMatrixErrors(presetMatrix));
    setSuccess(false);
  };

  const handleNormalize = () => {
    const normalized = normalizeMatrix(localMatrix);
    setLocalMatrix(normalized);
    setErrors(getMatrixErrors(normalized));
    setSuccess(false);
  };

  const preview = useMemo(() => {
    if (errors.length > 0) {
      return null;
    }

    const initialVector = STATES.map((s) => (s === previewInitialState ? 1 : 0));
    const dists = calculateDistribution(initialVector, localMatrix, previewSemesters);

    const series = dists.map((dist, i) => ({
      semester: `Sem ${i}`,
      Poor: dist[0] * 100,
      Average: dist[1] * 100,
      Good: dist[2] * 100,
      Excellent: dist[3] * 100,
    }));

    const steady = calculateSteadyState(localMatrix);
    const last = series[series.length - 1];
    const values = [last.Poor, last.Average, last.Good, last.Excellent];
    const maxIdx = values.indexOf(Math.max(...values));

    return {
      series,
      steady,
      dominantState: STATES[maxIdx],
      final: [last.Poor, last.Average, last.Good, last.Excellent],
    };
  }, [errors.length, localMatrix, previewInitialState, previewSemesters]);

  const impact = useMemo(() => {
    if (errors.length > 0) {
      return null;
    }
    const base = calculateSteadyState(DEFAULT_MATRIX);
    const current = calculateSteadyState(localMatrix);
    const deltas = STATES.map((state, idx) => ({
      state,
      base: base[idx],
      current: current[idx],
      delta: current[idx] - base[idx],
    }));

    const biggestGain = deltas.reduce((best, x) => (x.delta > best.delta ? x : best), deltas[0]);
    const biggestDrop = deltas.reduce((best, x) => (x.delta < best.delta ? x : best), deltas[0]);
    const dominantIdx = current.indexOf(Math.max(...current));
    const dominantState = STATES[dominantIdx];

    return {
      biggestGain,
      biggestDrop,
      dominantState,
    };
  }, [errors.length, localMatrix]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Scenario Simulation Lab</h2>
          <p className="text-sm text-slate-500 font-medium">Model custom academic environments by modifying transition probabilities.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors"
            title="Reset to Default"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={handleNormalize}
            className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors"
            title="Normalize rows to sum to 1"
          >
            <Wand2 size={20} />
          </button>
          <button 
            onClick={handleSave}
            className={cn(
              "px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all",
              success ? "bg-emerald-600 text-white shadow-emerald-200" : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
            )}
          >
            {success ? <CheckCircle2 size={20} /> : <Save size={20} />}
            {success ? 'Scenario Saved' : 'Deploy Scenario'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Matrix Input */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-display font-bold text-slate-900">Transition Matrix (P)</h3>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Info size={14} className="text-indigo-600" />
                Rows must sum to 1.0
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-4">
                <thead>
                  <tr>
                    <th className="w-24"></th>
                    {STATES.map(state => (
                      <th key={state} className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-4">{state}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {localMatrix.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="text-sm font-bold text-slate-900 pr-4">{STATES[rIdx]}</td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>
                          <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            max="1"
                            value={cell}
                            onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                            className={cn(
                              "w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                              cell > 0.5 ? "text-indigo-600" : cell === 0 ? "text-slate-300" : "text-slate-900"
                            )}
                          />
                        </td>
                      ))}
                      <td className="pl-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-bold",
                          Math.abs(row.reduce((a, b) => a + b, 0) - 1) < 0.001 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          Σ{row.reduce((a, b) => a + b, 0).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AnimatePresence>
              {errors.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-10 p-6 bg-rose-50 border border-rose-100 rounded-3xl space-y-2"
                >
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-2">
                    <AlertCircle size={18} />
                    Validation Errors
                  </div>
                  {errors.map((err, idx) => (
                    <p key={idx} className="text-xs text-rose-900/60 font-medium pl-6">• {err}</p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input → Output Preview */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-1">Output Preview</h3>
                <p className="text-sm text-slate-500 font-medium">Tune the matrix above and immediately see the predicted results.</p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start</span>
                </div>
                {STATES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setPreviewInitialState(s)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-xs font-bold border transition-all',
                      previewInitialState === s
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {s}
                  </button>
                ))}

                <div className="h-8 w-px bg-slate-200 mx-1" />

                <div className="flex items-center gap-3 px-3 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horizon</span>
                  <span className="text-sm font-bold text-indigo-600">{previewSemesters}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={previewSemesters}
                  onChange={(e) => setPreviewSemesters(parseInt(e.target.value))}
                  className="w-28 h-2 bg-white rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  aria-label="Preview semesters"
                />
              </div>
            </div>

            {preview ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={preview.series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="semester"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
                          dy={12}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                          tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                          }}
                          formatter={(val: number, name: string) => [`${val.toFixed(1)}%`, name]}
                        />
                        <Area type="monotone" dataKey="Poor" stroke={STATE_COLORS.Poor} fill="transparent" strokeWidth={3} />
                        <Area type="monotone" dataKey="Average" stroke={STATE_COLORS.Average} fill="transparent" strokeWidth={3} />
                        <Area type="monotone" dataKey="Good" stroke={STATE_COLORS.Good} fill="transparent" strokeWidth={3} />
                        <Area type="monotone" dataKey="Excellent" stroke={STATE_COLORS.Excellent} fill="transparent" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Dominant Future State</p>
                    <p className="text-2xl font-display font-bold" style={{ color: STATE_COLORS[preview.dominantState] }}>
                      {preview.dominantState}
                    </p>
                    <p className="text-xs text-white/60 font-medium mt-4 leading-relaxed">
                      Based on the selected starting state and horizon.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Steady State (Long-run)</p>
                    <div className="space-y-3">
                      {STATES.map((s, idx) => (
                        <div key={s} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATE_COLORS[s] }} />
                            <span className="text-sm font-bold text-slate-700">{s}</span>
                          </div>
                          <span className="text-sm font-mono font-bold text-slate-900">{(preview.steady[idx] * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900 mb-1">Fix the matrix to preview outputs</p>
                    <p className="text-xs text-amber-900/60 font-medium leading-relaxed">
                      Ensure every row sums to 1.0 and all values are between 0 and 1. Tip: use the <strong>normalize</strong> wand button.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Explanation Section */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-10">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
                <FlaskConical size={28} />
              </div>
              <div>
                <h4 className="text-xl font-display font-bold text-indigo-950 mb-3">Understanding the Matrix</h4>
                <p className="text-sm text-indigo-900/60 font-medium leading-relaxed">
                  The transition matrix <strong>P</strong> defines the probability of a student moving from state <strong>i</strong> (row) to state <strong>j</strong> (column) in one semester. 
                  By adjusting these values, you can simulate the impact of institutional changes. For example, increasing the probability of moving from "Poor" to "Average" 
                  simulates the effect of a new remedial tutoring program.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Presets Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-display font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Zap size={24} className="text-amber-500" />
              Scenario Presets
            </h3>
            
            <div className="space-y-6">
              {PRESETS.map((preset, idx) => (
                <div 
                  key={idx}
                  onClick={() => applyPreset(preset.matrix)}
                  className="group cursor-pointer"
                >
                  <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform", preset.bg, preset.color)}>
                        <preset.icon size={24} />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{preset.name}</h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutional Model</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                      {preset.description}
                    </p>
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest">
                      Apply Preset
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200">
            <h3 className="text-xl font-display font-bold mb-8 flex items-center gap-3">
              <TrendingUp size={24} className="text-emerald-400" />
              Impact Analysis
            </h3>
            <div className="space-y-8">
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Steady-State Change vs Default</p>
                {impact ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white/60">Biggest gain</p>
                      <p className="text-sm font-bold text-white">
                        {impact.biggestGain.state}
                        <span className="text-emerald-400">{' '}+{(impact.biggestGain.delta * 100).toFixed(1)}%</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white/60">Biggest drop</p>
                      <p className="text-sm font-bold text-white">
                        {impact.biggestDrop.state}
                        <span className="text-rose-400">{' '}{(impact.biggestDrop.delta * 100).toFixed(1)}%</span>
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <p className="text-sm font-bold text-white/60">Dominant long-run state</p>
                      <p className="text-sm font-bold text-white">{impact.dominantState}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-white/60 text-sm font-bold">
                    <ArrowRight size={16} className="text-emerald-400" />
                    Adjust the matrix to see impact.
                  </div>
                )}
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-xs text-white/60 font-medium leading-relaxed italic">
                  {impact
                    ? `"Compared to the default environment, the steady-state shifts most toward ${impact.biggestGain.state}."`
                    : '"Preview is unavailable until the matrix is valid."'}
                </p>
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
