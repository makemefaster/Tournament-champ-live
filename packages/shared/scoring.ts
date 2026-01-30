// Scoring Logic for Soccer (Week 1 Implementation)
// This implements FIFA-standard scoring rules

import { Team, Match, ScoringRules, SOCCER_RULES } from './types';

/**
 * Calculate points for a match result
 */
export function calculateMatchPoints(
  homeScore: number,
  awayScore: number,
  rules: ScoringRules = SOCCER_RULES
): { homePoints: number; awayPoints: number } {
  if (homeScore > awayScore) {
    return { homePoints: rules.winPoints, awayPoints: rules.lossPoints };
  } else if (homeScore < awayScore) {
    return { homePoints: rules.lossPoints, awayPoints: rules.winPoints };
  } else {
    return { homePoints: rules.drawPoints, awayPoints: rules.drawPoints };
  }
}

/**
 * Update team standings after a match
 */
export function updateTeamStandings(
  team: Team,
  scored: number,
  conceded: number,
  points: number
): Team {
  const isWin = points === SOCCER_RULES.winPoints;
  const isDraw = points === SOCCER_RULES.drawPoints;
  const isLoss = points === SOCCER_RULES.lossPoints;

  return {
    ...team,
    points: team.points + points,
    played: team.played + 1,
    won: team.won + (isWin ? 1 : 0),
    drawn: team.drawn + (isDraw ? 1 : 0),
    lost: team.lost + (isLoss ? 1 : 0),
    goalsScored: team.goalsScored + scored,
    goalsAgainst: team.goalsAgainst + conceded,
    goalDifference: team.goalDifference + (scored - conceded)
  };
}

/**
 * Handle walkover scenario (3-0 default)
 */
export function applyWalkover(
  winningTeam: Team,
  losingTeam: Team,
  rules: ScoringRules = SOCCER_RULES
): { winner: Team; loser: Team } {
  const { home: homeScore, away: awayScore } = rules.walkoverScore;
  
  const winner = updateTeamStandings(
    winningTeam,
    homeScore,
    awayScore,
    rules.winPoints
  );
  
  const loser = updateTeamStandings(
    losingTeam,
    awayScore,
    homeScore,
    rules.lossPoints
  );

  return { winner, loser };
}

/**
 * Sort teams by tournament standings
 * Tie-breakers: 1. Points, 2. Goal Difference, 3. Goals Scored
 */
export function sortTeamsByStandings(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => {
    // 1. Points
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    
    // 2. Goal Difference
    if (a.goalDifference !== b.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    
    // 3. Goals Scored
    if (a.goalsScored !== b.goalsScored) {
      return b.goalsScored - a.goalsScored;
    }
    
    // 4. Alphabetical (as last resort)
    return a.name.localeCompare(b.name);
  });
}

/**
 * Calculate standings for all teams in a tournament
 */
export function calculateTournamentStandings(
  teams: Team[],
  matches: Match[]
): Team[] {
  // Start with fresh team records
  const standings = teams.map(team => ({
    ...team,
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsScored: 0,
    goalsAgainst: 0,
    goalDifference: 0
  }));

  // Process all completed matches
  const completedMatches = matches.filter(m => m.status === 'completed' || m.status === 'walkover');
  
  for (const match of completedMatches) {
    const homeTeam = standings.find(t => t.id === match.homeTeam);
    const awayTeam = standings.find(t => t.id === match.awayTeam);
    
    if (!homeTeam || !awayTeam) continue;
    
    const { homePoints, awayPoints } = calculateMatchPoints(
      match.homeScore,
      match.awayScore
    );
    
    // Update home team
    const homeIndex = standings.findIndex(t => t.id === homeTeam.id);
    standings[homeIndex] = updateTeamStandings(
      homeTeam,
      match.homeScore,
      match.awayScore,
      homePoints
    );
    
    // Update away team
    const awayIndex = standings.findIndex(t => t.id === awayTeam.id);
    standings[awayIndex] = updateTeamStandings(
      awayTeam,
      match.awayScore,
      match.homeScore,
      awayPoints
    );
  }

  return sortTeamsByStandings(standings);
}
