# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- A code editor (VS Code recommended)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/makemefaster/Tournament-champ-live.git
cd Tournament-champ-live

# Install dependencies
npm install

# Build the shared engine package
npm run build:engine
```

### Development Workflow

#### Running Apps Locally

```bash
# Run Admin app (default: http://localhost:5173)
npm run dev:admin

# Run Live app (default: http://localhost:5174)
npm run dev:live

# Run both apps simultaneously (in separate terminals)
npm run dev:admin & npm run dev:live
```

#### Building

```bash
# Build all packages and apps
npm run build:all

# Build individual components
npm run build:engine   # Build shared engine
npm run build:admin    # Build admin app
npm run build:live     # Build live app
```

#### Linting

```bash
# Lint all packages
npm run lint

# Lint individual packages
npm run lint --workspace=apps/admin
npm run lint --workspace=apps/live
npm run lint --workspace=packages/engine
```

#### Testing

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=packages/engine
```

## Project Structure

```
/tournament-champ
├── apps/
│   ├── admin/          # Admin web app (React + Vite)
│   │   ├── src/
│   │   │   ├── App.tsx         # Main app component
│   │   │   ├── App.css         # App styles
│   │   │   └── main.tsx        # Entry point
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── live/           # Live web app (React + Vite)
│       ├── src/
│       │   ├── App.tsx
│       │   ├── App.css
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
│
├── packages/
│   └── engine/         # Shared logic package
│       ├── src/
│       │   ├── types.ts        # TypeScript types
│       │   ├── scoring.ts      # Scoring rules
│       │   ├── standings.ts    # Standings calculation
│       │   ├── validation.ts   # Schedule validation
│       │   ├── timeCascade.ts  # Time operations
│       │   └── index.ts        # Public API
│       ├── package.json
│       └── tsconfig.json
│
├── firebase/
│   ├── functions/      # Cloud Functions
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── firestore.rules         # Security rules
│   └── firestore.indexes.json  # Database indexes
│
├── .github/
│   └── workflows/      # GitHub Actions
│       ├── firebase-hosting-deploy.yml
│       ├── firebase-functions-deploy.yml
│       └── ci.yml
│
├── package.json        # Root package (workspaces)
├── firebase.json       # Firebase configuration
└── README.md
```

## Architecture

### Monorepo with npm Workspaces

This project uses npm workspaces to manage multiple packages:
- Shared dependencies at root level
- Package-specific dependencies in each workspace
- Cross-package imports work seamlessly

### Package Dependencies

```
apps/admin  ─┐
             ├─> packages/engine
apps/live   ─┘
```

Both apps depend on the shared `@tournament-champ/engine` package.

### TypeScript Configuration

Each package has its own `tsconfig.json`:
- `packages/engine`: Compiles to ES2020 modules
- `apps/admin`: Vite + React with JSX support
- `apps/live`: Vite + React with JSX support

## Engine Package API

### Types

```typescript
import { Team, Match, Standing, SportType } from '@tournament-champ/engine';

// SportType: 'soccer' | 'rugby' | 'custom'
```

### Scoring Rules

```typescript
import { getScoringRules } from '@tournament-champ/engine';

const rules = getScoringRules('soccer');
// { winPoints: 3, drawPoints: 1, lossPoints: 0, walkoverScore: { home: 3, away: 0 } }
```

### Standings Calculation

```typescript
import { calculateStandings } from '@tournament-champ/engine';

const standings = calculateStandings(teams, matches, rules);
// Returns sorted array of standings with tie-breakers applied
```

### Schedule Validation

```typescript
import { validateSchedule } from '@tournament-champ/engine';

const result = validateSchedule(matches);
// { isValid: boolean, errors: ValidationError[] }
```

### Time Cascade

```typescript
import { applyTimeCascade } from '@tournament-champ/engine';

const updatedMatches = applyTimeCascade(matches, {
  delayMinutes: 30,
  affectAllMatches: true
});
```

### Team Dropout

```typescript
import { handleTeamDropout } from '@tournament-champ/engine';

const updatedMatches = handleTeamDropout(
  matches,
  'team-id',
  { home: 3, away: 0 }
);
```

## Styling

Both apps use vanilla CSS with CSS variables:
- Dark mode by default
- Responsive design (mobile-first)
- Consistent color scheme across apps

### Admin App Theme
- Primary color: `#646cff` (blue)
- Accent: `#747bff` (light blue)

### Live App Theme
- Primary color: `#10b981` (green)
- Accent: `#34d399` (light green)

## Firebase Integration

### Firestore Collections

```
tournaments/
  {tournamentId}/
    - isPublished: boolean
    - sportType: string
    - createdAt: timestamp
    
    matches/
      {matchId}/
        - homeTeamId: string
        - awayTeamId: string
        - homeScore: number
        - awayScore: number
        - scheduledTime: timestamp
        - sortOrder: number
        - status: string
        - pitchId: string
    
    teams/
      {teamId}/
        - name: string
        - droppedOut: boolean
    
    standings/
      {teamId}/
        - teamName: string
        - points: number
        - goalDifference: number
        - (auto-generated by Cloud Function)
```

### Security Model

- **Public**: Read access to published tournaments
- **Admin**: Full access to all tournaments
- **Functions**: Write access to standings

## Adding New Features

### 1. Add Shared Logic

If the feature requires logic shared between apps:
1. Add types to `packages/engine/src/types.ts`
2. Implement logic in `packages/engine/src/`
3. Export from `packages/engine/src/index.ts`
4. Rebuild: `npm run build:engine`

### 2. Add UI to Admin App

1. Create new component in `apps/admin/src/`
2. Import engine functions as needed
3. Test locally: `npm run dev:admin`
4. Build: `npm run build:admin`

### 3. Add UI to Live App

1. Create new component in `apps/live/src/`
2. Import engine functions as needed
3. Test locally: `npm run dev:live`
4. Build: `npm run build:live`

### 4. Add Cloud Function

1. Add function to `firebase/functions/src/index.ts`
2. Update Firestore rules if needed
3. Deploy: `firebase deploy --only functions`

## Common Tasks

### Add a New Sport

1. Update `SportType` in `packages/engine/src/types.ts`
2. Add case in `getScoringRules()` in `packages/engine/src/scoring.ts`
3. Update UI to show new option in admin app
4. Rebuild engine and apps

### Add a New Admin Feature

1. Add UI component in `apps/admin/src/`
2. Add necessary functions to engine package
3. Update Firebase security rules if needed
4. Add Cloud Function if server-side logic needed

### Update Firestore Schema

1. Update types in `packages/engine/src/types.ts`
2. Update security rules in `firebase/firestore.rules`
3. Add indexes in `firebase/firestore.indexes.json`
4. Deploy: `firebase deploy --only firestore`

## Debugging

### Local Development

```bash
# Check build errors
npm run build:all

# Check TypeScript errors
npx tsc --noEmit

# View Vite logs
npm run dev:admin  # Check console output
```

### Firebase Debugging

```bash
# Test security rules locally
firebase emulators:start --only firestore

# Check function logs
firebase functions:log --only functionName

# Test functions locally
firebase emulators:start --only functions
```

## Best Practices

1. **Always rebuild engine after changes**: `npm run build:engine`
2. **Use TypeScript strict mode**: Catch errors early
3. **Import from engine package**: Don't duplicate logic
4. **Write minimal code**: Reuse existing components
5. **Test locally**: Before committing, ensure apps build
6. **Follow conventions**: Match existing code style

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
