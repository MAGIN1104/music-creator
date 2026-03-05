// Firebase config and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBZQleCYFWLE-QbP48aZHj5pLmsxoHYK4s",
  authDomain: "music-rfk.firebaseapp.com",
  projectId: "music-rfk",
  storageBucket: "music-rfk.firebasestorage.app",
  messagingSenderId: "1091012646787",
  appId: "1:1091012646787:web:cf778cb798b87905ad88b6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };