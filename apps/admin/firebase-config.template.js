// Firebase configuration template for Admin app
// Copy this to firebase-config.js and fill in your actual values from Firebase Console

export const firebaseConfig = {
  apiKey: "YOUR_ADMIN_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_ADMIN_APP_ID"
};

// For local development with Firebase Emulators
export const useEmulator = process.env.NODE_ENV === 'development';
export const emulatorConfig = {
  firestorePort: 8080,
  hostingPort: 5000
};
