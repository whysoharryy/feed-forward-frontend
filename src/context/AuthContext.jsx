import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from backend
          const response = await api.get('/auth/me');
          setCurrentUser(response.data.user);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sign up a new user
   * 1. Creates Firebase Auth account
   * 2. Calls backend to create Firestore profile
   * 3. Fetches the created profile
   */
  const signup = async (name, email, password, role) => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create Firestore profile via backend
      const response = await api.post('/auth/signup', {
        name,
        email,
        password,
        role,
      });

      setCurrentUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: error.message || 'Signup failed' };
    }
  };

  /**
   * Log in an existing user
   * 1. Signs in with Firebase Auth
   * 2. Fetches user profile from backend
   */
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // The onAuthStateChanged listener will fetch the profile
      // But we also fetch it here for immediate use
      const response = await api.get('/auth/me');
      setCurrentUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Login error:', error);

      // Map Firebase Auth error codes to user-friendly messages
      let message = 'Login failed';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      } else if (error.message) {
        message = error.message;
      }

      return { success: false, message };
    }
  };

  /**
   * Log out the current user
   */
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Refresh the current user's profile from the backend
   * Useful after actions that modify user data (e.g., karma updates)
   */
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setCurrentUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
