// Firebase Configuration for Ocean.studio
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  updateProfile
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAA1Kuhr6rFOHn-1KyTlgjY5bgzVR15YqY",
  authDomain: "oceanstudio-ef4c5.firebaseapp.com",
  projectId: "oceanstudio-ef4c5",
  storageBucket: "oceanstudio-ef4c5.firebasestorage.app",
  messagingSenderId: "2746278315",
  appId: "1:2746278315:web:e7b281fe41fcc5a875b2ee",
  measurementId: "G-DL1GQE56FL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');
githubProvider.addScope('repo');

export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  googleProvider,
  githubProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  updateProfile
};
