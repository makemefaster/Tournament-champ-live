// Conflict detection utilities for tournament validation
// Checks for resource clashes (pitch booking conflicts) and team clashes

import { Match, ResourceConflict, ValidationResult } from './types';
import { isTimeBetween } from './time-utils';

/**
 * Check for pitch booking conflicts
 * Two matches can't use the same pitch at overlapping times
 */
export function detectPitchConflicts(
  matches: Match[],
  matchDuration: number = 60 // minutes
): ResourceConflict[] {
  const conflicts: ResourceConflict[] = [];
  
  for (let i = 0; i < matches.length; i++) {
    for (let j = i + 1; j < matches.length; j++) {
      const match1 = matches[i];
      const match2 = matches[j];
      
      // Skip if different pitches
      if (match1.pitch !== match2.pitch) continue;
      
      // Calculate end times
      const match1End = new Date(match1.scheduledTime);
      match1End.setMinutes(match1End.getMinutes() + matchDuration);
      
      const match2End = new Date(match2.scheduledTime);
      match2End.setMinutes(match2End.getMinutes() + matchDuration);
      
      // Check for overlap: matches overlap if one starts before the other ends
      const hasOverlap = 
        (match1.scheduledTime < match2End && match1End > match2.scheduledTime);
      
      if (hasOverlap) {
        conflicts.push({
          type: 'pitch',
          conflictingMatches: [match1.id, match2.id],
          description: `${match1.pitch} is double-booked at ${match1.scheduledTime.toLocaleTimeString()}`
        });
      }
    }
  }
  
  return conflicts;
}

/**
 * Check for team scheduling conflicts
 * A team can't play two matches at the same time
 */
export function detectTeamConflicts(
  matches: Match[],
  matchDuration: number = 60 // minutes
): ResourceConflict[] {
  const conflicts: ResourceConflict[] = [];
  
  for (let i = 0; i < matches.length; i++) {
    for (let j = i + 1; j < matches.length; j++) {
      const match1 = matches[i];
      const match2 = matches[j];
      
      // Check if any team is in both matches
      const teamsInMatch1 = [match1.homeTeam, match1.awayTeam];
      const teamsInMatch2 = [match2.homeTeam, match2.awayTeam];
      const commonTeams = teamsInMatch1.filter(t => teamsInMatch2.includes(t));
      
      if (commonTeams.length === 0) continue;
      
      // Calculate end times
      const match1End = new Date(match1.scheduledTime);
      match1End.setMinutes(match1End.getMinutes() + matchDuration);
      
      const match2End = new Date(match2.scheduledTime);
      match2End.setMinutes(match2End.getMinutes() + matchDuration);
      
      // Check for overlap: matches overlap if one starts before the other ends
      const hasOverlap = 
        (match1.scheduledTime < match2End && match1End > match2.scheduledTime);
      
      if (hasOverlap) {
        conflicts.push({
          type: 'team',
          conflictingMatches: [match1.id, match2.id],
          description: `Team ${commonTeams[0]} is scheduled for multiple matches at ${match1.scheduledTime.toLocaleTimeString()}`
        });
      }
    }
  }
  
  return conflicts;
}

/**
 * Validate entire tournament schedule
 * Returns all conflicts found
 */
export function validateTournamentSchedule(
  matches: Match[],
  matchDuration: number = 60
): ValidationResult {
  const scheduledMatches = matches.filter(m => m.status !== 'cancelled');
  
  const pitchConflicts = detectPitchConflicts(scheduledMatches, matchDuration);
  const teamConflicts = detectTeamConflicts(scheduledMatches, matchDuration);
  
  const allConflicts = [...pitchConflicts, ...teamConflicts];
  
  return {
    isValid: allConflicts.length === 0,
    conflicts: allConflicts
  };
}

/**
 * Check if a tournament can go live
 * Ensures no conflicts exist before publishing
 */
export function canGoLive(matches: Match[]): { canGoLive: boolean; reason?: string } {
  const validation = validateTournamentSchedule(matches);
  
  if (!validation.isValid) {
    return {
      canGoLive: false,
      reason: `Found ${validation.conflicts.length} conflict(s). Please resolve them before going live.`
    };
  }
  
  if (matches.length === 0) {
    return {
      canGoLive: false,
      reason: 'No matches scheduled. Please add matches before going live.'
    };
  }
  
  return { canGoLive: true };
}
