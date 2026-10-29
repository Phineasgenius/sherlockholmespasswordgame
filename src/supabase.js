import { createClient } from '@supabase/supabase-js';

// These env vars are set in .env.local (dev) and in Vercel dashboard (production).
// VITE_ prefix is required for Vite to expose them to the browser.
// The anon key is safe to expose — Row Level Security on Supabase controls access.
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.warn(
    '[Supabase] Missing env vars VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n' +
    'Create a .env.local file — see .env.example for the format.'
  );
}

export const supabase = createClient(
  SUPABASE_URL  || 'https://placeholder.supabase.co',
  SUPABASE_ANON || 'placeholder-anon-key'
);
