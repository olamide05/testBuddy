// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import getAuth

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAofv6OU10XAJAj6ORBRBsVjChWPzkVjmk",
  authDomain: "hackaton-a26ae.firebaseapp.com",
  projectId: "hackaton-a26ae",
  storageBucket: "hackaton-a26ae.appspot.com",
  messagingSenderId: "582516138481",
  appId: "1:582516138481:web:089fe1ae14c09040296450",
  measurementId: "G-1SRMKES5HG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // ✅ This is the missing line


// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app); // Export the auth service
export default app;
