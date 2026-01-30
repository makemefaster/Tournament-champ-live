# Tournament Champ

Tournament Champ is a comprehensive tournament management system with real-time scoring, live standings, and powerful administrative tools.

## 📁 Project Structure

```
/tournament-champ
  ├── /apps
  │    ├── admin (Tournament Champ Admin - React/Vite)
  │    └── live  (Tournament Champ Live - React/Vite)
  ├── /packages
  │    └── engine (Shared Logic: Scoring, Time Cascade, Validations)
  ├── /firebase (Functions, Security Rules, Firestore Indexes)
  └── .github/workflows (Auto-deploy to Firebase Hosting)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Firebase CLI (for deployment)

### Installation

```bash
# Install all dependencies
npm install

# Build the shared engine
npm run build:engine
```

### Development

```bash
# Run Admin app in development mode
npm run dev:admin

# Run Live app in development mode
npm run dev:live
```

### Building

```bash
# Build all apps
npm run build:all

# Build individual apps
npm run build:admin
npm run build:live
npm run build:engine
```

## 📦 Packages

### Admin App (`apps/admin`)

The "Architect" web application for tournament organizers:
- 📋 Design tournament grid (Supercounties or Blank Canvas)
- ✅ Automatic validation for resource and team clashes
- 🚀 Publish tournament to live URL
- ⏰ Global push-back for schedule adjustments
- 🏟️ Pitch evacuator for emergency relocations
- 👋 Dropout handler for team withdrawals

**Features:**
- Sport logic picker (Soccer, Rugby, Custom)
- Visual tournament grid designer
- Real-time validation
- Live mode emergency tools

### Live App (`apps/live`)

Public-facing mobile-responsive scoreboard and umpire portal:
- 📱 Real-time standings and scores
- 🎯 Umpire portal for score updates
- 📊 Live match schedule
- 🏆 Current standings with tie-breaker logic

**Features:**
- Mobile-first responsive design
- Real-time Firebase sync
- Public tournament viewing
- Umpire score entry

### Engine Package (`packages/engine`)

Shared scoring logic and utilities:
- ⚽ Multi-sport scoring rules (Soccer, Rugby, Custom)
- 📊 Standings calculation with tie-breakers
- ✅ Schedule validation (resource/team clash detection)
- ⏰ Time cascade operations
- 👋 Team dropout handling

**Exports:**
- `getScoringRules(sportType)` - Get rules for a sport
- `calculateStandings(teams, matches, rules)` - Calculate standings
- `validateSchedule(matches)` - Validate for conflicts
- `applyTimeCascade(matches, options)` - Push back schedule
- `handleTeamDropout(matches, teamId, walkoverScore)` - Handle withdrawals

## 🔥 Firebase

### Firestore Schema

**Collections:**
- `tournaments/{tournamentId}` - Tournament metadata
  - `matches` - Match details with sortOrder for push-back
  - `teams` - Team information
  - `standings` - Calculated standings (auto-updated via Cloud Functions)

**Key Fields:**
- `matches.sortOrder` - Enables global push-back functionality
- `matches.scheduledTime` - For time cascade operations
- `matches.status` - scheduled | in-progress | completed | cancelled

### Security Rules

- Public read access for published tournaments
- Admin-only write access for tournament management
- Cloud Functions can write to standings collection

### Cloud Functions

- `updateStandings` - Auto-recalculates standings on match updates
- `validateTournament` - Validates schedule for conflicts

## 🔄 CI/CD

GitHub Actions automatically deploy on push to `main`:

1. **Build Pipeline** (`ci.yml`)
   - Lint all code
   - Run tests
   - Build all apps

2. **Firebase Hosting Deploy** (`firebase-hosting-deploy.yml`)
   - Deploys Admin app to `tournament-champ-admin` site
   - Deploys Live app to `tournament-champ-live` site
   - Creates preview deployments for PRs

3. **Firebase Functions Deploy** (`firebase-functions-deploy.yml`)
   - Deploys Cloud Functions
   - Updates Firestore rules and indexes

### Required Secrets

Set these in GitHub repository settings:
- `FIREBASE_SERVICE_ACCOUNT` - Service account JSON
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_TOKEN` - Firebase deployment token

## 🏉 Sports Supported

### Soccer (FIFA Standard)
- Win: 3 points
- Draw: 1 point
- Loss: 0 points
- Walkover: 3-0

**Tie-breakers:**
1. Points
2. Goal Difference
3. Goals Scored
4. Head-to-Head

### Rugby
- Win: 4 points
- Draw: 2 points
- Loss: 0 points
- Walkover: 28-0

### Custom
- Configurable rules
- Custom walkover scores

## 🛠️ Development

### Monorepo Structure

This project uses npm workspaces for monorepo management:
- Shared dependencies at root
- Workspace-specific dependencies in each package
- Cross-package imports via `@tournament-champ/engine`

### TypeScript

All apps and packages use TypeScript for type safety:
- Strict mode enabled
- Shared types from engine package
- Build-time type checking

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ using React, Vite, Firebase, and TypeScript

