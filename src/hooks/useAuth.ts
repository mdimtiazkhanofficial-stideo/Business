import { useState, useEffect, useCallback, useMemo } from 'react';
import { User as SupabaseAuthUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Customer } from '../types';

export interface SignUpData {
  name: string;
  phone?: string;
  email: string;
  password?: string;
  address?: string;
  city?: string;
  role?: 'customer' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface UseAuthReturn {
  // Current user in application format
  currentUser: User | null;
  // Raw Supabase user object & active session
  supabaseUser: SupabaseAuthUser | null;
  session: Session | null;
  // Role & convenience flags
  authRole: 'customer' | 'admin' | 'guest';
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;

  // Actions
  signUp: (data: SignUpData) => Promise<AuthResponse>;
  signIn: (emailOrPhone: string, password?: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  refreshSession: () => Promise<void>;

  // Aliases for seamless drop-in compatibility across the app
  login: (emailOrPhone: string, password?: string) => Promise<AuthResponse>;
  register: (data: SignUpData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const STORAGE_KEY_CURRENT_USER = 'shadsodai_current_user';
const STORAGE_KEY_REGISTERED_USERS = 'shadsodai_registered_users';

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!raw) return null;
    const user = JSON.parse(raw);
    // Ignore legacy or mock hardcoded admin/demo users
    if (
      user &&
      (user.id === 'usr-admin-01' ||
        user.id === 'usr-demo-01' ||
        user.email === 'admin@shadsodai.com' ||
        user.email === 'customer@shadsodai.com')
    ) {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  } catch (e) {
    console.error('Failed to update stored user:', e);
  }
}

/**
 * Maps a Supabase Auth User object into the application's User type
 */
function mapSupabaseUserToAppUser(sbUser: SupabaseAuthUser, fallback?: Partial<User>): User {
  const metadata = sbUser.user_metadata || {};
  const email = (sbUser.email || fallback?.email || '').toLowerCase().trim();
  const name =
    metadata.name ||
    metadata.full_name ||
    fallback?.name ||
    email.split('@')[0] ||
    'Customer';
  const phone = metadata.phone || sbUser.phone || fallback?.phone || '';
  const address = metadata.address || fallback?.address || '';
  const city = metadata.city || fallback?.city || 'Dhaka';
  const role: 'customer' | 'admin' =
    metadata.role === 'admin' || email === 'admin@shadsodai.com' ? 'admin' : 'customer';

  return {
    id: sbUser.id,
    name,
    email,
    phone,
    address,
    city,
    role,
    created_at: sbUser.created_at || new Date().toISOString()
  };
}

/**
 * Custom React hook `useAuth`
 * Interacts directly with Supabase client (from src/lib/supabase.ts)
 * Manages authentication states: sign-up, sign-in, sign-out, session restoration, and profile synchronization.
 */
export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseAuthUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync Supabase Auth session & onAuthStateChange listener
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        if (!isSupabaseConfigured) {
          if (isMounted) setLoading(false);
          return;
        }

        const { data, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.warn('Supabase getSession warning:', sessionErr.message);
        }

        if (isMounted) {
          if (data?.session) {
            setSession(data.session);
            setSupabaseUser(data.session.user);
            const appUser = mapSupabaseUserToAppUser(data.session.user);
            setCurrentUser(appUser);
            setStoredUser(appUser);
          } else {
            // Keep local user if exists, or clear
            const stored = getStoredUser();
            if (stored) {
              setCurrentUser(stored);
            }
          }
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Auth initialization error:', err);
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Subscribe to auth state changes (sign-in, token refresh, sign-out)
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      setSession(currentSession);
      setSupabaseUser(currentSession?.user || null);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (currentSession?.user) {
          const appUser = mapSupabaseUserToAppUser(currentSession.user);
          setCurrentUser(appUser);
          setStoredUser(appUser);
          setError(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setStoredUser(null);
        setSession(null);
        setSupabaseUser(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * User Sign-Up
   */
  const signUp = useCallback(async (data: SignUpData): Promise<AuthResponse> => {
    setError(null);
    setLoading(true);

    try {
      const cleanEmail = (data.email || '').toLowerCase().trim();
      const cleanPhone = (data.phone || '').trim();
      const cleanName = (data.name || '').trim();

      if (!cleanName) {
        const msg = 'Name is required for registration.';
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }

      // Generate a valid email format if only phone is provided
      const resolvedEmail =
        cleanEmail || `${cleanPhone.replace(/[^0-9]/g, '') || Date.now()}@customer.shadsodai.com`;

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: cleanName,
        email: resolvedEmail,
        phone: cleanPhone,
        address: data.address?.trim() || '',
        city: data.city?.trim() || 'Dhaka',
        role: data.role || 'customer',
        created_at: new Date().toISOString()
      };

      // 1. Supabase Auth Registration
      if (isSupabaseConfigured) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: resolvedEmail,
            password: data.password || 'TemporaryPass123!',
            options: {
              data: {
                name: newUser.name,
                phone: newUser.phone,
                role: newUser.role,
                address: newUser.address,
                city: newUser.city
              }
            }
          });

          if (authError) {
            console.warn('Supabase signUp notice:', authError.message);
            // If already registered in Supabase, attempt fallback or propagate clear message
            if (authError.message.includes('already registered')) {
              setError('An account with this email already exists. Please log in.');
              setLoading(false);
              return {
                success: false,
                error: 'An account with this email already exists. Please log in.'
              };
            }
          }

          if (authData?.user) {
            newUser.id = authData.user.id;
            setSupabaseUser(authData.user);
            if (authData.session) {
              setSession(authData.session);
            }
          }

          // Optional: Record in customers table in Supabase
          try {
            await supabase.from('customers').upsert({
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              phone: newUser.phone,
              address: newUser.address,
              city: newUser.city,
              role: newUser.role
            });
          } catch (upsertErr) {
            console.warn('Customer table upsert notice:', upsertErr);
          }
        } catch (sbErr: any) {
          console.warn('Supabase auth execution error:', sbErr);
        }
      }

      // 2. Local Fallback Cache for resilience
      try {
        const storedUsers: User[] = JSON.parse(
          localStorage.getItem(STORAGE_KEY_REGISTERED_USERS) || '[]'
        );
        const existingIdx = storedUsers.findIndex(
          (u) =>
            u.email.toLowerCase() === resolvedEmail ||
            (cleanPhone && u.phone && u.phone === cleanPhone)
        );
        if (existingIdx >= 0) {
          storedUsers[existingIdx] = { ...storedUsers[existingIdx], ...newUser };
        } else {
          storedUsers.push(newUser);
        }
        localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(storedUsers));
      } catch {
        // ignore
      }

      setCurrentUser(newUser);
      setStoredUser(newUser);
      setLoading(false);
      return { success: true, user: newUser };
    } catch (err: any) {
      const msg = err?.message || 'Registration failed. Please try again.';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  }, []);

  /**
   * User Sign-In
   */
  const signIn = useCallback(
    async (emailOrPhone: string, password?: string): Promise<AuthResponse> => {
      setError(null);
      setLoading(true);

      const query = (emailOrPhone || '').trim().toLowerCase();
      if (!query) {
        const msg = 'Email or phone number is required.';
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }

      // 1. Try Supabase Auth sign-in if configured
      if (isSupabaseConfigured && password) {
        try {
          // If query has @, use it directly as email; otherwise find matching email
          let authEmail = query;
          if (!query.includes('@')) {
            try {
              const storedUsers: User[] = JSON.parse(
                localStorage.getItem(STORAGE_KEY_REGISTERED_USERS) || '[]'
              );
              const matched = storedUsers.find((u) => u.phone && u.phone.includes(query));
              if (matched?.email) {
                authEmail = matched.email;
              } else {
                authEmail = `${query.replace(/[^0-9]/g, '')}@customer.shadsodai.com`;
              }
            } catch {
              authEmail = `${query.replace(/[^0-9]/g, '')}@customer.shadsodai.com`;
            }
          }

          const { data, error: signInErr } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password
          });

          if (!signInErr && data?.user) {
            const user = mapSupabaseUserToAppUser(data.user);
            setCurrentUser(user);
            setStoredUser(user);
            setSupabaseUser(data.user);
            setSession(data.session);
            setLoading(false);
            return { success: true, user };
          }

          if (signInErr) {
            console.warn('Supabase signIn notice:', signInErr.message);
          }
        } catch (sbErr) {
          console.warn('Supabase sign-in fallback attempt:', sbErr);
        }
      }

      // 2. Local Fallback Authentication
      try {
        const registered: User[] = JSON.parse(
          localStorage.getItem(STORAGE_KEY_REGISTERED_USERS) || '[]'
        ).filter(
          (u: User) =>
            u.id !== 'usr-admin-01' &&
            u.id !== 'usr-demo-01' &&
            u.email !== 'admin@shadsodai.com' &&
            u.email !== 'customer@shadsodai.com'
        );

        const found = registered.find(
          (u: User) =>
            u.email.toLowerCase() === query ||
            (u.phone && (u.phone === query || u.phone.includes(query)))
        );

        if (found) {
          setCurrentUser(found);
          setStoredUser(found);
          setLoading(false);
          return { success: true, user: found };
        }
      } catch {
        // ignore
      }

      const failMsg = 'Invalid credentials or user not found. Please register an account.';
      setError(failMsg);
      setLoading(false);
      return { success: false, error: failMsg };
    },
    []
  );

  /**
   * User Sign-Out
   */
  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase sign-out notice:', err);
    } finally {
      setCurrentUser(null);
      setStoredUser(null);
      setSession(null);
      setSupabaseUser(null);
      setLoading(false);
    }
  }, []);

  /**
   * Update User Profile
   */
  const updateProfile = useCallback(
    async (data: Partial<User>): Promise<boolean> => {
      if (!currentUser) return false;

      const updatedUser: User = {
        ...currentUser,
        ...data
      };

      try {
        if (isSupabaseConfigured) {
          // Update Supabase Auth user metadata
          await supabase.auth.updateUser({
            data: {
              name: updatedUser.name,
              phone: updatedUser.phone,
              address: updatedUser.address,
              city: updatedUser.city,
              role: updatedUser.role
            }
          });

          // Update customer record in Supabase
          try {
            await supabase.from('customers').upsert({
              id: updatedUser.id,
              name: updatedUser.name,
              email: updatedUser.email,
              phone: updatedUser.phone,
              address: updatedUser.address,
              city: updatedUser.city,
              role: updatedUser.role
            });
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Profile update notice:', err);
      }

      setCurrentUser(updatedUser);
      setStoredUser(updatedUser);
      return true;
    },
    [currentUser]
  );

  /**
   * Refresh current active session
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setSession(data.session);
        setSupabaseUser(data.session.user);
        const mapped = mapSupabaseUserToAppUser(data.session.user);
        setCurrentUser(mapped);
        setStoredUser(mapped);
      }
    } catch (err) {
      console.warn('Session refresh warning:', err);
    }
  }, []);

  const authRole = useMemo<'customer' | 'admin' | 'guest'>(() => {
    if (!currentUser) return 'guest';
    return currentUser.role || 'customer';
  }, [currentUser]);

  const isAuthenticated = Boolean(currentUser);
  const isAdmin = authRole === 'admin';

  return {
    currentUser,
    supabaseUser,
    session,
    authRole,
    isAuthenticated,
    isAdmin,
    isLoading: loading,
    loading,
    error,
    isConfigured: isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshSession,
    // Aliases
    login: signIn,
    register: signUp,
    logout: signOut
  };
}

export default useAuth;
