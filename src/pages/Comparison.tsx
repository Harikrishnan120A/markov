/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronRight, 
  Info, 
  Zap, 
  ArrowRight 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { motion } from 'motion/react';
import { STATES, type TransitionMatrix, calculateDistribution } from '../lib/markov';

interface ComparisonProps {
  matrix: TransitionMatrix;
}

const STATE_COLORS: Record<string, string> = {
  'Poor': '#f43f5e', // Rose 500
  'Average': '#f59e0b', // Amber 500
  'Good': '#0d9488', // Teal 600
  'Excellent': '#4f46e5' // Indigo 600
};

export default function Comparison({ matrix }: ComparisonProps) {
  const semesters = 15;

  const comparisonData = useMemo(() => {
    const results = STATES.map((state, idx) => {
      const initialDist = [0, 0, 0, 0];
      initialDist[idx] = 1.0;
      const distributions = calculateDistribution(initialDist, matrix, semesters);
      
      // Calculate "Academic Score" (1-4) for each step
      return distributions.map((dist, step) => {
        const score = dist.reduce((acc, prob, i) => acc + prob * (i + 1), 0);
        return { step, score, state };
      });
    });

    // Pivot data for Recharts
    const pivoted = Array.from({ length: semesters + 1 }, (_, step) => {
      const row: any = { step: step === 0 ? 'Init' : `Sem ${step}` };
      results.forEach((res) => {
        row[res[0].state] = res[step].score;
      });
      return row;
    });

    return pivoted;
  }, [matrix]);

  const finalOutcomes = useMemo(() => {
    return STATES.map((state, idx) => {
      const initialDist = [0, 0, 0, 0];
      initialDist[idx] = 1.0;
      const distributions = calculateDistribution(initialDist, matrix, semesters);
      const final = distributions[distributions.length - 1];
      const dominantIdx = final.indexOf(Math.max(...final));
      const dominant = STATES[dominantIdx];

      return {
        start: state,
        end: dominant,
        endProb: (final[dominantIdx] * 100).toFixed(1),
        score: final.reduce((acc, prob, i) => acc + prob * (i + 1), 0).toFixed(2),
        color: STATE_COLORS[state],
        endColor: STATE_COLORS[dominant]
      };
    });
  }, [matrix]);

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-ink mb-4">Comparative Insights</h1>
        <p className="text-lg text-muted leading-relaxed">
          Compare how different starting states evolve over time. This analysis reveals the impact of 
          initial performance on long-term academic outcomes.
        </p>
      </header>

      <div className="card">
        <h3 className="text-xl font-bold text-ink mb-8 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          Mean Performance Score Over Time
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="step" 
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
                formatter={(val: number) => [val.toFixed(2), 'Mean Score']}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {STATES.map(state => (
                <Line 
                  key={state}
                  type="monotone" 
                  dataKey={state} 
                  stroke={STATE_COLORS[state]} 
                  strokeWidth={3} 
                  dot={false}
                  animationDuration={1500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {finalOutcomes.map((outcome, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card flex flex-col items-center text-center p-6"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white mb-4 shadow-lg" style={{ backgroundColor: outcome.color }}>
              <span className="text-xs font-bold uppercase tracking-tighter">{outcome.start[0]}</span>
            </div>
            <h4 className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Starting from</h4>
            <p className="text-xl font-bold text-ink mb-4">{outcome.start}</p>
            
            <div className="w-full h-px bg-slate-100 mb-4" />
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-muted">Converges to</span>
              <ArrowRight size={12} className="text-slate-300" />
              <span className="text-sm font-bold" style={{ color: outcome.endColor }}>{outcome.end}</span>
            </div>
            <p className="text-xs font-medium text-muted mb-4">Probability: {outcome.endProb}%</p>
            
            <div className="mt-auto pt-4 border-t border-slate-50 w-full">
              <p className="text-[10px] font-bold text-muted uppercase mb-1">Final Mean Score</p>
              <p className="text-lg font-bold text-ink">{outcome.score}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card bg-slate-900 text-white p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap size={20} className="text-primary" />
            Key Comparative Findings
          </h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-primary shrink-0 font-bold">1</div>
              <p className="text-sm text-white/70 leading-relaxed">
                Students starting in the <span className="text-white font-bold">'Excellent'</span> state show the highest stability, 
                maintaining a mean score above 3.5 across all semesters.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-primary shrink-0 font-bold">2</div>
              <p className="text-sm text-white/70 leading-relaxed">
                The <span className="text-white font-bold">'Poor'</span> starting state exhibits the most significant initial 
                improvement but takes the longest to reach the system's equilibrium.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-primary shrink-0 font-bold">3</div>
              <p className="text-sm text-white/70 leading-relaxed">
                Regardless of the starting state, all paths eventually converge towards the steady-state mean score, 
                demonstrating the system's ergodicity.
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-teal-50 border-teal-100 p-8">
          <h3 className="text-xl font-bold text-teal-900 mb-6 flex items-center gap-2">
            <Info size={20} className="text-teal-600" />
            Academic Conclusion
          </h3>
          <p className="text-teal-800/70 leading-relaxed mb-6">
            This comparison highlights that while initial performance is a strong short-term predictor, 
            the long-term academic health of a student is governed by the institutional transition 
            probabilities. 
          </p>
          <div className="p-4 bg-white rounded-xl border border-teal-100 shadow-sm">
            <p className="text-xs font-bold text-teal-600 uppercase mb-2">Final Insight</p>
            <p className="text-sm font-medium text-teal-900 leading-relaxed">
              Interventions should focus on creating a "upward-biased" transition matrix to ensure that 
              the equilibrium point for all students is shifted towards higher academic states.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
