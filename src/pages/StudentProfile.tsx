/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useRef, useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Award,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { motion } from 'motion/react';
import { classifyStudentState, calculateRisk, type StudentData } from '../lib/student';
import { STATES } from '../lib/markov';

interface StudentProfileProps {
  students: StudentData[];
  selectedStudent: StudentData | null;
  onSelectStudent: (student: StudentData) => void;
  onAddStudent: (draft: Omit<StudentData, 'state'>) => void;
  onReplaceStudents?: (next: StudentData[]) => void;
  matrix: number[][];
  onUpdateMatrix?: (next: number[][]) => void;
  searchQuery?: string;
  onSearchQueryChange?: (next: string) => void;
}

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}

export default function StudentProfile({ students, selectedStudent, onSelectStudent, onAddStudent, onReplaceStudents, matrix, onUpdateMatrix, searchQuery, onSearchQueryChange }: StudentProfileProps) {
  const activeStudent = selectedStudent ?? students[0] ?? null;

  const risk = useMemo(() => {
    if (!activeStudent) return null;
    return calculateRisk(activeStudent, activeStudent.state);
  }, [activeStudent]);

  const [showAdd, setShowAdd] = useState(students.length === 0);
  const [localQuery, setLocalQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const query = searchQuery ?? localQuery;
  const setQuery = onSearchQueryChange ?? setLocalQuery;

  const [dataMessage, setDataMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const importStudentsInputRef = useRef<HTMLInputElement | null>(null);
  const importMatrixInputRef = useRef<HTMLInputElement | null>(null);

  const downloadJson = (filename: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const normalizeStudent = (raw: any): StudentData | null => {
    if (!raw || typeof raw !== 'object') return null;
    const id = String(raw.id ?? '').trim();
    const name = String(raw.name ?? '').trim();
    const department = String(raw.department ?? '').trim();
    if (!id || !name || !department) return null;

    const semester = Math.max(1, Math.round(Number(raw.semester ?? 1)));
    const attendance = clamp(Number(raw.attendance ?? 0), 0, 100);
    const internalMarks = clamp(Number(raw.internalMarks ?? 0), 0, 100);
    const assignmentCompletion = clamp(Number(raw.assignmentCompletion ?? 0), 0, 100);
    const previousGPA = clamp(Number(raw.previousGPA ?? 0), 0, 4);
    const gpa = clamp(Number(raw.gpa ?? 0), 0, 4);

    const base: StudentData = {
      id,
      name,
      department,
      semester,
      attendance,
      internalMarks,
      assignmentCompletion,
      previousGPA,
      gpa,
      state: 'Average',
    };

    return { ...base, state: classifyStudentState(base) };
  };

  const normalizeMatrix = (raw: any): number[][] | null => {
    const n = STATES.length;
    if (!Array.isArray(raw) || raw.length !== n) return null;
    const rows = raw.map((row) => (Array.isArray(row) ? row.map((x) => Number(x)) : []));
    if (rows.some((r) => r.length !== n || r.some((x) => !Number.isFinite(x) || x < 0))) return null;

    return rows.map((r) => {
      const sum = r.reduce((acc, x) => acc + x, 0);
      if (sum <= 0) return new Array(n).fill(1 / n);
      return r.map((x) => x / sum);
    });
  };

  const visibleStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      const matchesQuery =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);

      if (!matchesQuery) return false;
      if (riskFilter === 'All') return true;
      const r = calculateRisk(s, s.state);
      return r.level === riskFilter;
    });
  }, [query, riskFilter, students]);
  const [draft, setDraft] = useState<Omit<StudentData, 'state'>>({
    id: '',
    name: '',
    department: '',
    semester: 1,
    attendance: 100,
    internalMarks: 0,
    assignmentCompletion: 0,
    previousGPA: 0,
    gpa: 0,
  });

  const canSubmit =
    draft.id.trim().length > 0 &&
    draft.name.trim().length > 0 &&
    draft.department.trim().length > 0 &&
    Number.isFinite(draft.semester) &&
    draft.semester >= 1;

  const submit = () => {
    if (!canSubmit) return;
    onAddStudent({
      ...draft,
      id: draft.id.trim(),
      name: draft.name.trim(),
      department: draft.department.trim(),
      semester: Math.max(1, Math.round(draft.semester)),
      attendance: Math.max(0, Math.min(100, draft.attendance)),
      internalMarks: Math.max(0, Math.min(100, draft.internalMarks)),
      assignmentCompletion: Math.max(0, Math.min(100, draft.assignmentCompletion)),
      previousGPA: Math.max(0, Math.min(4, draft.previousGPA)),
      gpa: Math.max(0, Math.min(4, draft.gpa)),
    });
    setShowAdd(false);
    setDraft({
      id: '',
      name: '',
      department: '',
      semester: 1,
      attendance: 100,
      internalMarks: 0,
      assignmentCompletion: 0,
      previousGPA: 0,
      gpa: 0,
    });
  };

  return (
    <div className="space-y-10">
      {/* Header with Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Student Intelligence Profile</h2>
          <p className="text-sm text-slate-500 font-medium">Detailed academic and behavioral analysis for individual monitoring.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or Name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full md:w-64"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setRiskFilter((prev) => (prev === 'All' ? 'High' : prev === 'High' ? 'Medium' : prev === 'Medium' ? 'Low' : 'All'));
            }}
            className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors"
            title={riskFilter === 'All' ? 'Filter: All risk levels' : `Filter: ${riskFilter} risk`}
            aria-label="Toggle risk filter"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Student List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Data Tools</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Import/export your cohort and matrix (useful for reports and sharing).
              </p>
              {dataMessage && (
                <div
                  className={cn(
                    "mt-4 px-4 py-3 rounded-2xl border text-xs font-bold",
                    dataMessage.type === 'success'
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                      : "bg-rose-50 border-rose-100 text-rose-700"
                  )}
                >
                  {dataMessage.text}
                </div>
              )}
            </div>

            <div className="p-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  downloadJson('margov-students.json', { version: 1, exportedAt: new Date().toISOString(), students });
                  setDataMessage({ type: 'success', text: 'Exported students to JSON.' });
                }}
                disabled={students.length === 0}
                className={cn(
                  "px-4 py-3 rounded-2xl border text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors",
                  students.length === 0
                    ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
                title={students.length === 0 ? 'No students to export' : 'Export students (JSON)'}
              >
                <Download size={16} />
                Export
              </button>

              <button
                type="button"
                onClick={() => importStudentsInputRef.current?.click()}
                className="px-4 py-3 rounded-2xl border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                title="Import students (JSON)"
              >
                <Upload size={16} />
                Import
              </button>

              <button
                type="button"
                onClick={() => {
                  downloadJson('margov-matrix.json', { version: 1, exportedAt: new Date().toISOString(), matrix });
                  setDataMessage({ type: 'success', text: 'Exported matrix to JSON.' });
                }}
                className="px-4 py-3 rounded-2xl border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                title="Export matrix (JSON)"
              >
                <Download size={16} />
                Matrix
              </button>

              <button
                type="button"
                onClick={() => importMatrixInputRef.current?.click()}
                disabled={!onUpdateMatrix}
                className={cn(
                  "px-4 py-3 rounded-2xl border text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors",
                  onUpdateMatrix
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                )}
                title={onUpdateMatrix ? 'Import matrix (JSON)' : 'Matrix import not available here'}
              >
                <Upload size={16} />
                Matrix
              </button>

              <input
                ref={importStudentsInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();

                  reader.onload = () => {
                    try {
                      const text = String(reader.result ?? '');
                      const parsed = JSON.parse(text) as any;
                      const rawStudents = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.students) ? parsed.students : null;
                      if (!rawStudents) throw new Error('Invalid format: expected an array or { students: [...] }.');

                      const normalized = rawStudents.map(normalizeStudent).filter(Boolean) as StudentData[];
                      if (normalized.length === 0) throw new Error('No valid students found in file.');

                      if (onReplaceStudents) {
                        // Merge by id (import wins)
                        const byId = new Map<string, StudentData>();
                        students.forEach((s) => byId.set(s.id, s));
                        normalized.forEach((s) => byId.set(s.id, s));
                        onReplaceStudents(Array.from(byId.values()));
                      } else {
                        // Fallback: add one-by-one
                        normalized.forEach((s) => {
                          const { state: _ignored, ...draft } = s;
                          onAddStudent(draft);
                        });
                      }

                      setDataMessage({ type: 'success', text: `Imported ${normalized.length} student(s).` });
                    } catch (err) {
                      setDataMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to import students.' });
                    } finally {
                      e.target.value = '';
                    }
                  };

                  reader.onerror = () => {
                    setDataMessage({ type: 'error', text: 'Failed to read file.' });
                    e.target.value = '';
                  };

                  reader.readAsText(file);
                }}
              />

              <input
                ref={importMatrixInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();

                  reader.onload = () => {
                    try {
                      if (!onUpdateMatrix) throw new Error('Matrix import is not available.');
                      const text = String(reader.result ?? '');
                      const parsed = JSON.parse(text) as any;
                      const rawMatrix = Array.isArray(parsed) ? parsed : parsed?.matrix;
                      const normalized = normalizeMatrix(rawMatrix);
                      if (!normalized) throw new Error('Invalid matrix format. Expected a 4×4 numeric matrix.');
                      onUpdateMatrix(normalized);
                      setDataMessage({ type: 'success', text: 'Imported matrix and normalized row sums.' });
                    } catch (err) {
                      setDataMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to import matrix.' });
                    } finally {
                      e.target.value = '';
                    }
                  };

                  reader.onerror = () => {
                    setDataMessage({ type: 'error', text: 'Failed to read file.' });
                    e.target.value = '';
                  };

                  reader.readAsText(file);
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-bottom border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Cohort Directory</h3>
              <button
                onClick={() => setShowAdd(true)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                title="Add a student"
              >
                <Plus size={14} />
                Add
              </button>
            </div>

            {students.length === 0 ? (
              <div className="p-6">
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                  <p className="text-sm font-bold text-slate-900 mb-1">No students yet</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Add a student to start monitoring and prediction.</p>
                </div>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                {visibleStudents.length === 0 ? (
                  <div className="p-6">
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                      <p className="text-sm font-bold text-slate-900 mb-1">No matches</p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Try a different search, or change the risk filter.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setQuery('')}
                          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-[10px] font-bold uppercase tracking-widest"
                        >
                          Clear search
                        </button>
                        <button
                          type="button"
                          onClick={() => setRiskFilter('All')}
                          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-[10px] font-bold uppercase tracking-widest"
                        >
                          Reset filter
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                visibleStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => onSelectStudent(student)}
                    className={cn(
                      "p-6 cursor-pointer border-b border-slate-50 last:border-0 transition-all flex items-center gap-4 group",
                      activeStudent?.id === student.id ? "bg-indigo-50/50" : "hover:bg-slate-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105",
                        activeStudent?.id === student.id ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-900"
                      )}
                    >
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate mb-0.5">{student.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{student.id} • {student.department}</p>
                    </div>
                    <ChevronRight
                      size={16}
                      className={cn(
                        "transition-all",
                        activeStudent?.id === student.id ? "text-indigo-600 translate-x-1" : "text-slate-300 opacity-0 group-hover:opacity-100"
                      )}
                    />
                  </div>
                )))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {showAdd && (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-8">
                <h3 className="text-2xl font-display font-bold text-slate-900">Add student</h3>
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-[10px] font-bold uppercase tracking-widest"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Student ID</label>
                  <input
                    value={draft.id}
                    onChange={(e) => setDraft((p) => ({ ...p, id: e.target.value }))}
                    placeholder="e.g., S201"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Name</label>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Student name"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Department</label>
                  <input
                    value={draft.department}
                    onChange={(e) => setDraft((p) => ({ ...p, department: e.target.value }))}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Semester</label>
                  <input
                    type="number"
                    min={1}
                    value={draft.semester}
                    onChange={(e) => setDraft((p) => ({ ...p, semester: Number.parseInt(e.target.value || '1', 10) }))}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Attendance (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.attendance}
                    onChange={(e) => setDraft((p) => ({ ...p, attendance: Number.parseFloat(e.target.value || '0') }))}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Internal Marks (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.internalMarks}
                    onChange={(e) => setDraft((p) => ({ ...p, internalMarks: Number.parseFloat(e.target.value || '0') }))}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assignment Completion (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.assignmentCompletion}
                    onChange={(e) => setDraft((p) => ({ ...p, assignmentCompletion: Number.parseFloat(e.target.value || '0') }))}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Previous GPA (0–4)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={4}
                    value={draft.previousGPA}
                    onChange={(e) => setDraft((p) => ({ ...p, previousGPA: Number.parseFloat(e.target.value || '0') }))}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current GPA (0–4)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={4}
                    value={draft.gpa}
                    onChange={(e) => setDraft((p) => ({ ...p, gpa: Number.parseFloat(e.target.value || '0') }))}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={submit}
                  disabled={!canSubmit}
                  className={cn(
                    "px-6 py-3 rounded-2xl font-bold text-sm shadow-lg transition-colors",
                    canSubmit
                      ? "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
                      : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                  )}
                >
                  Save student
                </button>
                <p className="text-xs text-slate-500 font-medium self-center">State + risk will be computed automatically.</p>
              </div>
            </div>
          )}

          {!activeStudent ? (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
              <p className="text-sm font-bold text-slate-900 mb-1">Select or add a student</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">Once you add a student, their profile will appear here.</p>
            </div>
          ) : (
            <>
              {/* Profile Hero */}
              <motion.div 
                key={activeStudent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm"
              >
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-900 flex items-center justify-center text-white text-4xl font-display font-bold shadow-xl shadow-indigo-200">
                      {activeStudent.name.charAt(0)}
                    </div>
                    <div className={cn(
                      "absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg",
                      risk?.level === 'High' ? "bg-rose-500" : risk?.level === 'Medium' ? "bg-amber-500" : "bg-emerald-500"
                    )}>
                      <AlertCircle size={20} />
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-4xl font-display font-bold text-slate-900">{activeStudent.name}</h1>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                          Active Student
                        </span>
                      </div>
                      <p className="text-lg text-slate-500 font-medium flex items-center gap-2">
                        <GraduationCap size={20} className="text-indigo-600" />
                        {activeStudent.department} • Semester {activeStudent.semester}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Award size={24} />
                    </div>
                    <TrendingUp size={20} className="text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current GPA</p>
                  <p className="text-3xl font-display font-bold text-slate-900">{activeStudent.gpa.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Calendar size={24} />
                    </div>
                    <TrendingDown size={20} className="text-rose-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                  <p className="text-3xl font-display font-bold text-slate-900">{activeStudent.attendance}%</p>
                </div>

                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <BookOpen size={24} />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current State</p>
                  <p className="text-3xl font-display font-bold text-slate-900">{activeStudent.state}</p>
                </div>
              </div>

              {/* Risk Analysis */}
              {risk && (
                <div className={cn(
                  "rounded-[2.5rem] p-10 border shadow-sm",
                  risk.level === 'High' ? "bg-rose-50 border-rose-100" : risk.level === 'Medium' ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
                )}>
                <div className="flex items-center gap-4 mb-8">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                    risk.level === 'High' ? "bg-rose-500 shadow-rose-200" : risk.level === 'Medium' ? "bg-amber-500 shadow-amber-200" : "bg-emerald-500 shadow-emerald-200"
                  )}>
                    <AlertCircle size={28} />
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-2xl font-display font-bold",
                      risk.level === 'High' ? "text-rose-950" : risk.level === 'Medium' ? "text-amber-950" : "text-emerald-950"
                    )}>
                      Risk Assessment: {risk.level}
                    </h3>
                    <p className={cn(
                      "text-sm font-medium",
                      risk.level === 'High' ? "text-rose-900/60" : risk.level === 'Medium' ? "text-amber-900/60" : "text-emerald-900/60"
                    )}>
                      AI-driven risk classification based on current academic trajectory.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {risk.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl border border-white/40 text-sm font-bold text-slate-800">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        risk.level === 'High' ? "bg-rose-500" : risk.level === 'Medium' ? "bg-amber-500" : "bg-emerald-500"
                      )} />
                      {reason}
                    </div>
                  ))}
                </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
