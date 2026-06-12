import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cnpfppmypopjaofmjako.supabase.co';
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucGZwcG15cG9wamFvZm1qYWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTc3OTEsImV4cCI6MjA5Mjk5Mzc5MX0.1VmiNcdBmk572lR5x5DdWBq_79XaF7YqOhvdF7LgL6E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Proactively heal from corrupted, invalid, or obsolete refresh tokens
// to avoid "Invalid Refresh Token: Refresh Token Not Found" crashes.
(async () => {
  try {
    const { error } = await supabase.auth.getSession();
    if (error && (error.message?.includes('Refresh Token') || error.message?.includes('not found') || error.status === 400 || error.status === 401)) {
      console.warn("Clearing corrupted Supabase session keys:", error.message);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase.auth'))) {
          localStorage.removeItem(key);
        }
      }
      await supabase.auth.signOut().catch(() => {});
    }
  } catch (err) {
    console.warn("Silent ignore database diagnostic check:", err);
  }
})();
