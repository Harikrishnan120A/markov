/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  Grid3X3, 
  User, 
  Users, 
  Activity, 
  BarChart3 
} from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onNavigate: (page: any) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const features = [
    { id: 'theory', title: 'Markov Theory', desc: 'Understand the mathematical foundations of stochastic processes.', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'matrix', title: 'Transition Matrix', desc: 'Define how students move between performance states.', icon: Grid3X3, color: 'bg-indigo-500' },
    { id: 'single', title: 'Single Student', icon: User, desc: 'Predict individual academic progression over semesters.', color: 'bg-teal-500' },
    { id: 'multi', title: 'Cohort Analysis', icon: Users, desc: 'Analyze performance trends for large groups of students.', color: 'bg-emerald-500' },
    { id: 'steady', title: 'Steady State', icon: Activity, desc: 'Calculate long-term equilibrium of academic performance.', color: 'bg-amber-500' },
    { id: 'comparison', title: 'Comparative Insights', icon: BarChart3, desc: 'Compare outcomes across different starting scenarios.', color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-ink text-white p-8 lg:p-16">
        <div className="relative z-10 max-w-2xl">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-bold uppercase tracking-widest mb-6"
          >
            Academic Analytics Platform
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-display font-bold leading-tight mb-6"
          >
            Student Performance Prediction using <span className="text-primary-light">Markov Process</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 mb-8 leading-relaxed"
          >
            A professional mathematical model designed to simulate and predict academic evolution. 
            Leverage stochastic matrices to understand long-term student success.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={() => onNavigate('theory')}
              className="px-8 py-4 bg-primary rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 group"
            >
              Get Started
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('about')}
              className="px-8 py-4 bg-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all"
            >
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-secondary rounded-full blur-[100px]" />
        </div>
      </section>

      {/* Feature Grid */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-ink mb-2">Project Modules</h2>
            <p className="text-muted">Explore the different components of the Markovian analysis.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onNavigate(feature.id)}
              className="card group cursor-pointer"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">{feature.title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-6">{feature.desc}</p>
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                Explore Module
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Stats / Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card bg-indigo-50 border-indigo-100">
          <h3 className="text-xl font-bold text-indigo-900 mb-4">Why Markov Processes?</h3>
          <p className="text-indigo-800/70 leading-relaxed mb-6">
            Academic performance is rarely static. A student's future state often depends on their current standing. 
            The Markov property perfectly captures this "memoryless" transition, making it a powerful tool for 
            educational forecasting and resource allocation.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-2xl font-bold text-indigo-600">4</p>
              <p className="text-xs font-medium text-muted uppercase">Defined States</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-2xl font-bold text-indigo-600">Stochastic</p>
              <p className="text-xs font-medium text-muted uppercase">Model Type</p>
            </div>
          </div>
        </div>
        <div className="card flex flex-col justify-center items-center text-center p-8 bg-teal-50 border-teal-100">
          <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-teal-200">
            <Activity size={32} />
          </div>
          <h3 className="text-xl font-bold text-teal-900 mb-2">Steady State</h3>
          <p className="text-teal-800/70 text-sm mb-6">
            Predict the long-term equilibrium where student distributions stabilize.
          </p>
          <button 
            onClick={() => onNavigate('steady')}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
          >
            View Analysis
          </button>
        </div>
      </section>
    </div>
  );
}
