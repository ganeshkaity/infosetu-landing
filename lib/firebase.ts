import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6DeBvU49-_PQHlgL1CECu-WCrWlrLb88",
  authDomain: "up-to-date-news-gk.firebaseapp.com",
  databaseURL: "https://up-to-date-news-gk-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "up-to-date-news-gk",
  storageBucket: "up-to-date-news-gk.firebasestorage.app",
  messagingSenderId: "29948786592",
  appId: "1:29948786592:web:5b5c25e08408a63ec496c5",
  measurementId: "G-X2WWLQ6DMD"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
