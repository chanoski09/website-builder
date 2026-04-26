import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

// Keeps the same public shape the rest of the app expects, but backed by
// Supabase Auth + the `profiles` table.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState({
    // Kept for API-compat with the old Base44 client. Public toggles can be
    // moved to a `public_settings` table later if needed.
    public_settings: {},
  });

  const hydrate = useCallback(async (session) => {
    if (!session?.user) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(true);
      setIsLoadingAuth(false);
      return;
    }
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      console.warn('profile fetch failed:', error.message);
    }

    setUser({ ...session.user, ...(profile || {}) });
    setIsAuthenticated(true);
    setAuthChecked(true);
    setIsLoadingAuth(false);
  }, []);

  useEffect(() => {
    let sub;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await hydrate(session);
        sub = supabase.auth.onAuthStateChange((_event, s) => hydrate(s));
      } catch (error) {
        console.error('Auth bootstrap failed:', error);
        setAuthError({ type: 'unknown', message: error.message });
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    })();
    return () => {
      sub?.data?.subscription?.unsubscribe();
    };
  }, [hydrate]);

  const checkUserAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await hydrate(session);
  }, [hydrate]);

  const checkAppState = checkUserAuth; // alias for API-compat

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => {
    if (typeof window === 'undefined') return;
    const url = new URL('/login', window.location.origin);
    url.searchParams.set('next', window.location.pathname + window.location.search);
    window.location.href = url.toString();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
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
