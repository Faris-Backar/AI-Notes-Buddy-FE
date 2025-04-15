import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logOut, subscribeToAuthChanges } from '../services/authService';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth context provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking auth state:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthChanges((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Sign in
  const signIn = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      setUser(userData);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setError(null);
    try {
      setLoading(true);
      await logOut();
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 