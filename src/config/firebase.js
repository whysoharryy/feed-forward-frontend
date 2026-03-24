/**
 * Firebase Client SDK Configuration
 * Used for Firebase Authentication on the frontend
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCciHZmBGKcJzEx9nhKKEbjmQmaJ_gNyLo",
  authDomain: "food-waste-redistributio-4985a.firebaseapp.com",
  projectId: "food-waste-redistributio-4985a",
  storageBucket: "food-waste-redistributio-4985a.firebasestorage.app",
  messagingSenderId: "924617976870",
  appId: "1:924617976870:web:b1cb4500d64218444c4ae7",
  measurementId: "G-WSNK3EWQC9",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
