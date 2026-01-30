# Quick Start Guide

This guide helps you get started with Tournament Champ development quickly.

## Prerequisites

- Node.js 16+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- Git installed

## Step-by-Step Setup

### 1. Firebase Project Setup (5 minutes)

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database (Start in test mode)
3. Register two web apps: "Tournament Champ Admin" and "Tournament Champ Live"
4. Copy the configuration objects for both apps

### 2. Configure Local Environment (2 minutes)

```bash
# Navigate to the project
cd Tournament-champ-live

# Copy and configure Admin app
cd apps/admin
cp firebase-config.template.js firebase-config.js
# Edit firebase-config.js with your Admin app credentials

# Copy and configure Live app
cd ../live
cp firebase-config.template.js firebase-config.js
# Edit firebase-config.js with your Live app credentials

cd ../..
```

### 3. Install Dependencies (3 minutes)

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Select your Firebase project
firebase use --add
# Select your project and give it an alias (e.g., "default")

# Install app dependencies
cd apps/admin && npm install
cd ../live && npm install
cd ../..
```

### 4. Deploy Firebase Schema (2 minutes)

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore
```

This deploys:
- Security rules from `firestore.rules`
- Database indexes from `firestore.indexes.json`

### 5. Test Local Development (Optional)

```bash
# Start Firebase Emulators
firebase emulators:start

# In another terminal, start your development servers
cd apps/admin && npm run dev  # (once you set up your dev server)
```

The emulators provide:
- Firestore UI: http://localhost:4000
- Firestore Emulator: localhost:8080
- Hosting Emulator: localhost:5000 (admin), localhost:5001 (live)

### 6. Set Up GitHub Actions (5 minutes)

1. Go to your GitHub repository settings
2. Navigate to Secrets and variables > Actions
3. Add these secrets:
   - `FIREBASE_SERVICE_ACCOUNT`: Service account JSON from Firebase Project Settings
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID

To get the service account JSON:
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Copy the entire JSON content to the `FIREBASE_SERVICE_ACCOUNT` secret

### 7. Deploy to Production

```bash
# Build apps (when ready)
cd apps/admin && npm run build
cd ../live && npm run build

# Deploy everything
cd ../..
firebase deploy
```

Or push to `main` branch and let GitHub Actions handle deployment automatically.

## Next Steps: Week 1 Development

### Task 1: Firebase Schema ✓
- [x] Firestore rules created
- [x] Database indexes defined
- [x] Match collection with sortOrder field
- [x] Team standings structure

### Task 2: Logic Picker UI
Create a simple UI to select sport type:
```javascript
// Example component
function SportPicker({ onSelect }) {
  return (
    <div>
      <button onClick={() => onSelect('Soccer')}>Soccer</button>
      <button onClick={() => onSelect('Rugby')}>Rugby</button>
      <button onClick={() => onSelect('Custom')}>Custom</button>
    </div>
  );
}
```

### Task 3: Test Push-Back Logic
Use the sortOrder field to shift match times:
```javascript
// Example: Push back all matches by 15 minutes
async function globalPushBack(tournamentId, delayMinutes) {
  const matchesRef = collection(db, 'matches');
  const q = query(
    matchesRef, 
    where('tournamentId', '==', tournamentId),
    where('status', 'in', ['scheduled', 'inProgress']),
    orderBy('sortOrder')
  );
  
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  
  snapshot.forEach(doc => {
    const match = doc.data();
    const newTime = new Date(match.scheduledTime.toDate());
    newTime.setMinutes(newTime.getMinutes() + delayMinutes);
    
    batch.update(doc.ref, {
      scheduledTime: newTime,
      lastUpdated: new Date()
    });
  });
  
  await batch.commit();
}
```

## Development Workflow

1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Make changes**: Edit files in `apps/` or `packages/shared`
3. **Test locally**: Use Firebase Emulators
4. **Commit**: `git commit -m "Description"`
5. **Push**: `git push origin feature/your-feature`
6. **Create PR**: GitHub will auto-deploy preview via Actions

## Common Commands

```bash
# Start local development
firebase emulators:start

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy only firestore rules/indexes
firebase deploy --only firestore

# View logs
firebase functions:log
```

## Troubleshooting

### "Permission denied" errors
- Check your Firestore rules in `firestore.rules`
- Ensure you're authenticated if required
- Test mode allows all operations for 30 days

### "Index required" errors
- Firebase will provide a direct link to create the index
- Or add it manually to `firestore.indexes.json` and redeploy

### Build errors
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 16+)
- Clear cache: `rm -rf node_modules && npm install`

### Emulator issues
- Kill all emulator processes: `pkill -f firebase`
- Restart: `firebase emulators:start`
- Check ports aren't in use: `lsof -i :8080`

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [GitHub Actions for Firebase](https://github.com/FirebaseExtended/action-hosting-deploy)

## Support

For issues specific to this project, check:
1. `FIREBASE_SETUP.md` for detailed Firebase instructions
2. `README.md` for project overview
3. Firestore rules in `firestore.rules`
4. Type definitions in `packages/shared/types.ts`
