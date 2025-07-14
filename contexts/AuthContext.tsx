import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  resendVerification: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          // Check if user has completed profile
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (!profile || !profile.name) {
              router.replace('/(auth)/complete-profile');
            } else {
              router.replace('/(tabs)');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          router.replace('/(auth)/signin');
        } else if (event === 'SIGNED_UP') {
          // User just signed up, redirect to email verification
          router.replace(`/(auth)/verify-email?email=${session?.user?.email}`);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          return { 
            error: 'Please verify your email address before signing in. Check your inbox for a verification link.' 
          };
        }
        if (error.message.includes('Invalid login credentials')) {
          return { 
            error: 'Invalid email or password. Please check your credentials and try again.' 
          };
        }
        return { error: error.message };
      }

      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return { 
          error: 'Please verify your email address before signing in. Check your inbox for a verification link.' 
        };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: undefined, // Disable auto-redirect for mobile
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          return { 
            error: 'An account with this email already exists. Please sign in instead.' 
          };
        }
        if (error.message.includes('Password should be at least')) {
          return { 
            error: 'Password must be at least 6 characters long.' 
          };
        }
        return { error: error.message };
      }

      if (data.user && !data.user.email_confirmed_at) {
        return { needsVerification: true };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined, // Disable auto-redirect for mobile
      });
      
      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: undefined, // Disable auto-redirect for mobile
        },
      });
      
      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}