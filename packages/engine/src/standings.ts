import { Match, Standing, ScoringRules, Team } from './types';
import { calculateMatchPoints } from './scoring';

/**
 * Calculate standings from matches
 */
export function calculateStandings(
  teams: Team[],
  matches: Match[],
  rules: ScoringRules
): Standing[] {
  const standings: Map<string, Standing> = new Map();

  // Initialize standings for all teams
  teams.forEach(team => {
    standings.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    });
  });

  // Process completed matches
  matches
    .filter(match => match.status === 'completed' && 
            match.homeScore !== undefined && 
            match.awayScore !== undefined)
    .forEach(match => {
      const homeStanding = standings.get(match.homeTeamId);
      const awayStanding = standings.get(match.awayTeamId);

      if (!homeStanding || !awayStanding) return;

      const homeScore = match.homeScore!;
      const awayScore = match.awayScore!;

      // Update home team
      homeStanding.played++;
      homeStanding.goalsFor += homeScore;
      homeStanding.goalsAgainst += awayScore;
      homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;

      // Update away team
      awayStanding.played++;
      awayStanding.goalsFor += awayScore;
      awayStanding.goalsAgainst += homeScore;
      awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;

      // Update results
      if (homeScore > awayScore) {
        homeStanding.won++;
        awayStanding.lost++;
        homeStanding.points += rules.winPoints;
        awayStanding.points += rules.lossPoints;
      } else if (homeScore < awayScore) {
        homeStanding.lost++;
        awayStanding.won++;
        homeStanding.points += rules.lossPoints;
        awayStanding.points += rules.winPoints;
      } else {
        homeStanding.drawn++;
        awayStanding.drawn++;
        homeStanding.points += rules.drawPoints;
        awayStanding.points += rules.drawPoints;
      }
    });

  // Sort standings
  return Array.from(standings.values()).sort((a, b) => {
    // 1. Points
    if (b.points !== a.points) return b.points - a.points;
    // 2. Goal difference
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    // 3. Goals scored
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    // 4. Alphabetical by name
    return a.teamName.localeCompare(b.teamName);
  });
}
