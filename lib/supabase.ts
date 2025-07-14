import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Conditionally import expo-secure-store only for native platforms
let SecureStore: any = null;
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
}

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore?.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore?.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore?.deleteItemAsync(key);
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