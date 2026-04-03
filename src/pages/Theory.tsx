/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Info, 
  Zap, 
  Layers, 
  TrendingUp 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Theory() {
  const sections = [
    {
      title: "What is a Stochastic Process?",
      content: "A stochastic process is a mathematical object usually defined as a collection of random variables. In our context, it represents the evolution of a student's academic state over time (semesters).",
      icon: Zap,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "The Markov Property",
      content: "The future state depends only on the current state and not on the sequence of events that preceded it. This 'memoryless' property allows us to model transitions using a single matrix.",
      icon: Layers,
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      title: "Transition Probability Matrix",
      content: "A square matrix where each entry P(i,j) represents the probability of moving from state i to state j. The sum of each row must always equal 1.0 (100%).",
      icon: TrendingUp,
      color: "bg-teal-100 text-teal-600"
    }
  ];

  return (
    <div className="space-y-12">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-ink mb-4">Theoretical Foundations</h1>
        <p className="text-lg text-muted leading-relaxed">
          Understanding the mathematical principles behind the Student Performance Prediction model.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card flex flex-col items-start"
          >
            <div className={`w-12 h-12 ${section.color} rounded-2xl flex items-center justify-center mb-6`}>
              <section.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-ink mb-4">{section.title}</h3>
            <p className="text-muted text-sm leading-relaxed">{section.content}</p>
          </motion.div>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-ink">Why Markov for Education?</h2>
          <p className="text-muted leading-relaxed">
            Academic performance is a dynamic process. A student's current performance (e.g., 'Average') 
            is the strongest predictor of their performance in the next semester. By quantifying these 
            transitions, institutions can:
          </p>
          <ul className="space-y-4">
            {[
              "Identify students at risk of declining performance.",
              "Predict long-term graduation rates and academic health.",
              "Allocate resources effectively based on predicted state distributions.",
              "Model the impact of academic interventions on transition probabilities."
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={20} />
                <span className="text-ink font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card bg-slate-900 text-white p-8 overflow-hidden relative">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Info size={20} className="text-primary" />
            Mathematical Notation
          </h3>
          <div className="space-y-6 font-mono text-sm text-white/80">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-primary mb-2">// State Vector</p>
              <p>v(t) = [P(Poor), P(Avg), P(Good), P(Exc)]</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-primary mb-2">// Next State Calculation</p>
              <p>v(t + 1) = v(t) × P</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-primary mb-2">// Steady State Condition</p>
              <p>π × P = π</p>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        </div>
      </section>

      <section className="card bg-indigo-50 border-indigo-100 p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
            <BookOpen size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-indigo-900 mb-2">Real-World Application</h3>
            <p className="text-indigo-800/70 leading-relaxed">
              In a real academic setting, transition matrices are generated by analyzing historical data 
              of thousands of students over several years. This data-driven approach allows for highly 
              accurate predictive modeling tailored to specific institutional curricula and student demographics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
