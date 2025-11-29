'use client';

import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

/**
 * useAuth Hook with initialization tracking
 */
export function useAuthWithInit() {
  const ctx = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!ctx.isLoading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [ctx.isLoading, isInitialized]);

  return {
    user: ctx.user,
    isAuthenticated: ctx.isAuthenticated,
    login: ctx.login,
    logout: ctx.logout,
    isLoading: ctx.isLoading,
    isInitialized,
  };
}

// Re-export useAuth from context
export { useAuth } from '../context/AuthContext';
