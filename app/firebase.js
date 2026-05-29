import { initializeApp } from 'firebase/app' 
import { getFirestore } from 'firebase/firestore' 

const firebaseConfig = {
  apiKey: "AIzaSyDj_z3Tl7AHKx3T7INzqh6gIjLF8Q4lfgQ",
  authDomain: "queue-for-you-26f13.firebaseapp.com",
  projectId: "queue-for-you-26f13",
  storageBucket: "queue-for-you-26f13.firebasestorage.app",
  messagingSenderId: "989123949112",
  appId: "1:989123949112:web:51d758bd0ddfcc4353accd",
  measurementId: "G-VDWNGKBXGG"
};

const app = initializeApp(firebaseConfig) 
export const db = getFirestore(app)