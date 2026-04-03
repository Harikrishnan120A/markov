/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  RotateCcw,
  Wand2,
  Play,
  AlertCircle,
  CheckCircle2,
  Info,
  ClipboardPaste,
  Copy,
  Sparkles,
} from 'lucide-react';
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
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface InputOutputSystemProps {
  matrix: TransitionMatrix;
  onUpdateMatrix: (newMatrix: TransitionMatrix) => void;
}

type StartMode = 'single-state' | 'distribution';

type Toast = {
  type: 'success' | 'error' | 'info';
  message: string;
};

type MatrixPreset = {
  id: string;
  name: string;
  description: string;
  matrix: TransitionMatrix;
};

const MATRIX_PRESETS: MatrixPreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Balanced baseline environment.',
    matrix: DEFAULT_MATRIX,
  },
  {
    id: 'high-intervention',
    name: 'High Intervention',
    description: 'Strong support increases upward mobility.',
    matrix: [
      [0.2, 0.5, 0.2, 0.1],
      [0.05, 0.3, 0.5, 0.15],
      [0.0, 0.1, 0.5, 0.4],
      [0.0, 0.0, 0.1, 0.9],
    ],
  },
  {
    id: 'academic-crisis',
    name: 'Academic Crisis',
    description: 'Decline is more likely (stress/low engagement).',
    matrix: [
      [0.8, 0.15, 0.05, 0.0],
      [0.4, 0.4, 0.15, 0.05],
      [0.1, 0.4, 0.4, 0.1],
      [0.05, 0.15, 0.4, 0.4],
    ],
  },
  {
    id: 'high-achiever',
    name: 'High Achiever Stability',
    description: 'Excellent students remain excellent more often.',
    matrix: [
      [0.6, 0.25, 0.1, 0.05],
      [0.2, 0.5, 0.2, 0.1],
      [0.1, 0.15, 0.5, 0.25],
      [0.01, 0.02, 0.07, 0.9],
    ],
  },
];

const STATE_COLORS: Record<State, string> = {
  Poor: '#f43f5e',
  Average: '#f59e0b',
  Good: '#0d9488',
  Excellent: '#4f46e5',
};

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}

function getMatrixErrors(m: number[][]): string[] {
  const errs: string[] = [];

  if (!Array.isArray(m) || m.length !== STATES.length) {
    return [`Matrix must be ${STATES.length}x${STATES.length}.`];
  }

  for (let r = 0; r < m.length; r++) {
    const row = m[r];
    if (!Array.isArray(row) || row.length !== STATES.length) {
      errs.push(`Row ${r + 1} (${STATES[r]}) must have ${STATES.length} values.`);
      continue;
    }

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
  const n = STATES.length;
  const width = n;

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

function normalizeRow(row: number[]): number[] {
  const cleaned = (row ?? []).map((v) => {
    const num = Number.isFinite(v) ? v : 0;
    return Math.min(1, Math.max(0, num));
  });
  const sum = cleaned.reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    return new Array(STATES.length).fill(1 / STATES.length);
  }
  return cleaned.map((v) => v / sum);
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ignore
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function parseMatrixText(text: string): { matrix?: TransitionMatrix; error?: string } {
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length !== STATES.length) {
    return { error: `Expected ${STATES.length} lines (got ${rows.length}).` };
  }

  const matrix: number[][] = [];
  for (let r = 0; r < rows.length; r++) {
    const parts = rows[r].split(/[\s,]+/).filter(Boolean);
    if (parts.length !== STATES.length) {
      return { error: `Line ${r + 1} must have ${STATES.length} numbers.` };
    }
    const nums = parts.map((p) => Number.parseFloat(p));
    if (nums.some((x) => !Number.isFinite(x))) {
      return { error: `Line ${r + 1} contains an invalid number.` };
    }
    matrix.push(nums);
  }

  return { matrix: matrix as TransitionMatrix };
}

function normalizeVector(v: number[]): number[] {
  const cleaned = v.map((x) => {
    const num = Number.isFinite(x) ? x : 0;
    return Math.max(0, num);
  });
  const sum = cleaned.reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    return new Array(STATES.length).fill(1 / STATES.length);
  }
  return cleaned.map((x) => x / sum);
}

function getVectorError(v: number[]): string | null {
  if (v.length !== STATES.length) return `Distribution must have ${STATES.length} values.`;
  if (v.some((x) => !Number.isFinite(x))) return 'Distribution contains invalid numbers.';
  if (v.some((x) => x < 0 || x > 1)) return 'Each distribution value must be between 0 and 1.';
  const sum = v.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) > 0.001) return `Distribution must sum to 1.0 (Current: ${sum.toFixed(2)}).`;
  return null;
}

export default function InputOutputSystem({ matrix, onUpdateMatrix }: InputOutputSystemProps) {
  // Draft inputs
  const [draftMatrix, setDraftMatrix] = useState<TransitionMatrix>(matrix);
  const [startMode, setStartMode] = useState<StartMode>('single-state');
  const [draftStartState, setDraftStartState] = useState<State>('Average');
  const [draftStartDist, setDraftStartDist] = useState<number[]>([0, 1, 0, 0]);
  const [draftSemesters, setDraftSemesters] = useState(6);
  const [pasteText, setPasteText] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // Committed inputs (generate output)
  const [runMatrix, setRunMatrix] = useState<TransitionMatrix>(matrix);
  const [runStartMode, setRunStartMode] = useState<StartMode>('single-state');
  const [runStartState, setRunStartState] = useState<State>('Average');
  const [runStartDist, setRunStartDist] = useState<number[]>([0, 1, 0, 0]);
  const [runSemesters, setRunSemesters] = useState(6);
  const [ran, setRan] = useState(false);
  const [runAt, setRunAt] = useState<Date | null>(null);

  const matrixErrors = useMemo(() => getMatrixErrors(draftMatrix), [draftMatrix]);
  const distError = useMemo(() => (startMode === 'distribution' ? getVectorError(draftStartDist) : null), [draftStartDist, startMode]);

  const canRun = matrixErrors.length === 0 && !distError;

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const output = useMemo(() => {
    if (!ran) return null;

    const initialVector =
      runStartMode === 'single-state'
        ? STATES.map((s) => (s === runStartState ? 1 : 0))
        : runStartDist;

    const dists = calculateDistribution(initialVector, runMatrix, runSemesters);
    const series = dists.map((dist, i) => ({
      semester: `Sem ${i}`,
      Poor: dist[0] * 100,
      Average: dist[1] * 100,
      Good: dist[2] * 100,
      Excellent: dist[3] * 100,
    }));

    const steady = calculateSteadyState(runMatrix);
    const last = series[series.length - 1];

    return {
      series,
      last,
      steady,
    };
  }, [ran, runMatrix, runSemesters, runStartDist, runStartMode, runStartState]);

  const handleMatrixCell = (r: number, c: number, value: string) => {
    const parsed = value.trim() === '' ? 0 : Number.parseFloat(value);
    const numValue = Number.isFinite(parsed) ? parsed : 0;

    setDraftMatrix((prev) => prev.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? numValue : cell)) : row)) as TransitionMatrix);
  };

  const handleResetAll = () => {
    setDraftMatrix(DEFAULT_MATRIX);
    setStartMode('single-state');
    setDraftStartState('Average');
    setDraftStartDist([0, 1, 0, 0]);
    setDraftSemesters(6);
    setPasteText('');

    setRunMatrix(DEFAULT_MATRIX);
    setRunStartMode('single-state');
    setRunStartState('Average');
    setRunStartDist([0, 1, 0, 0]);
    setRunSemesters(6);
    setRan(false);

    onUpdateMatrix(DEFAULT_MATRIX);
  };

  const handleNormalizeMatrix = () => {
    setDraftMatrix((prev) => normalizeMatrix(prev));
  };

  const handlePasteMatrix = () => {
    const parsed = parseMatrixText(pasteText);
    if (parsed.error || !parsed.matrix) {
      setPasteError(parsed.error ?? 'Could not parse matrix.');
      setToast({ type: 'error', message: parsed.error ?? 'Could not parse matrix.' });
      return;
    }
    setDraftMatrix(parsed.matrix);
    setPasteError(null);
    setToast({ type: 'success', message: 'Matrix loaded from text.' });
  };

  const handleNormalizeDist = () => {
    setDraftStartDist((prev) => normalizeVector(prev));
  };

  const generateOutput = useCallback(() => {
    if (!canRun) {
      setToast({ type: 'info', message: 'Fix inputs (row sums / distribution) to generate output.' });
      return;
    }

    const normalizedDist = startMode === 'distribution' ? normalizeVector(draftStartDist) : draftStartDist;

    setRunMatrix(draftMatrix);
    setRunStartMode(startMode);
    setRunStartState(draftStartState);
    setRunStartDist(normalizedDist);
    setRunSemesters(draftSemesters);
    setRan(true);
    setRunAt(new Date());
  }, [canRun, draftMatrix, draftSemesters, draftStartDist, draftStartState, startMode]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generateOutput();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [generateOutput]);

  const applyMatrixToApp = () => {
    if (matrixErrors.length > 0) return;
    onUpdateMatrix(draftMatrix);
  };

  const finalBarData = output
    ? [
        { name: 'Poor', value: output.last.Poor, color: STATE_COLORS.Poor },
        { name: 'Average', value: output.last.Average, color: STATE_COLORS.Average },
        { name: 'Good', value: output.last.Good, color: STATE_COLORS.Good },
        { name: 'Excellent', value: output.last.Excellent, color: STATE_COLORS.Excellent },
      ]
    : [];

  const outputSummary = useMemo(() => {
    if (!output) return null;
    const finalValues = [output.last.Poor, output.last.Average, output.last.Good, output.last.Excellent];
    const finalMaxIdx = finalValues.indexOf(Math.max(...finalValues));
    const finalDominant = STATES[finalMaxIdx];

    const steadyMaxIdx = output.steady.indexOf(Math.max(...output.steady));
    const steadyDominant = STATES[steadyMaxIdx];

    const meanScore = (output.last.Poor * 1 + output.last.Average * 2 + output.last.Good * 3 + output.last.Excellent * 4) / 100;

    return {
      finalDominant,
      steadyDominant,
      convergence: Math.max(...output.steady),
      meanScore,
    };
  }, [output]);

  const matrixText = useMemo(() => {
    return draftMatrix.map((row) => row.map((v) => v.toFixed(2)).join(' ')).join('\n');
  }, [draftMatrix]);

  const copyMatrix = async () => {
    const ok = await copyToClipboard(matrixText);
    setToast(ok ? { type: 'success', message: 'Matrix copied to clipboard.' } : { type: 'error', message: 'Copy failed.' });
  };

  const copyOutputJson = async () => {
    if (!output) {
      setToast({ type: 'info', message: 'Generate output first.' });
      return;
    }
    const payload = {
      ranAt: runAt?.toISOString() ?? null,
      inputs: {
        semesters: runSemesters,
        startMode: runStartMode,
        startState: runStartState,
        startDistribution: runStartMode === 'distribution' ? runStartDist : undefined,
        matrix: runMatrix,
      },
      outputs: {
        series: output.series,
        final: output.last,
        steadyState: output.steady,
      },
    };
    const ok = await copyToClipboard(JSON.stringify(payload, null, 2));
    setToast(ok ? { type: 'success', message: 'Output JSON copied.' } : { type: 'error', message: 'Copy failed.' });
  };

  const applyPreset = (preset: MatrixPreset) => {
    setDraftMatrix(preset.matrix);
    setPasteError(null);
    setToast({ type: 'success', message: `Preset applied: ${preset.name}` });
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
            <Sparkles size={14} className="text-indigo-600" />
            Step-by-step simulator
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-2">Input → Output System</h2>
          <p className="text-sm text-slate-500 font-medium">
            Fill inputs on the left, then click <strong>Generate Output</strong> (Ctrl/⌘ + Enter).
          </p>

          {toast && (
            <div
              className={cn(
                'mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold',
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  : toast.type === 'error'
                    ? 'bg-rose-50 border-rose-100 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
              )}
              role="status"
              aria-live="polite"
            >
              {toast.type === 'success' ? <CheckCircle2 size={16} /> : toast.type === 'error' ? <AlertCircle size={16} /> : <Info size={16} />}
              {toast.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetAll}
              className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors"
              title="Reset everything"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={handleNormalizeMatrix}
              className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors"
              title="Normalize matrix rows"
            >
              <Wand2 size={20} />
            </button>
          </div>

          <button
            onClick={generateOutput}
            disabled={!canRun}
            className={cn(
              'w-full sm:w-auto justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all',
              canRun ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
            )}
          >
            <Play size={20} />
            Generate Output
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-[2.25rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold uppercase tracking-widest text-indigo-700 mb-4">
                  1 — Inputs
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 flex items-center gap-3">
                <ArrowRightLeft size={22} className="text-indigo-600" />
                Inputs
                </h3>
              </div>
              <button
                onClick={applyMatrixToApp}
                disabled={matrixErrors.length > 0}
                className={cn(
                  'px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all',
                  matrixErrors.length === 0
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                )}
                title="Apply this matrix to the rest of the app"
              >
                Apply to App
              </button>
            </div>

            {/* Presets + quick actions */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Presets</p>
                <span className="text-[10px] font-bold text-slate-400">•</span>
                <button
                  onClick={copyMatrix}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2"
                  title="Copy matrix to clipboard"
                >
                  <Copy size={14} />
                  Copy matrix
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {MATRIX_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className="px-4 py-2 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all"
                    title={p.description}
                  >
                    <span className="text-xs font-bold text-slate-800">{p.name}</span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{p.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Editor */}
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-2 sm:border-spacing-3">
                <thead>
                  <tr>
                    <th className="w-24" />
                    {STATES.map((state) => (
                      <th key={state} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2 text-center">
                        {state}
                      </th>
                    ))}
                    <th className="w-16" />
                  </tr>
                </thead>
                <tbody>
                  {draftMatrix.map((row, rIdx) => {
                    const sum = row.reduce((a, b) => a + b, 0);
                    const valid = Math.abs(sum - 1) < 0.001;
                    return (
                      <tr key={rIdx}>
                        <td className="text-xs sm:text-sm font-bold text-slate-900 pr-2">{STATES[rIdx]}</td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={cell}
                              onChange={(e) => handleMatrixCell(rIdx, cIdx, e.target.value)}
                              aria-label={`P(${STATES[rIdx]}→${STATES[cIdx]})`}
                              className="w-full px-2.5 sm:px-3 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 rounded-2xl text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                          </td>
                        ))}
                        <td className="pl-2">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-bold cursor-pointer select-none',
                              valid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            )}
                            title={valid ? 'Row is valid (sum=1). Click to normalize anyway.' : 'Row sum is invalid. Click to normalize this row.'}
                            onClick={() => {
                              setDraftMatrix((prev) => prev.map((r, idx) => (idx === rIdx ? normalizeRow(r) : r)) as TransitionMatrix);
                              setToast({ type: 'success', message: `Normalized row: ${STATES[rIdx]}` });
                            }}
                          >
                            Σ{sum.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {matrixErrors.length > 0 && (
              <div className="mt-6 p-5 bg-rose-50 border border-rose-100 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <AlertCircle size={18} />
                  Fix these before running
                </div>
                {matrixErrors.map((e, idx) => (
                  <p key={idx} className="text-xs text-rose-900/60 font-medium pl-6">
                    • {e}
                  </p>
                ))}
              </div>
            )}

            {/* Paste matrix */}
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paste Matrix (optional)</p>
                <button
                  onClick={handlePasteMatrix}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2"
                  title="Parse and load matrix from text"
                >
                  <ClipboardPaste size={14} />
                  Load
                </button>
              </div>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={'Example:\n0.5 0.3 0.15 0.05\n0.2 0.4 0.3 0.1\n0.1 0.2 0.45 0.25\n0.05 0.1 0.25 0.6'}
                className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />

              {pasteError && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2">
                  <AlertCircle size={16} className="text-rose-600 mt-0.5" />
                  <p className="text-xs text-rose-900/60 font-medium leading-relaxed">{pasteError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Start settings */}
          <div className="bg-white rounded-[2.25rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-slate-900">Start Conditions</h3>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1">
                <button
                  onClick={() => setStartMode('single-state')}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs font-bold border transition-all',
                    startMode === 'single-state'
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600'
                  )}
                >
                  Single state
                </button>
                <button
                  onClick={() => setStartMode('distribution')}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs font-bold border transition-all',
                    startMode === 'distribution'
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600'
                  )}
                >
                  Distribution
                </button>
              </div>
            </div>

            {startMode === 'single-state' ? (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Initial state</p>
                <div className="grid grid-cols-2 gap-3">
                  {STATES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setDraftStartState(s)}
                      className={cn(
                        'px-4 py-3.5 rounded-2xl text-sm font-bold border transition-all',
                        draftStartState === s
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initial distribution</p>
                  <button
                    onClick={handleNormalizeDist}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2"
                    title="Normalize distribution to sum to 1"
                  >
                    <Wand2 size={14} />
                    Normalize
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {STATES.map((s, idx) => (
                    <div key={s} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATE_COLORS[s] }} />
                          <span className="text-sm font-bold text-slate-700">{s}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">p</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={draftStartDist[idx]}
                        onChange={(e) => {
                          const parsed = e.target.value.trim() === '' ? 0 : Number.parseFloat(e.target.value);
                          const v = Number.isFinite(parsed) ? parsed : 0;
                          setDraftStartDist((prev) => prev.map((x, i) => (i === idx ? v : x)));
                        }}
                        className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>

                {distError && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5" />
                    <p className="text-xs text-amber-900/70 font-medium leading-relaxed">{distError}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Semesters</p>
                <span className="text-sm font-bold text-indigo-600">{draftSemesters}</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                value={draftSemesters}
                onChange={(e) => setDraftSemesters(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                <span>1</span>
                <span>12</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
              <Info size={18} className="text-indigo-600 mt-0.5" />
              <p className="text-xs text-indigo-900/70 font-medium leading-relaxed">
                Tip: if your matrix rows don’t sum to 1, click the <strong>wand</strong> button to normalize.
              </p>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[2.25rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm lg:sticky lg:top-28">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-4">
                  2 — Outputs
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900">Outputs</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyOutputJson}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2"
                  title="Copy outputs (and inputs) as JSON"
                >
                  <Copy size={14} />
                  Copy JSON
                </button>

              {output ? (
                <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Generated
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200">
                  Waiting for input
                </span>
              )}
              </div>
            </div>

            {output ? (
              <div className="space-y-10">
                {/* Summary */}
                {outputSummary && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-800">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Final dominant</p>
                      <p className="text-lg font-display font-bold" style={{ color: STATE_COLORS[outputSummary.finalDominant] }}>
                        {outputSummary.finalDominant}
                      </p>
                    </div>
                    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Steady dominant</p>
                      <p className="text-lg font-display font-bold" style={{ color: STATE_COLORS[outputSummary.steadyDominant] }}>
                        {outputSummary.steadyDominant}
                      </p>
                    </div>
                    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Convergence</p>
                      <p className="text-2xl font-display font-bold text-slate-900">{(outputSummary.convergence * 100).toFixed(1)}%</p>
                    </div>
                    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mean score</p>
                      <p className="text-2xl font-display font-bold text-slate-900">{outputSummary.meanScore.toFixed(2)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Scale 1–4</p>
                    </div>
                  </div>
                )}

                {runAt && (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Generated at {runAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Horizon: {runSemesters} semesters
                  </p>
                )}

                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Probability evolution</h4>
                  <p className="text-sm text-slate-500 font-medium mb-6">How state probabilities change each semester.</p>
                  <div className="h-[280px] sm:h-[360px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={output.series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Final distribution</h4>
                    <div className="h-[200px] sm:h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={finalBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 800, fill: '#64748b' }} />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(val: number) => [`${val.toFixed(1)}%`, 'Probability']}
                          />
                          <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={44}>
                            {finalBarData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-8">
                    <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">Steady state (long-run)</h4>
                    <div className="space-y-3">
                      {STATES.map((s, idx) => (
                        <div key={s} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATE_COLORS[s] }} />
                            <span className="text-sm font-bold">{s}</span>
                          </div>
                          <span className="text-sm font-mono font-bold">{(output.steady[idx] * 100).toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl">
                <div className="flex items-start gap-3">
                  <Info size={18} className="text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Enter inputs, then generate output</p>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Fill the matrix + start conditions on the left, then click <strong>Generate Output</strong>. Shortcut: <strong>Ctrl/⌘ + Enter</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
