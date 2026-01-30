// Time manipulation utilities for push-back feature
// Critical for Week 1 "Global Push-Back" functionality

import { Match } from './types';

/**
 * Push back all matches by specified minutes
 * Uses sortOrder to ensure correct sequence
 */
export function pushBackMatches(
  matches: Match[],
  delayMinutes: number
): Match[] {
  return matches.map(match => ({
    ...match,
    scheduledTime: addMinutes(match.scheduledTime, delayMinutes),
    lastUpdated: new Date()
  }));
}

/**
 * Push back matches starting from a specific time
 */
export function pushBackMatchesFrom(
  matches: Match[],
  fromTime: Date,
  delayMinutes: number
): Match[] {
  return matches.map(match => {
    if (match.scheduledTime >= fromTime) {
      return {
        ...match,
        scheduledTime: addMinutes(match.scheduledTime, delayMinutes),
        lastUpdated: new Date()
      };
    }
    return match;
  });
}

/**
 * Evacuate all matches from one pitch to another
 * Maintains relative timing between matches
 */
export function evacuatePitch(
  matches: Match[],
  fromPitch: string,
  toPitch: string
): Match[] {
  return matches.map(match => {
    if (match.pitch === fromPitch && match.status === 'scheduled') {
      return {
        ...match,
        pitch: toPitch,
        lastUpdated: new Date()
      };
    }
    return match;
  });
}

/**
 * Format time for display (e.g., "14:30")
 * Uses manual formatting for consistency across locales
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format date for display (e.g., "Jan 30, 2026")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format full date and time (e.g., "Jan 30, 2026 at 14:30")
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Calculate match duration in minutes
 */
export function getMatchDuration(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Check if a time is between two dates
 */
export function isTimeBetween(time: Date, start: Date, end: Date): boolean {
  return time >= start && time <= end;
}

/**
 * Get next available time slot for a pitch
 */
export function getNextAvailableSlot(
  matches: Match[],
  pitch: string,
  duration: number = 60
): Date {
  const pitchMatches = matches
    .filter(m => m.pitch === pitch)
    .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  
  if (pitchMatches.length === 0) {
    return new Date(); // Now
  }
  
  const lastMatch = pitchMatches[pitchMatches.length - 1];
  return addMinutes(lastMatch.scheduledTime, duration);
}
