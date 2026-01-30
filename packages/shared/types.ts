// This file contains TypeScript type definitions for the Firebase schema
// Use these types across both Admin and Live apps for type safety

export interface Tournament {
  id: string;
  name: string;
  sport: 'Soccer' | 'Rugby' | 'Custom';
  status: 'draft' | 'live' | 'completed';
  createdAt: Date;
  publishedAt?: Date;
  publicUrl?: string;
  settings?: {
    enablePushBack: boolean;
    enablePitchEvacuator: boolean;
    enableDropoutHandler: boolean;
  };
}

export interface Match {
  id: string;
  tournamentId: string;
  homeTeam: string; // Team ID
  awayTeam: string; // Team ID
  pitch: string;
  scheduledTime: Date;
  sortOrder: number; // CRITICAL: Enables push-back logic
  status: 'scheduled' | 'inProgress' | 'completed' | 'walkover' | 'cancelled';
  homeScore: number;
  awayScore: number;
  lastUpdated: Date;
  walkoverWinner?: string; // Team ID if walkover
  notes?: string;
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  points: number;
  goalsScored: number;
  goalsAgainst: number;
  goalDifference: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  status: 'active' | 'droppedOut';
  droppedOutAt?: Date;
}

export interface ScoringRules {
  sport: string;
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  walkoverScore: { home: number; away: number };
  tieBreakers: ('goalDifference' | 'goalsScored' | 'headToHead')[];
}

// Soccer-specific rules (Week 1 focus)
export const SOCCER_RULES: ScoringRules = {
  sport: 'Soccer',
  winPoints: 3,
  drawPoints: 1,
  lossPoints: 0,
  walkoverScore: { home: 3, away: 0 },
  tieBreakers: ['goalDifference', 'goalsScored', 'headToHead']
};

// Conflict detection types
export interface ResourceConflict {
  type: 'pitch' | 'team';
  conflictingMatches: string[]; // Match IDs
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  conflicts: ResourceConflict[];
}
