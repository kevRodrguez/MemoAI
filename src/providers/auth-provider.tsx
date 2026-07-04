import { Session, User } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { MemoProfile, supabase } from '@/lib/supabase';

type SignUpInput = {
  name: string;
  userName: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  initializing: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: MemoProfile | null;
  errorMessage: string | null;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getProfileFallback(user: User): Pick<MemoProfile, 'auth_users_id' | 'name' | 'user_name' | 'email' | 'avatar_url'> {
  return {
    auth_users_id: user.id,
    name: typeof user.user_metadata.name === 'string' ? user.user_metadata.name : null,
    user_name: typeof user.user_metadata.user_name === 'string' ? user.user_metadata.user_name : null,
    email: user.email ?? null,
    avatar_url: typeof user.user_metadata.avatar_url === 'string' ? user.user_metadata.avatar_url : null,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MemoProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const user = session?.user ?? null;

  const loadProfile = useCallback(async (activeUser: User | null) => {
    if (!activeUser) {
      setProfile(null);
      return;
    }

    const { data, error, status } = await supabase
      .from('profiles')
      .select('profile_id, auth_users_id, name, user_name, email, avatar_url')
      .eq('auth_users_id', activeUser.id)
      .maybeSingle();

    if (error && status !== 406) {
      throw error;
    }

    if (data) {
      setProfile(data as MemoProfile);
      return;
    }

    const fallback = getProfileFallback(activeUser);
    const { data: insertedProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(fallback)
      .select('profile_id, auth_users_id, name, user_name, email, avatar_url')
      .single();

    if (insertError) {
      throw insertError;
    }

    setProfile(insertedProfile as MemoProfile);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user);
  }, [loadProfile, user]);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        setSession(data.session);
        await loadProfile(data.session?.user ?? null);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setInitializing(false);
        }
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      loadProfile(nextSession?.user ?? null).catch((error: unknown) => {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      });
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async ({ email, password }: SignInInput) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      setSession(data.session);
      await loadProfile(data.user);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  const signUp = useCallback(async ({ name, userName, email, password }: SignUpInput) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            user_name: userName.trim(),
            avatar_url: null,
          },
        },
      });

      if (error) {
        throw error;
      }

      setSession(data.session);
      await loadProfile(data.user);

      if (!data.session) {
        setErrorMessage('Revisa tu correo para confirmar la cuenta antes de iniciar sesion.');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setSession(null);
      setProfile(null);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      initializing,
      loading,
      session,
      user,
      profile,
      errorMessage,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      clearError: () => setErrorMessage(null),
    }),
    [errorMessage, initializing, loading, profile, refreshProfile, session, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
