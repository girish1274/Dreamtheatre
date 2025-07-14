import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS !== 'web') {
      const SecureStore = await import('expo-secure-store');
      return SecureStore.getItemAsync(key);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS !== 'web') {
      const SecureStore = await import('expo-secure-store');
      return SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS !== 'web') {
      const SecureStore = await import('expo-secure-store');
      return SecureStore.deleteItemAsync(key);
    }
  },
};

// Use localStorage for web, SecureStore for native
const storage = Platform.OS === 'web' 
  ? typeof window !== 'undefined' ? window.localStorage : undefined
  : ExpoSecureStoreAdapter;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});