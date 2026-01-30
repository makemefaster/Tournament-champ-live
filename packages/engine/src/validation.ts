import { Match, ValidationResult, ValidationError } from './types';

/**
 * Validate tournament schedule for conflicts
 */
export function validateSchedule(matches: Match[]): ValidationResult {
  const errors: ValidationError[] = [];

  // Check for resource clashes (same pitch, same time)
  const pitchTimeMap = new Map<string, string[]>();
  
  matches.forEach(match => {
    const key = `${match.pitchId}-${match.scheduledTime.getTime()}`;
    const existing = pitchTimeMap.get(key) || [];
    existing.push(match.id);
    pitchTimeMap.set(key, existing);
  });

  pitchTimeMap.forEach((matchIds, key) => {
    if (matchIds.length > 1) {
      const [pitchId, timeStr] = key.split('-');
      errors.push({
        type: 'resource-clash',
        message: `Pitch ${pitchId} has multiple matches scheduled at ${new Date(parseInt(timeStr)).toISOString()}`,
        matchIds
      });
    }
  });

  // Check for team clashes (same team, same time)
  const teamTimeMap = new Map<string, string[]>();
  
  matches.forEach(match => {
    const homeKey = `${match.homeTeamId}-${match.scheduledTime.getTime()}`;
    const awayKey = `${match.awayTeamId}-${match.scheduledTime.getTime()}`;
    
    const homeMatches = teamTimeMap.get(homeKey) || [];
    homeMatches.push(match.id);
    teamTimeMap.set(homeKey, homeMatches);
    
    const awayMatches = teamTimeMap.get(awayKey) || [];
    awayMatches.push(match.id);
    teamTimeMap.set(awayKey, awayMatches);
  });

  teamTimeMap.forEach((matchIds, key) => {
    if (matchIds.length > 1) {
      const [teamId, timeStr] = key.split('-');
      errors.push({
        type: 'team-clash',
        message: `Team ${teamId} has multiple matches scheduled at ${new Date(parseInt(timeStr)).toISOString()}`,
        matchIds
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if a team can be added to a match without conflicts
 */
export function canAddTeamToMatch(
  teamId: string,
  scheduledTime: Date,
  existingMatches: Match[]
): boolean {
  return !existingMatches.some(match => 
    match.scheduledTime.getTime() === scheduledTime.getTime() &&
    (match.homeTeamId === teamId || match.awayTeamId === teamId)
  );
}
