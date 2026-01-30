# Firebase Installation Guide for Tournament Champ

This guide walks you through setting up Firebase for the Tournament Champ project.

## Overview

Tournament Champ uses Firebase for:
- **Firestore Database**: Real-time storage for matches, teams, scores, and tournament data
- **Firebase Hosting**: Hosting for both Admin and Live web apps
- **Real-time Sync**: Instant updates across all connected devices

## Prerequisites

1. A Google account
2. Node.js and npm installed (v16 or higher recommended)
3. Firebase CLI installed: `npm install -g firebase-tools`

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `tournament-champ-live` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create Project"

## Step 2: Enable Firestore Database

1. In your Firebase project, click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location closest to your users
5. Click "Enable"

## Step 3: Register Web Apps

You need to register two web apps (Admin and Live):

### Register Admin App:
1. In Project Overview, click the web icon (</>) to add a web app
2. Name it: "Tournament Champ Admin"
3. Check "Also set up Firebase Hosting"
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need this

### Register Live App:
1. Repeat the process for a second web app
2. Name it: "Tournament Champ Live"
3. Check "Also set up Firebase Hosting"
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 4: Firebase Schema Design

The database will use these collections:

### Tournaments Collection
```
tournaments/{tournamentId}
  - name: string
  - sport: string (e.g., "Soccer", "Rugby")
  - status: string ("draft", "live", "completed")
  - createdAt: timestamp
  - publishedAt: timestamp
  - publicUrl: string
```

### Matches Collection (Critical for Week 1)
```
matches/{matchId}
  - tournamentId: string (ref to tournament)
  - homeTeam: string (ref to team)
  - awayTeam: string (ref to team)
  - pitch: string
  - scheduledTime: timestamp
  - sortOrder: number (IMPORTANT: enables push-back logic)
  - status: string ("scheduled", "inProgress", "completed", "walkover")
  - homeScore: number
  - awayScore: number
  - lastUpdated: timestamp
```

### Teams Collection
```
teams/{teamId}
  - tournamentId: string
  - name: string
  - points: number
  - goalsScored: number
  - goalsAgainst: number
  - goalDifference: number
  - played: number
  - won: number
  - drawn: number
  - lost: number
  - status: string ("active", "droppedOut")
```

### Indexes Required
```
Collection: matches
Fields: tournamentId (Ascending), sortOrder (Ascending)
Query Scope: Collection

Collection: matches
Fields: tournamentId (Ascending), scheduledTime (Ascending)
Query Scope: Collection

Collection: teams
Fields: tournamentId (Ascending), points (Descending)
Query Scope: Collection
```

## Step 5: Set Up Security Rules

In Firestore Database → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tournaments - read for all, write for authenticated admins
    match /tournaments/{tournamentId} {
      allow read: if true;
      allow write: if request.auth != null;
      
      // Matches within a tournament
      match /matches/{matchId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
      
      // Teams within a tournament
      match /teams/{teamId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
    
    // Top-level matches collection
    match /matches/{matchId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Top-level teams collection
    match /teams/{teamId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 6: Project Structure Setup

Create the monorepo structure:

```bash
mkdir -p apps/admin
mkdir -p apps/live
mkdir -p packages/shared
```

## Step 7: Install Firebase Dependencies

For each app (admin and live):

```bash
cd apps/admin
npm init -y
npm install firebase

cd ../live
npm init -y
npm install firebase

cd ../../packages/shared
npm init -y
```

## Step 8: Configure Firebase in Apps

Create `apps/admin/src/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

Repeat for `apps/live/src/firebase.js` with the Live app configuration.

## Step 9: Set Up Firebase Hosting

Initialize Firebase in the project root:

```bash
firebase login
firebase init hosting
```

Select:
- Use existing project (choose your Firebase project)
- Set public directory to `apps/admin/dist` for admin
- Configure as single-page app: Yes
- Set up automatic builds with GitHub: Yes (if desired)

Repeat for the Live app.

## Step 10: Deploy to Firebase

```bash
# Build your apps
cd apps/admin
npm run build

cd ../live
npm run build

# Deploy
cd ../..
firebase deploy
```

## Step 11: GitHub Actions Setup (Week 1 Deliverable)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: |
        cd apps/admin && npm install
        cd ../live && npm install
    
    - name: Build apps
      run: |
        cd apps/admin && npm run build
        cd ../live && npm run build
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: your-project-id
```

## Next Steps

After Firebase setup is complete:

1. **Implement the Logic Picker** (Task 2): UI to select sport type
2. **Build the Scoring Engine**: Soccer logic with points calculation
3. **Create the Active Grid**: Tournament scheduling interface
4. **Implement Live Mode Tools**: Push-back, pitch evacuator, dropout handler

## Key Features Enabled by Firebase

- **Real-time Updates**: Changes in Admin app instantly appear in Live views
- **sortOrder Field**: Critical for the "Global Push-Back" feature
- **Scalability**: Handle multiple tournaments simultaneously
- **Offline Support**: Firebase SDK provides offline persistence

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Check Firestore security rules
2. **Configuration Errors**: Verify Firebase config object is correct
3. **Deployment Fails**: Ensure Firebase CLI is logged in and project is selected
4. **Real-time Not Working**: Check that Firestore listeners are properly set up

## Security Considerations

- Keep Firebase config in environment variables for production
- Implement proper authentication before going live
- Review and tighten security rules based on your needs
- Set up Firebase App Check to prevent API abuse

## Cost Considerations

Firebase offers a generous free tier:
- **Firestore**: 50K reads, 20K writes, 20K deletes per day
- **Hosting**: 10 GB storage, 360 MB/day transfer

This should be sufficient for initial development and small tournaments.
