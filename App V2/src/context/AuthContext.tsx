import React, { createContext, useContext } from 'react';
import useAuthHook from '../hooks/useAuth';
import { User } from 'firebase/auth';

interface AuthUser extends User {
  role?: 'admin' | 'worker' | 'client';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, claims, loading } = useAuthHook();
  
  const authUser: AuthUser | null = user ? {
    ...user,
    role: claims.role
  } : null;

  return (
    <AuthContext.Provider value={{ user: authUser, loading }}>
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