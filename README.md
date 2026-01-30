# Tournament-champ-live

A real-time tournament management system with live scoring and administrative tools.

## 🚀 Quick Start

- **New to the project?** Start with [QUICKSTART.md](./QUICKSTART.md)
- **Setting up Firebase?** Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 📁 Project Structure

```
/apps/admin          - Tournament Champ Admin (Architect web app)
/apps/live           - Tournament Champ Live (Public scoreboard & umpire portal)
/packages/shared     - Shared logic (scoring, validation, time utilities)
```

## ✅ Week 1 Status

- [x] **Task 1**: Firebase Schema implemented with `sortOrder` for push-back logic
- [x] Firestore security rules configured
- [x] Database indexes defined
- [x] Monorepo structure created
- [x] Shared logic package with TypeScript types
- [ ] **Task 2**: Logic Picker UI (Soccer/Rugby/Custom)
- [ ] **Task 3**: GitHub Actions deployment pipeline (configured, needs testing)

---

## Tournament Champ: Project Specification (V1)
​1. Project Structure (The GitHub Monorepo)
​We will use a shared logic folder to ensure both apps calculate standings identically.
​/apps/admin (Tournament Champ Admin): The "Architect" web app.
​/apps/live (Tournament Champ Live): The public-facing mobile-responsive scoreboard and umpire portal.
​/packages/shared: Common code (Scoring Logic, Time Formatters, Conflict Checkers).
​2. The Scoring Engine (Initial Test Case: Soccer)
​We will build the system to be "Plug-and-Play." The first logic module will be Soccer (FIFA Standard):
​Points: Win = 3, Draw = 1, Loss = 0.
​Walkover Logic: If a team drops out, the Admin can trigger a "Walkover" which awards a 3-0 win to the opponent.
​Tie-Breakers: 1. Goal Difference, 2. Goals Scored, 3. Head-to-Head result.
​3. The "Active Grid" Journey
​Drafting: The user chooses the "Supercounties Template" or "Blank Canvas."
​Validation: The app runs a background check for Resource Clashes (e.g., Pitch 1 is booked for two games at 10:00) and Team Clashes (e.g., Hurricanes are scheduled on Pitch 1 and Pitch 4 simultaneously).
​Publishing: Once the grid is valid, the Admin hits "Go Live," creating the public URL.
​4. "Live Mode" Emergency Tools
​Once the tournament is "Live," the Admin panel unlocks high-priority tools:
​The Global Push-Back: A slider that moves the entire remaining schedule by X minutes (updates all user views instantly).
​The Pitch Evacuator: Drag all remaining matches from one pitch to another if a surface becomes unplayable.
​The Dropout Handler: Removes a team and converts their remaining matches into "Byes" or "Walkovers" without shifting the time slots (keeping the rest of the schedule intact).
​Week 1 Deliverables (The Skeleton)
​To get the GitHub repo and Firebase connection live, we will focus on these three coding tasks:
​Task 1: The Firebase Schema. Setting up the "Matches" collection so it supports sortOrder for the push-back logic. ✅ **COMPLETED**
​Task 2: The Logic Picker. A simple UI where you select "Soccer," "Rugby," or "Custom."
​Task 3: The Deployment Pipeline. Setting up GitHub Actions so every time you "Commit," the Admin and Live apps update their respective URLs.

## 📚 Documentation

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Complete Firebase installation guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start for developers
- **[firestore.rules](./firestore.rules)** - Database security rules
- **[firestore.indexes.json](./firestore.indexes.json)** - Database indexes
- **[packages/shared/types.ts](./packages/shared/types.ts)** - TypeScript type definitions

## 🛠️ Key Features Implemented

### Firebase Schema (Week 1 - Task 1) ✅
- **Matches Collection**: Includes `sortOrder` field for push-back functionality
- **Teams Collection**: Full standings tracking (points, goal difference, etc.)
- **Tournaments Collection**: Tournament lifecycle management
- **Security Rules**: Read access for all, write for authenticated admins
- **Indexes**: Optimized queries for sorting by time and standings

### Shared Logic Package ✅
- **Scoring Engine**: Soccer rules (Win=3, Draw=1, Loss=0)
- **Walkover Logic**: Automatic 3-0 award
- **Tie-breakers**: Goal difference → Goals scored → Head-to-head
- **Push-back Utilities**: Global time adjustment functions
- **Conflict Detection**: Pitch and team clash validation
- **Time Formatters**: Consistent time/date display

## 🚧 Next Steps

1. **Implement Logic Picker UI** (Task 2)
2. **Test deployment pipeline** (Task 3)
3. **Build Active Grid interface**
4. **Implement Live Mode tools** (Push-back slider, Pitch Evacuator, Dropout Handler)
