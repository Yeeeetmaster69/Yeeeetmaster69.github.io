import React, { createContext, useContext, useEffect, useState } from 'react';
import useAuthHook from '../hooks/useAuth';
import { User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthUser extends User {
  role?: 'admin' | 'worker' | 'client';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isOnboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  hasSelectedRole: boolean;
  setHasSelectedRole: (selected: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, claims, loading } = useAuthHook();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [hasSelectedRole, setHasSelectedRole] = useState(false);
  
  const authUser: AuthUser | null = user ? {
    ...user,
    role: claims.role || 'client'
  } : null;

  // Load onboarding status from storage
  useEffect(() => {
    const loadOnboardingStatus = async () => {
      try {
        const onboardingStatus = await AsyncStorage.getItem('onboarding_complete');
        const roleStatus = await AsyncStorage.getItem('role_selected');
        setIsOnboardingComplete(onboardingStatus === 'true');
        setHasSelectedRole(roleStatus === 'true' || !!claims.role);
      } catch (error) {
        console.warn('Error loading onboarding status:', error);
      }
    };

    if (user) {
      loadOnboardingStatus();
    }
  }, [user, claims.role]);

  const handleSetOnboardingComplete = async (complete: boolean) => {
    setIsOnboardingComplete(complete);
    try {
      await AsyncStorage.setItem('onboarding_complete', complete.toString());
    } catch (error) {
      console.warn('Error saving onboarding status:', error);
    }
  };

  const handleSetHasSelectedRole = async (selected: boolean) => {
    setHasSelectedRole(selected);
    try {
      await AsyncStorage.setItem('role_selected', selected.toString());
    } catch (error) {
      console.warn('Error saving role selection status:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user: authUser, 
      loading, 
      isOnboardingComplete,
      setOnboardingComplete: handleSetOnboardingComplete,
      hasSelectedRole,
      setHasSelectedRole: handleSetHasSelectedRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};