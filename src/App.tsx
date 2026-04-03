/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { 
  LayoutDashboard, 
  UserCircle, 
  Zap, 
  ArrowRightLeft,
  AlertTriangle, 
  HeartPulse, 
  FlaskConical, 
  BarChart3, 
  BookOpen, 
  Menu,
  X,
  Bell,
  Search,
  Settings,
  Users,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Markov Logic
import { 
  DEFAULT_MATRIX, 
  type TransitionMatrix,
} from './lib/markov';

// Student Logic
import { classifyStudentState, type StudentData } from './lib/student';

// Pages (lazy-loaded for faster initial load)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const PredictionEngine = lazy(() => import('./pages/PredictionEngine'));
const RiskMonitoring = lazy(() => import('./pages/RiskMonitoring'));
const InterventionLab = lazy(() => import('./pages/InterventionLab'));
const ScenarioLab = lazy(() => import('./pages/ScenarioLab'));
const InputOutputSystem = lazy(() => import('./pages/InputOutputSystem'));
const CohortAnalytics = lazy(() => import('./pages/CohortAnalytics'));
const Methodology = lazy(() => import('./pages/Methodology'));

function PageFallback() {
  return (
    <div className="bg-white rounded-[2.25rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10">
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-1/3 bg-slate-100 rounded-xl" />
        <div className="h-4 w-2/3 bg-slate-100 rounded-xl" />
        <div className="h-40 w-full bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-24 bg-slate-100 rounded-3xl" />
          <div className="h-24 bg-slate-100 rounded-3xl" />
          <div className="h-24 bg-slate-100 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type PageId = 'dashboard' | 'io' | 'profile' | 'prediction' | 'risk' | 'intervention' | 'scenario' | 'cohort' | 'methodology';

const PAGE_IDS: PageId[] = ['dashboard', 'io', 'profile', 'prediction', 'risk', 'intervention', 'scenario', 'cohort', 'methodology'];

function isPageId(value: string): value is PageId {
  return (PAGE_IDS as string[]).includes(value);
}

function getPageFromHash(hash: string): PageId | null {
  const raw = hash.replace(/^#/, '');
  if (!raw) return null;
  const [page] = raw.split('?');
  return isPageId(page) ? page : null;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'io', label: 'Input → Output', icon: ArrowRightLeft },
  { id: 'profile', label: 'Student Profile', icon: UserCircle },
  { id: 'prediction', label: 'Prediction Engine', icon: Zap },
  { id: 'risk', label: 'Risk Monitoring', icon: AlertTriangle },
  { id: 'intervention', label: 'Intervention Lab', icon: HeartPulse },
  { id: 'scenario', label: 'Scenario Lab', icon: FlaskConical },
  { id: 'cohort', label: 'Batch Analytics', icon: BarChart3 },
  { id: 'methodology', label: 'Methodology', icon: BookOpen },
];

function NoStudentsCard({ onGoToProfile }: { onGoToProfile: () => void }) {
  return (
    <div className="bg-white rounded-[2.25rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
          <Users size={22} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-display font-bold text-slate-900 mb-1">No student data yet</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Add at least one student to use predictions, risk monitoring, and interventions.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onGoToProfile}
              className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Add student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [matrix, setMatrix] = useState<TransitionMatrix>(DEFAULT_MATRIX);
  const [students, setStudents] = useState<StudentData[]>(() => {
    try {
      const raw = localStorage.getItem('margov.students.v1');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as StudentData[]) : [];
    } catch {
      return [];
    }
  });

  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(() => {
    // Prefer the first stored student if present.
    return null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 1024px)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setSidebarOpen(mq.matches);
    sync();

    // Compatibility: older browsers used addListener/removeListener
    const mql = mq as unknown as {
      addEventListener?: (type: 'change', listener: () => void) => void;
      removeEventListener?: (type: 'change', listener: () => void) => void;
      addListener?: (listener: () => void) => void;
      removeListener?: (listener: () => void) => void;
    };

    if (mql.addEventListener && mql.removeEventListener) {
      mql.addEventListener('change', sync);
      return () => mql.removeEventListener?.('change', sync);
    }

    mql.addListener?.(sync);
    return () => mql.removeListener?.(sync);
  }, []);

  useEffect(() => {
    // Allow bookmarking + browser back/forward using URL hash.
    const applyHash = () => {
      const page = getPageFromHash(window.location.hash);
      if (!page) return;
      setCurrentPage(page);
    };

    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  useEffect(() => {
    const target = `#${currentPage}`;
    if (typeof window !== 'undefined' && window.location.hash !== target) {
      window.location.hash = target;
    }
    // UX: reset scroll position on page change.
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    try {
      localStorage.setItem('margov.students.v1', JSON.stringify(students));
    } catch {
      // ignore
    }
  }, [students]);

  useEffect(() => {
    // Keep selected student valid when the list changes.
    if (students.length === 0) {
      setSelectedStudent(null);
      return;
    }

    setSelectedStudent((prev) => {
      if (!prev) return students[0];
      const stillExists = students.find((s) => s.id === prev.id);
      return stillExists ?? students[0];
    });
  }, [students]);

  const addStudent = (draft: Omit<StudentData, 'state'>) => {
    const next: StudentData = {
      ...draft,
      state: classifyStudentState({ ...draft, state: 'Average' } as StudentData),
    };
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === next.id);
      return exists ? prev.map((s) => (s.id === next.id ? next : s)) : [next, ...prev];
    });
    setSelectedStudent(next);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} students={students} />;
      case 'io': return <InputOutputSystem matrix={matrix} onUpdateMatrix={setMatrix} />;
      case 'profile':
        return (
          <StudentProfile
            students={students}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
            onAddStudent={addStudent}
            onReplaceStudents={setStudents}
            matrix={matrix}
            onUpdateMatrix={setMatrix}
            searchQuery={studentSearchQuery}
            onSearchQueryChange={setStudentSearchQuery}
          />
        );
      case 'prediction':
        return selectedStudent ? <PredictionEngine selectedStudent={selectedStudent} matrix={matrix} /> : <NoStudentsCard onGoToProfile={() => setCurrentPage('profile')} />;
      case 'risk':
        return <RiskMonitoring onNavigate={setCurrentPage} onSelectStudent={setSelectedStudent} matrix={matrix} students={students} />;
      case 'intervention':
        return selectedStudent ? <InterventionLab selectedStudent={selectedStudent} matrix={matrix} /> : <NoStudentsCard onGoToProfile={() => setCurrentPage('profile')} />;
      case 'scenario': return <ScenarioLab matrix={matrix} onUpdateMatrix={setMatrix} />;
      case 'cohort': return <CohortAnalytics matrix={matrix} students={students} />;
      case 'methodology': return <Methodology onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} students={students} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 lg:relative lg:translate-x-0",
          !sidebarOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Zap size={28} />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl leading-tight text-indigo-950">Markov-AMIS</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Academic Intelligence</p>
              </div>
            </div>

            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group",
                    currentPage === item.id 
                      ? "bg-indigo-900 text-white shadow-lg shadow-indigo-100" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-indigo-900"
                  )}
                >
                  <item.icon size={20} className={cn(
                    "transition-colors",
                    currentPage === item.id ? "text-white" : "text-slate-400 group-hover:text-indigo-900"
                  )} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-8 border-t border-slate-100">
            <div className="bg-slate-900 rounded-3xl p-5 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">System Status</p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold">Local session</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentPage('scenario');
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                  title="Open Scenario Lab"
                >
                  Data settings
                </button>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl w-80">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search student ID or name..." 
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                onFocus={() => setCurrentPage('profile')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setCurrentPage('profile');
                }}
                className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              disabled
              title="Notifications (coming soon)"
              className="p-2.5 text-slate-300 rounded-xl transition-all cursor-not-allowed"
            >
              <Bell size={22} />
            </button>
            <button
              type="button"
              disabled
              title="Settings (coming soon)"
              className="p-2.5 text-slate-300 rounded-xl transition-all cursor-not-allowed"
            >
              <Settings size={22} />
            </button>
            <div className="h-10 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-indigo-950 leading-none mb-1">User</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-900 font-bold shadow-sm">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Suspense fallback={<PageFallback />}>
                  {renderPage()}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
