# Firebase Schema Reference

This document provides a detailed reference of the Tournament Champ Firebase database schema.

## Collections Overview

```
firestore/
├── tournaments/          (Tournament metadata)
├── matches/             (Match schedule with sortOrder)
├── teams/               (Team standings and stats)
└── config/              (Sport rules and templates)
```

## Collection: `tournaments`

Stores tournament-level information.

### Document Structure

```typescript
{
  id: "tournament-123",
  name: "Summer Soccer Championship 2026",
  sport: "Soccer",                    // "Soccer", "Rugby", "Custom"
  status: "live",                     // "draft", "live", "completed"
  createdAt: Timestamp,
  publishedAt: Timestamp,
  publicUrl: "https://app.com/live/tournament-123",
  settings: {
    enablePushBack: true,
    enablePitchEvacuator: true,
    enableDropoutHandler: true
  }
}
```

### Indexes
- None required (small collection size)

### Security Rules
- Read: Public for live/completed, authenticated for drafts
- Write: Authenticated admins only

---

## Collection: `matches`

Stores all match information. **Critical for Week 1 push-back feature**.

### Document Structure

```typescript
{
  id: "match-456",
  tournamentId: "tournament-123",
  homeTeam: "team-001",              // Reference to teams collection
  awayTeam: "team-002",
  pitch: "Pitch 1",
  scheduledTime: Timestamp,
  sortOrder: 100,                    // ⚡ CRITICAL: Enables push-back logic
  status: "scheduled",               // "scheduled", "inProgress", "completed", "walkover", "cancelled"
  homeScore: 0,
  awayScore: 0,
  lastUpdated: Timestamp,
  walkoverWinner: null,              // Team ID if walkover
  notes: ""
}
```

### The `sortOrder` Field

The `sortOrder` field is **essential** for the Global Push-Back feature:

- **Purpose**: Maintains relative order of matches regardless of actual times
- **Values**: Numeric (e.g., 100, 200, 300, ...)
- **Usage**: When pushing back schedule, we query by sortOrder and update scheduledTime
- **Why needed**: Allows batch time updates without losing match sequence

Example push-back query:
```javascript
const q = query(
  collection(db, 'matches'),
  where('tournamentId', '==', tournamentId),
  where('status', 'in', ['scheduled', 'inProgress']),
  orderBy('sortOrder')
);
```

### Indexes Required

1. **Tournament + Sort Order** (for push-back)
   ```
   Collection: matches
   Fields: tournamentId (ASC), sortOrder (ASC)
   ```

2. **Tournament + Scheduled Time** (for display)
   ```
   Collection: matches
   Fields: tournamentId (ASC), scheduledTime (ASC)
   ```

3. **Tournament + Pitch + Time** (for conflict detection)
   ```
   Collection: matches
   Fields: tournamentId (ASC), pitch (ASC), scheduledTime (ASC)
   ```

### Security Rules
- Read: Public (all users)
- Write: Authenticated admins only
- Validation: Ensures sortOrder is always a number

---

## Collection: `teams`

Stores team standings and statistics.

### Document Structure

```typescript
{
  id: "team-001",
  tournamentId: "tournament-123",
  name: "Hurricanes",
  points: 9,                         // 3 per win, 1 per draw
  goalsScored: 8,
  goalsAgainst: 2,
  goalDifference: 6,                 // goalsScored - goalsAgainst
  played: 3,
  won: 3,
  drawn: 0,
  lost: 0,
  status: "active",                  // "active", "droppedOut"
  droppedOutAt: null                 // Timestamp if dropped out
}
```

### Indexes Required

1. **Tournament Standings** (for leaderboard)
   ```
   Collection: teams
   Fields: tournamentId (ASC), points (DESC), goalDifference (DESC)
   ```

2. **Tournament + Status** (for filtering active teams)
   ```
   Collection: teams
   Fields: tournamentId (ASC), status (ASC)
   ```

### Security Rules
- Read: Public (all users)
- Write: Authenticated admins only
- Validation: Ensures all numeric fields are present on creation

---

## Collection: `config` (Optional)

Stores sport configurations and templates.

### Document Structure

```typescript
{
  id: "soccer-rules",
  sport: "Soccer",
  winPoints: 3,
  drawPoints: 1,
  lossPoints: 0,
  walkoverScore: { home: 3, away: 0 },
  tieBreakers: ["goalDifference", "goalsScored", "headToHead"]
}
```

---

## Data Flow Examples

### Example 1: Creating a Tournament

```javascript
// 1. Create tournament
const tournamentRef = await addDoc(collection(db, 'tournaments'), {
  name: "Summer Soccer Championship",
  sport: "Soccer",
  status: "draft",
  createdAt: new Date(),
  settings: { enablePushBack: true, enablePitchEvacuator: true, enableDropoutHandler: true }
});

// 2. Add teams
const team1Ref = await addDoc(collection(db, 'teams'), {
  tournamentId: tournamentRef.id,
  name: "Hurricanes",
  points: 0, played: 0, won: 0, drawn: 0, lost: 0,
  goalsScored: 0, goalsAgainst: 0, goalDifference: 0,
  status: "active"
});

// 3. Schedule matches
await addDoc(collection(db, 'matches'), {
  tournamentId: tournamentRef.id,
  homeTeam: team1Ref.id,
  awayTeam: team2Ref.id,
  pitch: "Pitch 1",
  scheduledTime: new Date("2026-06-01T10:00:00"),
  sortOrder: 100,
  status: "scheduled",
  homeScore: 0,
  awayScore: 0,
  lastUpdated: new Date()
});
```

### Example 2: Global Push-Back (15 minutes)

```javascript
// Query matches by sortOrder
const q = query(
  collection(db, 'matches'),
  where('tournamentId', '==', tournamentId),
  where('status', 'in', ['scheduled', 'inProgress']),
  orderBy('sortOrder')
);

const snapshot = await getDocs(q);
const batch = writeBatch(db);

snapshot.forEach(doc => {
  const match = doc.data();
  const newTime = new Date(match.scheduledTime.toDate());
  newTime.setMinutes(newTime.getMinutes() + 15);
  
  batch.update(doc.ref, {
    scheduledTime: newTime,
    lastUpdated: new Date()
  });
});

await batch.commit();
```

### Example 3: Pitch Evacuator

```javascript
// Move all matches from Pitch 1 to Pitch 2
const q = query(
  collection(db, 'matches'),
  where('tournamentId', '==', tournamentId),
  where('pitch', '==', 'Pitch 1'),
  where('status', '==', 'scheduled')
);

const snapshot = await getDocs(q);
const batch = writeBatch(db);

snapshot.forEach(doc => {
  batch.update(doc.ref, {
    pitch: 'Pitch 2',
    lastUpdated: new Date()
  });
});

await batch.commit();
```

### Example 4: Recording Match Result

```javascript
// Update match
await updateDoc(doc(db, 'matches', matchId), {
  homeScore: 3,
  awayScore: 1,
  status: 'completed',
  lastUpdated: new Date()
});

// Update home team standings
const homeTeamRef = doc(db, 'teams', homeTeamId);
const homeTeam = await getDoc(homeTeamRef);
const homeData = homeTeam.data();

await updateDoc(homeTeamRef, {
  points: homeData.points + 3,         // Win = 3 points
  played: homeData.played + 1,
  won: homeData.won + 1,
  goalsScored: homeData.goalsScored + 3,
  goalsAgainst: homeData.goalsAgainst + 1,
  goalDifference: homeData.goalDifference + 2
});

// Update away team standings
// ... (similar logic for away team with 0 points)
```

### Example 5: Team Dropout with Walkover

```javascript
// 1. Mark team as dropped out
await updateDoc(doc(db, 'teams', droppedTeamId), {
  status: 'droppedOut',
  droppedOutAt: new Date()
});

// 2. Find remaining matches with this team
const q = query(
  collection(db, 'matches'),
  where('tournamentId', '==', tournamentId),
  where('status', '==', 'scheduled')
);

const snapshot = await getDocs(q);
const batch = writeBatch(db);

snapshot.forEach(doc => {
  const match = doc.data();
  if (match.homeTeam === droppedTeamId || match.awayTeam === droppedTeamId) {
    const winnerId = match.homeTeam === droppedTeamId ? match.awayTeam : match.homeTeam;
    
    batch.update(doc.ref, {
      status: 'walkover',
      walkoverWinner: winnerId,
      homeScore: match.homeTeam === droppedTeamId ? 0 : 3,
      awayScore: match.awayTeam === droppedTeamId ? 0 : 3,
      lastUpdated: new Date()
    });
  }
});

await batch.commit();
```

---

## Real-time Listeners

For the Live app to show instant updates:

```javascript
// Listen to all matches in a tournament
const unsubscribe = onSnapshot(
  query(
    collection(db, 'matches'),
    where('tournamentId', '==', tournamentId),
    orderBy('scheduledTime')
  ),
  (snapshot) => {
    const matches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    updateUI(matches);
  }
);

// Listen to team standings
const unsubscribeTeams = onSnapshot(
  query(
    collection(db, 'teams'),
    where('tournamentId', '==', tournamentId),
    orderBy('points', 'desc'),
    orderBy('goalDifference', 'desc')
  ),
  (snapshot) => {
    const teams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    updateStandings(teams);
  }
);
```

---

## Migration Notes

### Version 1.0 → 1.1 (Future)

If you need to add fields later:

```javascript
// Add new field to existing documents
const matchesRef = collection(db, 'matches');
const snapshot = await getDocs(matchesRef);

const batch = writeBatch(db);
snapshot.forEach(doc => {
  batch.update(doc.ref, {
    newField: defaultValue
  });
});

await batch.commit();
```

### Backup Strategy

```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/backup-2026-01-30

# Import Firestore data
gcloud firestore import gs://your-bucket/backup-2026-01-30
```

---

## Performance Considerations

- **Batch Writes**: Use for push-back (updates many documents)
- **Indexes**: Required for all compound queries
- **Real-time Listeners**: Unsubscribe when component unmounts
- **Pagination**: For tournaments with 100+ matches, use pagination

---

## Testing with Emulators

```bash
# Start emulators
firebase emulators:start

# Connect from app
import { connectFirestoreEmulator } from 'firebase/firestore';
connectFirestoreEmulator(db, 'localhost', 8080);
```

Emulator UI: http://localhost:4000
