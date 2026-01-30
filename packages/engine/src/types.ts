/**
 * Scoring Engine Types
 */

export type SportType = 'soccer' | 'rugby' | 'custom';

export interface Team {
  id: string;
  name: string;
  droppedOut?: boolean;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  pitchId: string;
  scheduledTime: Date;
  sortOrder: number;
  isWalkover?: boolean;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface Standing {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface ScoringRules {
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  walkoverScore: { home: number; away: number };
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  type: 'resource-clash' | 'team-clash' | 'time-conflict';
  message: string;
  matchIds: string[];
}

export interface TimeCascadeOptions {
  delayMinutes: number;
  affectAllMatches?: boolean;
  startFromSortOrder?: number;
}
