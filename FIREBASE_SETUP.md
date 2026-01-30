# Firebase Setup Guide

## Initial Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "tournament-champ"
3. Enable Google Analytics (optional)

### 2. Enable Required Services

#### Firestore Database
1. Navigate to Firestore Database
2. Click "Create database"
3. Choose production mode
4. Select a location

#### Firebase Hosting
1. Navigate to Hosting
2. Click "Get started"
3. Install Firebase CLI: `npm install -g firebase-tools`
4. Login: `firebase login`

#### Cloud Functions
1. Navigate to Functions
2. Click "Get started"
3. Upgrade to Blaze plan (required for Cloud Functions)

### 3. Configure Firebase Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase in the project
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting

# For Hosting, create two sites:
firebase hosting:sites:create tournament-champ-admin
firebase hosting:sites:create tournament-champ-live
```

### 4. Set Up GitHub Secrets

Add the following secrets to your GitHub repository:

1. **FIREBASE_SERVICE_ACCOUNT**
   ```bash
   # Generate service account key from Firebase Console
   # Go to Project Settings > Service Accounts > Generate new private key
   # Copy the entire JSON content and add as secret
   ```

2. **FIREBASE_PROJECT_ID**
   ```
   # Your Firebase project ID (e.g., tournament-champ)
   ```

3. **FIREBASE_TOKEN**
   ```bash
   # Generate token
   firebase login:ci
   # Copy the token and add as secret
   ```

### 5. Deploy

#### Manual Deployment

```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore rules and indexes
firebase deploy --only firestore
```

#### Automatic Deployment

Push to the `main` branch and GitHub Actions will automatically deploy:
- Admin app to `tournament-champ-admin.web.app`
- Live app to `tournament-champ-live.web.app`
- Cloud Functions
- Firestore rules and indexes

## Firebase Web App Configuration

### 1. Add Web Apps

1. In Firebase Console, go to Project Settings
2. Add two web apps:
   - "Tournament Champ Admin"
   - "Tournament Champ Live"
3. Copy the Firebase config for each app

### 2. Create Environment Files

**apps/admin/.env.local:**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**apps/live/.env.local:**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Security Setup

### 1. Create Admin Users

Use Firebase Admin SDK or Firebase Console to add admin users:

```javascript
// In Firebase Console > Firestore
// Create collection: admins
// Document ID: <user-uid>
// Fields: { email: "admin@example.com", role: "admin" }
```

### 2. Authentication

1. Enable Authentication in Firebase Console
2. Enable Email/Password sign-in method
3. Add authorized domains for your hosting URLs

## Testing Locally

### 1. Install Firebase Emulators

```bash
npm install -g firebase-tools
firebase init emulators
```

### 2. Start Emulators

```bash
firebase emulators:start
```

### 3. Run Apps with Emulators

Update your `.env.local` files to use emulators:
```env
VITE_USE_FIREBASE_EMULATOR=true
```

## Monitoring and Logs

### View Logs
```bash
# Function logs
firebase functions:log

# Hosting logs
firebase hosting:channel:list
```

### Firebase Console
- Monitor in real-time: [Firebase Console](https://console.firebase.google.com/)
- Check usage and quotas
- View Firestore data
- Monitor function executions

## Troubleshooting

### Build Failures
- Check Node.js version (requires 18+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Rebuild: `npm run build:all`

### Deployment Failures
- Verify Firebase token: `firebase login:ci`
- Check GitHub secrets are set correctly
- Review GitHub Actions logs

### Function Errors
- Check function logs: `firebase functions:log`
- Verify Firestore rules allow function access
- Check Node.js version in functions package.json

## Production Checklist

- [ ] Firebase project created and configured
- [ ] Firestore security rules deployed
- [ ] Firestore indexes deployed
- [ ] Admin users created in Firestore
- [ ] Authentication configured
- [ ] GitHub secrets configured
- [ ] Build and deployment workflows tested
- [ ] Custom domains configured (optional)
- [ ] Monitoring and alerts set up
- [ ] Backup strategy in place
