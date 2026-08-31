import { createClient, User, Session } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jodmjvofxsfediybnpyd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZG1qdm9meHNmZWRpeWJucHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MzU4NzIsImV4cCI6MjEwMzUxMTg3Mn0.IppewJ_H7VMpgI5Oj1TvVBHmh6m_8veqRmjhgO-hvrY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const authService = {
  // Google OAuth Login
  async signInWithGoogle() {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://zillerdx.github.io/QR-Menu-Easy-Order/';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
    return data;
  },

  // Email & Password Login
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Email Sign Up (for new staff / store owner)
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Request Password Reset Link via Email
  async resetPasswordForEmail(email: string) {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://zillerdx.github.io/QR-Menu-Easy-Order/';
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) throw error;
    return data;
  },

  // Update / Set New Password
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign Out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user session
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Listen to Auth State Changes
  onAuthStateChange(callback: (user: User | null, session: Session | null, event?: string) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null, session, event);
    });
  },
};
