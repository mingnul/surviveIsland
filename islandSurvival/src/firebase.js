// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-bS_RR7ipyC1tsTCp9niVxgfmBnD-4Lo",
  authDomain: "islandsurvival-c9bf8.firebaseapp.com",
  projectId: "islandsurvival-c9bf8",
  storageBucket: "islandsurvival-c9bf8.firebasestorage.app",
  messagingSenderId: "77277106466",
  appId: "1:77277106466:web:da8f1dc2918fb99e0b557b",
  measurementId: "G-HJDNEN8X5W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app)