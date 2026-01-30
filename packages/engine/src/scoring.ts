import { ScoringRules, SportType } from './types';

/**
 * Get scoring rules for a specific sport
 */
export function getScoringRules(sportType: SportType): ScoringRules {
  switch (sportType) {
    case 'soccer':
      return {
        winPoints: 3,
        drawPoints: 1,
        lossPoints: 0,
        walkoverScore: { home: 3, away: 0 }
      };
    case 'rugby':
      return {
        winPoints: 4,
        drawPoints: 2,
        lossPoints: 0,
        walkoverScore: { home: 28, away: 0 }
      };
    case 'custom':
    default:
      return {
        winPoints: 3,
        drawPoints: 1,
        lossPoints: 0,
        walkoverScore: { home: 1, away: 0 }
      };
  }
}

/**
 * Calculate points for a team in a match
 */
export function calculateMatchPoints(
  teamScore: number,
  opponentScore: number,
  rules: ScoringRules
): number {
  if (teamScore > opponentScore) {
    return rules.winPoints;
  } else if (teamScore === opponentScore) {
    return rules.drawPoints;
  } else {
    return rules.lossPoints;
  }
}
