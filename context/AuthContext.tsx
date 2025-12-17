"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Define types
type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
} | null;

type Session = {
  user: User;
} | null;

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
} | null;

type AuthResult = {
  success: boolean;
  error?: string;
};

type AuthContextType = {
  user: User;
  profile: UserProfile;
  session: Session;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<NonNullable<UserProfile>>) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  signUp: async () => ({ success: false }),
  signIn: async () => ({ success: false }),
  signOut: async () => {},
  updateProfile: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  refreshProfile: async () => {},
});

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [session, setSession] = useState<Session>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed admin status from profile
  const isAdmin = profile?.is_admin === true;

  // Fetch user profile via API (bypasses RLS issues)
  const fetchProfile = async (userId: string): Promise<UserProfile> => {
    console.log("🔍 Fetching profile via API for userId:", userId);
    
    try {
      const response = await fetch(`/api/profile?userId=${userId}`);
      const data = await response.json();
      
      console.log("📦 API response:", data);
      
      if (data.error) {
        console.error("❌ API error:", data.error);
        return null;
      }
      
      if (data.profile) {
        console.log("✅ Profile loaded:", data.profile.email);
        console.log("✅ is_admin:", data.profile.is_admin);
        return data.profile as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error("💥 Fetch error:", error);
      return null;
    }
  };

  // Refresh profile manually
  const refreshProfile = async () => {
    if (user?.id) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    console.log("🚀 AuthProvider starting...");

    const initAuth = async () => {
      try {
        console.log("🔐 Getting session...");
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ getSession error:", error);
        }

        if (data.session?.user && isMounted) {
          console.log("👤 User found:", data.session.user.email);
          
          setSession(data.session);
          setUser(data.session.user);
          
          // Fetch profile via API
          const userProfile = await fetchProfile(data.session.user.id);
          
          if (isMounted) {
            setProfile(userProfile);
            console.log("💾 Profile set in state");
          }
        } else {
          console.log("👤 No user in session");
        }
      } catch (error) {
        console.error("💥 Auth initialization error:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log("✅ Auth loading complete");
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("🔔 Auth state changed:", event);
        
        if (!isMounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const userProfile = await fetchProfile(newSession.user.id);
          if (isMounted) {
            setProfile(userProfile);
          }
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log("═══════════════════════════════════");
    console.log("📊 AUTH STATE:");
    console.log("   User:", user?.email || "null");
    console.log("   Profile:", profile ? `${profile.email} (admin: ${profile.is_admin})` : "null");
    console.log("   isAdmin:", isAdmin);
    console.log("   isLoading:", isLoading);
    console.log("═══════════════════════════════════");
  }, [user, profile, isAdmin, isLoading]);

  // Sign up new user
  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true };
      }

      return { success: false, error: "Signup failed. Please try again." };
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  // Sign in existing user
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
        return { success: true };
      }

      return { success: false, error: "Login failed. Please try again." };
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Update user profile
  const updateProfile = async (
    updates: Partial<NonNullable<UserProfile>>
  ): Promise<AuthResult> => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Refresh profile
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update profile" };
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to send reset email" };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context;
}