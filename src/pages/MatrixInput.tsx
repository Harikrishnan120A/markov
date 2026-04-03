/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  LayoutGrid, 
  TrendingUp, 
  TrendingDown, 
  Zap 
} from 'lucide-react';
import { motion } from 'motion/react';
import { STATES, DEFAULT_MATRIX, type TransitionMatrix } from '../lib/markov';

interface MatrixInputProps {
  matrix: TransitionMatrix;
  setMatrix: (matrix: TransitionMatrix) => void;
}

const PRESETS = [
  {
    id: 'balanced',
    name: 'Balanced Progression',
    icon: LayoutGrid,
    desc: 'A stable academic environment with moderate improvement probabilities.',
    matrix: DEFAULT_MATRIX
  },
  {
    id: 'weak-improvement',
    name: 'Weak Student Improvement',
    icon: TrendingUp,
    desc: 'High probability for Poor and Average students to improve their state.',
    matrix: [
      [0.30, 0.40, 0.20, 0.10],
      [0.10, 0.30, 0.40, 0.20],
      [0.05, 0.10, 0.45, 0.40],
      [0.02, 0.03, 0.15, 0.80],
    ]
  },
  {
    id: 'high-achiever',
    name: 'High Achiever Stability',
    icon: Zap,
    desc: 'Excellent students are highly likely to remain in their current state.',
    matrix: [
      [0.60, 0.25, 0.10, 0.05],
      [0.20, 0.50, 0.20, 0.10],
      [0.10, 0.15, 0.50, 0.25],
      [0.01, 0.02, 0.07, 0.90],
    ]
  },
  {
    id: 'challenging',
    name: 'Challenging Environment',
    icon: TrendingDown,
    desc: 'Higher probability of state decline due to rigorous academic standards.',
    matrix: [
      [0.70, 0.20, 0.08, 0.02],
      [0.40, 0.40, 0.15, 0.05],
      [0.20, 0.30, 0.35, 0.15],
      [0.10, 0.20, 0.30, 0.40],
    ]
  }
];

export default function MatrixInput({ matrix, setMatrix }: MatrixInputProps) {
  const [localMatrix, setLocalMatrix] = useState<TransitionMatrix>(matrix);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLocalMatrix(matrix);
  }, [matrix]);

  const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const newMatrix = localMatrix.map((row, rIdx) => 
      row.map((val, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? numValue : val))
    );
    setLocalMatrix(newMatrix);
    setSuccess(false);
  };

  const validateMatrix = () => {
    const newErrors: string[] = [];
    localMatrix.forEach((row, idx) => {
      const sum = row.reduce((acc, val) => acc + val, 0);
      if (Math.abs(sum - 1.0) > 0.001) {
        newErrors.push(`Row ${STATES[idx]} must sum to 1.0 (current sum: ${sum.toFixed(2)})`);
      }
      row.forEach((val) => {
        if (val < 0 || val > 1) {
          newErrors.push(`Probabilities must be between 0 and 1.`);
        }
      });
    });
    setErrors([...new Set(newErrors)]);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (validateMatrix()) {
      setMatrix(localMatrix);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    setLocalMatrix(DEFAULT_MATRIX);
    setErrors([]);
    setSuccess(false);
  };

  const loadPreset = (presetMatrix: TransitionMatrix) => {
    setLocalMatrix(presetMatrix);
    setErrors([]);
    setSuccess(false);
  };

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-ink mb-4">Transition Matrix</h1>
        <p className="text-lg text-muted leading-relaxed">
          Define the probabilities of moving between academic states. Each row represents the current state, 
          and each column represents the state in the next semester.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                <Grid3X3 size={20} className="text-primary" />
                Matrix Editor
              </h3>
              <div className="flex gap-2">
                <button onClick={handleReset} className="btn-outline flex items-center gap-2 py-1.5 px-3 text-sm">
                  <RotateCcw size={16} />
                  Reset
                </button>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2 py-1.5 px-3 text-sm">
                  <Save size={16} />
                  Apply Changes
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left text-xs font-bold text-muted uppercase tracking-wider">From \ To</th>
                    {STATES.map(state => (
                      <th key={state} className="p-3 text-center text-xs font-bold text-muted uppercase tracking-wider">{state}</th>
                    ))}
                    <th className="p-3 text-right text-xs font-bold text-muted uppercase tracking-wider">Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {localMatrix.map((row, rIdx) => {
                    const rowSum = row.reduce((a, b) => a + b, 0);
                    const isInvalid = Math.abs(rowSum - 1.0) > 0.001;

                    return (
                      <tr key={rIdx} className="group hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-ink text-sm">{STATES[rIdx]}</td>
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={val}
                              onChange={(e) => handleInputChange(rIdx, cIdx, e.target.value)}
                              className="w-full p-2 text-center bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                          </td>
                        ))}
                        <td className="p-3 text-right">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${isInvalid ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {rowSum.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {errors.length > 0 && (
              <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-2">
                {errors.map((err, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-rose-600 font-medium">
                    <AlertCircle size={16} />
                    {err}
                  </div>
                ))}
              </div>
            )}

            {success && (
              <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <CheckCircle2 size={16} />
                Matrix updated successfully! All simulations will now use these probabilities.
              </div>
            )}
          </div>

          <div className="card bg-indigo-50 border-indigo-100">
            <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Validation Rules
            </h3>
            <ul className="space-y-2 text-sm text-indigo-800/70">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Each row must sum to exactly 1.0 (100%).
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Individual probabilities must be between 0.0 and 1.0.
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Rows represent the current state, columns represent the next state.
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-ink flex items-center gap-2">
            <LayoutGrid size={20} className="text-primary" />
            Presets
          </h3>
          <div className="space-y-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => loadPreset(preset.matrix)}
                className="w-full text-left card p-5 hover:border-primary transition-all group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors">
                    <preset.icon size={20} />
                  </div>
                  <h4 className="font-bold text-ink group-hover:text-primary transition-colors">{preset.name}</h4>
                </div>
                <p className="text-xs text-muted leading-relaxed">{preset.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
