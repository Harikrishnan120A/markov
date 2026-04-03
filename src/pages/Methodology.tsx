/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BookOpen, 
  Target, 
  Code2, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  FlaskConical, 
  Users,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Methodology({ onNavigate }: { onNavigate?: (page: any) => void }) {
  const sections = [
    {
      title: 'Academic Value',
      icon: BookOpen,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      content: 'This system provides an evidence-based framework for academic monitoring, shifting from reactive to proactive student support. By modeling performance as a stochastic process, institutions can anticipate risks before they manifest as failures.'
    },
    {
      title: 'Markov Process Modeling',
      icon: TrendingUp,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      content: 'The core engine utilizes discrete-time Markov chains to model state transitions. Each performance state (Poor, Average, Good, Excellent) is treated as a stochastic state with defined transition probabilities based on historical academic data.'
    },
    {
      title: 'Risk Classification',
      icon: ShieldCheck,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      content: 'Our multi-factor risk engine analyzes attendance, internal marks, and GPA trends. It categorizes students into High, Medium, or Low risk cohorts, triggering automated intervention recommendations.'
    },
    {
      title: 'Intervention Intelligence',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      content: 'The platform recommends targeted support strategies (e.g., remedial tutoring, peer mentoring) based on specific risk triggers. These interventions are designed to optimize the transition matrix and improve student outcomes.'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-8 border border-indigo-100"
        >
          <Target size={14} />
          Project Methodology & Scope
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-8 leading-tight"
        >
          The Science of <br />
          <span className="text-indigo-600">Academic Success</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-500 font-medium leading-relaxed"
        >
          A comprehensive overview of the theoretical foundations, system architecture, 
          and institutional objectives of the Markov-Based Monitoring System.
        </motion.p>
      </section>

      {/* Core Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110", section.bg, section.color)}>
              <section.icon size={32} />
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">{section.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Tech Stack */}
      <section className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white shadow-2xl shadow-indigo-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
              <Code2 size={32} className="text-indigo-400" />
              Technology Stack
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Frontend Architecture</p>
                <ul className="space-y-3 text-sm font-bold text-white/80">
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-indigo-400" /> React 19 (Vite)</li>
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-indigo-400" /> TypeScript</li>
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-indigo-400" /> Tailwind CSS</li>
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-indigo-400" /> Motion (Animations)</li>
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Data Visualization</p>
                <ul className="space-y-3 text-sm font-bold text-white/80">
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-indigo-400" /> Recharts</li>
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-indigo-400" /> D3.js (Mathematical Logic)</li>
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-indigo-400" /> Lucide React (Icons)</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/10">
            <h4 className="text-xl font-display font-bold mb-6">Future Enhancements</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold mb-1">LMS Integration</p>
                  <p className="text-xs text-white/40 font-medium leading-relaxed">Direct API connection to Learning Management Systems for real-time data ingestion.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                  <FlaskConical size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold mb-1">Deep Learning Models</p>
                  <p className="text-xs text-white/40 font-medium leading-relaxed">Hybrid models combining Markov chains with LSTM neural networks for non-linear prediction.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-10">
        <h3 className="text-3xl font-display font-bold text-slate-900 mb-8">Ready to explore the platform?</h3>
        <button
          type="button"
          onClick={() => onNavigate?.('dashboard')}
          className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3 mx-auto group"
        >
          Go to Dashboard
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </section>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
