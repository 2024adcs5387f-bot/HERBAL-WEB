// src/config/supabase.js
import { createClient } from "@supabase/supabase-js";

// Use VITE_ prefixed env variables for frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function isValidHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (_) {
    return false;
  }
}

let supabase = null;

if (supabaseUrl && supabaseAnonKey && isValidHttpUrl(supabaseUrl)) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
} else {
  console.warn(
    "Supabase is not initialized. Please set valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
  );
}

export { supabase };
