'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { authService, AuthResult } from '@/lib/services/authService';
import { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (params: {
    fullName: string;
    email: string;
    password: string;
    childAge?: string;
    role?: 'customer' | 'admin';
  }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const p = await authService.getCurrentUser();
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // 1. Initial session retrieval
    async function initAuth() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const p = await authService.getCurrentUser();
          setProfile(p);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // 2. Real-time auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        const p = await authService.getCurrentUser();
        setProfile(p);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const result = await authService.login(email, password);
    setUser(result.user);
    setSession(result.session);
    setProfile(result.profile);
    return result;
  };

  const signUp = async (params: {
    fullName: string;
    email: string;
    password: string;
    childAge?: string;
    role?: 'customer' | 'admin';
  }): Promise<AuthResult> => {
    const result = await authService.register(params);
    if (result.user && result.session) {
      setUser(result.user);
      setSession(result.session);
      setProfile(result.profile);
    }
    return result;
  };

  const signOut = async () => {
    await authService.logout();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const isAdmin = authService.isAdmin(user, profile);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
