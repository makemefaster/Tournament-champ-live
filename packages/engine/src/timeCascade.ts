import { Match, TimeCascadeOptions } from './types';

/**
 * Apply time cascade to matches (push back schedule)
 */
export function applyTimeCascade(
  matches: Match[],
  options: TimeCascadeOptions
): Match[] {
  const { delayMinutes, affectAllMatches = true, startFromSortOrder = 0 } = options;
  const delayMs = delayMinutes * 60 * 1000;

  return matches.map(match => {
    // Only update matches that haven't been completed
    if (match.status === 'completed') {
      return match;
    }

    // Apply delay based on options
    const shouldUpdate = affectAllMatches || match.sortOrder >= startFromSortOrder;
    
    if (shouldUpdate) {
      return {
        ...match,
        scheduledTime: new Date(match.scheduledTime.getTime() + delayMs)
      };
    }

    return match;
  });
}

/**
 * Move all matches from one pitch to another
 */
export function movePitchMatches(
  matches: Match[],
  fromPitchId: string,
  toPitchId: string
): Match[] {
  return matches.map(match => {
    if (match.pitchId === fromPitchId && match.status !== 'completed') {
      return {
        ...match,
        pitchId: toPitchId
      };
    }
    return match;
  });
}

/**
 * Handle team dropout - convert remaining matches to walkovers
 */
export function handleTeamDropout(
  matches: Match[],
  droppedTeamId: string,
  walkoverScore: { home: number; away: number }
): Match[] {
  return matches.map(match => {
    // Only affect scheduled or in-progress matches
    if (match.status === 'completed' || match.status === 'cancelled') {
      return match;
    }

    const isHome = match.homeTeamId === droppedTeamId;
    const isAway = match.awayTeamId === droppedTeamId;

    if (isHome || isAway) {
      return {
        ...match,
        status: 'completed',
        isWalkover: true,
        homeScore: isHome ? walkoverScore.away : walkoverScore.home,
        awayScore: isAway ? walkoverScore.home : walkoverScore.away
      };
    }

    return match;
  });
}
