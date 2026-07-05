import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

type AuthStorage = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

type AsyncStorageModule = AuthStorage & {
  default?: AuthStorage;
};

declare const require: (moduleName: string) => AsyncStorageModule;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables.');
}

const isWebServer = Platform.OS === 'web' && typeof window === 'undefined';

function getWebStorage(): AuthStorage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.localStorage;
}

function getNativeStorage(): AuthStorage | undefined {
  try {
    const asyncStorageModule = require('@react-native-async-storage/async-storage');

    return asyncStorageModule.default ?? asyncStorageModule;
  } catch {
    return undefined;
  }
}

const authStorage = Platform.OS === 'web' ? getWebStorage() : getNativeStorage();
const canPersistSession = Boolean(authStorage) && !isWebServer;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: !isWebServer,
    persistSession: canPersistSession,
    detectSessionInUrl: false,
  },
});

export type MemoProfile = {
  profile_id: string;
  auth_users_id: string;
  name: string | null;
  user_name: string | null;
  email: string | null;
  avatar_url: string | null;
};
