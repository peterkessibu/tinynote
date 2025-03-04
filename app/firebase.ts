import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrv68pdZ0QyOHTAtO-Tuwhvv2GCQE9zEw",
  authDomain: "tinynote-3d742.firebaseapp.com",
  projectId: "tinynote-3d742",
  storageBucket: "tinynote-3d742.firebasestorage.app",
  messagingSenderId: "443268115449",
  appId: "1:443268115449:web:09b549fc142d66e672eb28",
  measurementId: "G-6RYR3NZBRF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
const db = getFirestore(app);

// Set up Google and GitHub providers
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, db };
