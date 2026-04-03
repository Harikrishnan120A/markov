/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { STATES, type State } from './markov';

export interface StudentData {
  id: string;
  name: string;
  department: string;
  semester: number;
  attendance: number; // 0-100
  internalMarks: number; // 0-100
  assignmentCompletion: number; // 0-100
  previousGPA: number; // 0-4.0
  gpa: number;
  state: State;
}

export interface RiskAnalysis {
  score: number; // 0-100
  level: 'Low' | 'Medium' | 'High';
  reasons: string[];
}

export interface Intervention {
  type: 'Academic' | 'Attendance' | 'Counseling';
  title: string;
  description: string;
  impact: string;
}

/**
 * Classifies a student into a Markov state based on academic indicators.
 */
export function classifyStudentState(data: StudentData): State {
  const { attendance, internalMarks, previousGPA } = data;
  
  // Weighted score for classification
  const score = (attendance * 0.3) + (internalMarks * 0.4) + ((previousGPA / 4.0) * 100 * 0.3);
  
  if (score >= 85) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 45) return 'Average';
  return 'Poor';
}

/**
 * Calculates a risk score and level for a student.
 */
export function calculateRisk(data: StudentData, currentState: State): RiskAnalysis {
  let score = 0;
  const reasons: string[] = [];

  // State-based risk
  if (currentState === 'Poor') {
    score += 40;
    reasons.push('Current performance state is Poor');
  } else if (currentState === 'Average') {
    score += 20;
    reasons.push('Current performance state is Average');
  }

  // Attendance risk
  if (data.attendance < 75) {
    score += 30;
    reasons.push(`Low attendance (${data.attendance}%)`);
  } else if (data.attendance < 85) {
    score += 10;
  }

  // Marks risk
  if (data.internalMarks < 50) {
    score += 20;
    reasons.push(`Low internal assessment marks (${data.internalMarks}%)`);
  }

  // GPA risk
  if (data.previousGPA < 2.0) {
    score += 10;
    reasons.push(`Low previous GPA (${data.previousGPA})`);
  }

  const level = score >= 60 ? 'High' : score >= 30 ? 'Medium' : 'Low';
  
  return { score: Math.min(score, 100), level, reasons };
}

/**
 * Recommends interventions based on student data and risk.
 */
export function recommendInterventions(data: StudentData, risk: RiskAnalysis): Intervention[] {
  const recommendations: Intervention[] = [];

  if (data.attendance < 75) {
    recommendations.push({
      type: 'Attendance',
      title: 'Attendance Recovery Plan',
      description: 'Mandatory meeting with academic counselor to discuss attendance barriers and create a catch-up schedule.',
      impact: 'High probability of state shift to Average'
    });
  }

  if (data.internalMarks < 50) {
    recommendations.push({
      type: 'Academic',
      title: 'Remedial Tutoring Program',
      description: 'Intensive subject-specific tutoring sessions focusing on core concepts and problem-solving techniques.',
      impact: 'Potential improvement in internal assessments and GPA (varies by engagement)'
    });
  }

  if (risk.level === 'High') {
    recommendations.push({
      type: 'Counseling',
      title: 'Intensive Mentoring',
      description: 'One-on-one sessions with a senior faculty mentor to address underlying academic and personal challenges.',
      impact: 'Significant improvement in overall academic health'
    });
  }

  if (data.assignmentCompletion < 80) {
    recommendations.push({
      type: 'Academic',
      title: 'Academic Skills Workshop',
      description: 'Workshop focusing on time management, study skills, and assignment prioritization.',
      impact: 'Improved consistency in internal assessments'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'Academic',
      title: 'Advanced Enrichment',
      description: 'Participation in research projects or advanced workshops to further excel.',
      impact: 'Preparation for higher academic honors'
    });
  }

  return recommendations;
}
