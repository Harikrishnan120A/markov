/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type State = 'Poor' | 'Average' | 'Good' | 'Excellent';

export const STATES: State[] = ['Poor', 'Average', 'Good', 'Excellent'];

export type TransitionMatrix = number[][];

export const DEFAULT_MATRIX: TransitionMatrix = [
  [0.50, 0.30, 0.15, 0.05], // From Poor
  [0.20, 0.40, 0.30, 0.10], // From Average
  [0.10, 0.20, 0.45, 0.25], // From Good
  [0.05, 0.10, 0.25, 0.60], // From Excellent
];

/**
 * Multiplies a probability vector by a transition matrix.
 * v' = v * P
 */
export function multiplyVectorMatrix(vector: number[], matrix: TransitionMatrix): number[] {
  const result = new Array(vector.length).fill(0);
  for (let j = 0; j < matrix[0].length; j++) {
    for (let i = 0; i < vector.length; i++) {
      result[j] += vector[i] * matrix[i][j];
    }
  }
  return result;
}

/**
 * Simulates a single student's path through states over N semesters.
 */
export function simulateStudentPath(
  initialState: State,
  matrix: TransitionMatrix,
  semesters: number
): State[] {
  const path: State[] = [initialState];
  let currentStateIndex = STATES.indexOf(initialState);

  for (let i = 0; i < semesters; i++) {
    const probabilities = matrix[currentStateIndex];
    const random = Math.random();
    let cumulative = 0;
    let nextStateIndex = currentStateIndex;

    for (let j = 0; j < probabilities.length; j++) {
      cumulative += probabilities[j];
      if (random < cumulative) {
        nextStateIndex = j;
        break;
      }
    }
    path.push(STATES[nextStateIndex]);
    currentStateIndex = nextStateIndex;
  }

  return path;
}

/**
 * Calculates the distribution of states after N semesters for a cohort.
 */
export function calculateDistribution(
  initialDistribution: number[],
  matrix: TransitionMatrix,
  semesters: number
): number[][] {
  const distributions: number[][] = [initialDistribution];
  let currentDist = [...initialDistribution];

  for (let i = 0; i < semesters; i++) {
    currentDist = multiplyVectorMatrix(currentDist, matrix);
    distributions.push(currentDist);
  }

  return distributions;
}

/**
 * Estimates the steady-state distribution using power iteration.
 */
export function calculateSteadyState(matrix: TransitionMatrix, iterations: number = 100): number[] {
  let vector = new Array(matrix.length).fill(1 / matrix.length);
  for (let i = 0; i < iterations; i++) {
    const nextVector = multiplyVectorMatrix(vector, matrix);
    // Check for convergence
    let diff = 0;
    for (let j = 0; j < vector.length; j++) {
      diff += Math.abs(nextVector[j] - vector[j]);
    }
    vector = nextVector;
    if (diff < 1e-10) break;
  }
  return vector;
}
