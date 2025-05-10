import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Flag to track if Firebase is available
let isFirebaseAvailable = false

// Default Firebase config
const firebaseConfig = {

};

// Initialize Firebase only if all required config values are present
let app, auth, db, storage

try {
  // Check if all required Firebase config values are present
  const hasRequiredConfig =
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId

  if (hasRequiredConfig) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    isFirebaseAvailable = true
    console.log("Firebase initialized successfully")
  } else {
    console.warn("Firebase configuration is incomplete. Using offline mode.")
    isFirebaseAvailable = false
  }
} catch (error) {
  console.error("Error initializing Firebase:", error)
  isFirebaseAvailable = false
}

// Function to check if Firebase is available
export function checkFirebaseAvailability() {
  return isFirebaseAvailable
}

export { app, auth, db, storage }
