import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpadSjq7JWZ9ta3jxWh0K3fWR-r-g2Ecs",
  authDomain: "prepwise-7856f.firebaseapp.com",
  projectId: "prepwise-7856f",
  storageBucket: "prepwise-7856f.firebasestorage.app",
  messagingSenderId: "99414507444",
  appId: "1:99414507444:web:52d770823e2a8625ecbce1",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
