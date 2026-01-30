import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Cloud Function to recalculate standings when a match is updated
 */
export const updateStandings = functions.firestore
  .document("tournaments/{tournamentId}/matches/{matchId}")
  .onWrite(async (change, context) => {
    const tournamentId = context.params.tournamentId;
    const db = admin.firestore();

    // Get all matches for this tournament
    const matchesSnapshot = await db
      .collection("tournaments")
      .doc(tournamentId)
      .collection("matches")
      .where("status", "==", "completed")
      .get();

    // Get all teams for this tournament
    const teamsSnapshot = await db
      .collection("tournaments")
      .doc(tournamentId)
      .collection("teams")
      .get();

    // Calculate standings
    const standings = new Map<string, any>();

    // Initialize standings for all teams
    teamsSnapshot.forEach((teamDoc) => {
      const team = teamDoc.data();
      standings.set(teamDoc.id, {
        teamId: teamDoc.id,
        teamName: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    });

    // Process completed matches
    matchesSnapshot.forEach((matchDoc) => {
      const match = matchDoc.data();
      const homeStanding = standings.get(match.homeTeamId);
      const awayStanding = standings.get(match.awayTeamId);

      if (!homeStanding || !awayStanding) return;

      const homeScore = match.homeScore || 0;
      const awayScore = match.awayScore || 0;

      // Update home team
      homeStanding.played++;
      homeStanding.goalsFor += homeScore;
      homeStanding.goalsAgainst += awayScore;
      homeStanding.goalDifference =
        homeStanding.goalsFor - homeStanding.goalsAgainst;

      // Update away team
      awayStanding.played++;
      awayStanding.goalsFor += awayScore;
      awayStanding.goalsAgainst += homeScore;
      awayStanding.goalDifference =
        awayStanding.goalsFor - awayStanding.goalsAgainst;

      // Update results (using soccer rules by default)
      const winPoints = 3;
      const drawPoints = 1;

      if (homeScore > awayScore) {
        homeStanding.won++;
        awayStanding.lost++;
        homeStanding.points += winPoints;
      } else if (homeScore < awayScore) {
        homeStanding.lost++;
        awayStanding.won++;
        awayStanding.points += winPoints;
      } else {
        homeStanding.drawn++;
        awayStanding.drawn++;
        homeStanding.points += drawPoints;
        awayStanding.points += drawPoints;
      }
    });

    // Write standings back to Firestore
    const batch = db.batch();
    const standingsRef = db
      .collection("tournaments")
      .doc(tournamentId)
      .collection("standings");

    standings.forEach((standing, teamId) => {
      batch.set(standingsRef.doc(teamId), standing);
    });

    await batch.commit();
    functions.logger.info(
      `Updated standings for tournament ${tournamentId}`
    );
  });

/**
 * HTTP function to validate tournament schedule
 */
export const validateTournament = functions.https.onCall(
  async (data, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const tournamentId = data.tournamentId;
    const db = admin.firestore();

    // Get all matches
    const matchesSnapshot = await db
      .collection("tournaments")
      .doc(tournamentId)
      .collection("matches")
      .get();

    const matches = matchesSnapshot.docs.map((doc) => doc.data());
    const errors: any[] = [];

    // Check for resource clashes
    const pitchTimeMap = new Map<string, string[]>();

    matches.forEach((match: any) => {
      const key = `${match.pitchId}-${match.scheduledTime.toMillis()}`;
      const existing = pitchTimeMap.get(key) || [];
      existing.push(match.id);
      pitchTimeMap.set(key, existing);
    });

    pitchTimeMap.forEach((matchIds, key) => {
      if (matchIds.length > 1) {
        const [pitchId] = key.split("-");
        errors.push({
          type: "resource-clash",
          message: `Pitch ${pitchId} has multiple matches scheduled`,
          matchIds,
        });
      }
    });

    // Check for team clashes
    const teamTimeMap = new Map<string, string[]>();

    matches.forEach((match: any) => {
      const time = match.scheduledTime.toMillis();
      const homeKey = `${match.homeTeamId}-${time}`;
      const awayKey = `${match.awayTeamId}-${time}`;

      const homeMatches = teamTimeMap.get(homeKey) || [];
      homeMatches.push(match.id);
      teamTimeMap.set(homeKey, homeMatches);

      const awayMatches = teamTimeMap.get(awayKey) || [];
      awayMatches.push(match.id);
      teamTimeMap.set(awayKey, awayMatches);
    });

    teamTimeMap.forEach((matchIds, key) => {
      if (matchIds.length > 1) {
        const [teamId] = key.split("-");
        errors.push({
          type: "team-clash",
          message: `Team ${teamId} has multiple matches scheduled`,
          matchIds,
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
);
