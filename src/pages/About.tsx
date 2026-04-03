/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Info, 
  Layers, 
  Zap, 
  Activity, 
  BarChart3, 
  ChevronRight, 
  Github, 
  Mail, 
  BookOpen 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  // Optional: set these to enable the footer links.
  // Example: const GITHUB_URL = 'https://github.com/<user>/<repo>';
  // Example: const CONTACT_EMAIL = 'you@example.com';
  const GITHUB_URL = '';
  const CONTACT_EMAIL = '';

  const tools = [
    { name: 'React', desc: 'Frontend Framework', icon: Zap, color: 'text-blue-500' },
    { name: 'Tailwind CSS', desc: 'Styling Engine', icon: Layers, color: 'text-teal-500' },
    { name: 'Recharts', desc: 'Data Visualization', icon: BarChart3, color: 'text-indigo-500' },
    { name: 'Motion', desc: 'Animation Library', icon: Activity, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-12">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-ink mb-4">About the Project</h1>
        <p className="text-lg text-muted leading-relaxed">
          Student Performance Prediction using Markov Process is an academic software project 
          designed to model and simulate student academic evolution using stochastic processes.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-ink">Project Objectives</h2>
          <div className="space-y-4">
            {[
              { title: "Predictive Modeling", desc: "Forecast individual student performance over multiple semesters." },
              { title: "Cohort Analysis", desc: "Analyze the long-term distribution of states across a student population." },
              { title: "Steady-State Calculation", desc: "Identify the long-term equilibrium point of the academic system." },
              { title: "Educational Simulation", desc: "Provide an interactive tool for faculty to understand student transitions." }
            ].map((obj, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <ChevronRight size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-ink text-sm">{obj.title}</h4>
                  <p className="text-xs text-muted leading-relaxed">{obj.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-indigo-50 border-indigo-100 p-8">
          <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            Academic Value
          </h3>
          <p className="text-indigo-800/70 leading-relaxed mb-6">
            This project demonstrates the practical application of stochastic processes in educational 
            data mining. By quantifying academic performance as a series of states with transition 
            probabilities, institutions can move from reactive to proactive student support.
          </p>
          <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
            <p className="text-xs font-bold text-indigo-600 uppercase mb-2">Future Enhancements</p>
            <ul className="space-y-2 text-xs text-indigo-900/70">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-400" />
                Integration with real-time LMS data.
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-400" />
                Machine learning for automated matrix generation.
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-400" />
                Multi-factor Markov models (including socio-economic data).
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-bold text-ink mb-8">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {tools.map((tool, idx) => (
            <div key={idx} className="card flex flex-col items-center text-center p-6">
              <div className={`w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center ${tool.color} mb-4 shadow-sm`}>
                <tool.icon size={24} />
              </div>
              <h4 className="font-bold text-ink text-sm mb-1">{tool.name}</h4>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="card bg-slate-900 text-white p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/20">
          <Activity size={32} />
        </div>
        <h3 className="text-2xl font-display font-bold mb-2">Academic Software v1.0.0</h3>
        <p className="text-white/50 text-sm max-w-lg mb-8">
          Developed as a college academic project to explore the intersection of mathematics, 
          data science, and educational technology.
        </p>
        <div className="flex gap-4">
          {GITHUB_URL ? (
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white/80"
              title="Open GitHub repository"
            >
              <Github size={20} />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="p-3 bg-white/10 rounded-xl transition-all text-white/50 cursor-not-allowed"
              title="GitHub link not configured"
            >
              <Github size={20} />
            </button>
          )}

          {CONTACT_EMAIL ? (
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white/80"
              title="Send email"
            >
              <Mail size={20} />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="p-3 bg-white/10 rounded-xl transition-all text-white/50 cursor-not-allowed"
              title="Contact email not configured"
            >
              <Mail size={20} />
            </button>
          )}
        </div>
        <p className="mt-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
          © 2026 Academic Software Architect. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
