import { supabase } from "../config/supabase";

// Sign up
export const signUp = async ({ email, password, name, user_type }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, user_type }
    }
  });
  return { data, error };
};

// Sign in
export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) {
    try { await ensureAppJwt(); } catch {}
  }
  return { data, error };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  try { localStorage.removeItem("token"); } catch {}
  return { error };
};

// Get current user
export const getUser = () => supabase.auth.getUser();

// Ensure backend JWT is present by exchanging Supabase session access token
export const ensureAppJwt = async () => {
  try {
    const existing = localStorage.getItem('token');
    if (existing && existing.length > 0) return existing;
  } catch {}

  // If Supabase is not configured, bail quickly
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const access_token = sessionData?.session?.access_token;
  if (!access_token) return null;

  // Add a timeout so this never blocks UI indefinitely
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const doExchange = async (path) => {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token }),
        signal: controller.signal,
      });
      const json = await res.json().catch(() => ({}));
      return { res, json };
    };

    // Try primary path first (may be blocked by some ad blockers due to "/auth")
    let { res, json } = await doExchange('/api/auth/supabase-exchange');
    if (!(res.ok && json?.success && json?.data?.token)) {
      console.warn('ensureAppJwt: primary exchange failed, trying fallback alias', { status: res.status, json });
      // Fallback alias path that avoids the word "auth" to bypass blockers
      ({ res, json } = await doExchange('/api/session/exchange'));
    }

    clearTimeout(timeout);
    if (res.ok && json?.success && json?.data?.token) {
      try { localStorage.setItem('token', json.data.token); } catch {}
      return json.data.token;
    }
    console.warn('ensureAppJwt: exchange failed after fallback', { status: res.status, json });
  } catch (e) {
    console.warn('ensureAppJwt: exchange error/timeout', e?.message || String(e));
  } finally {
    clearTimeout(timeout);
  }
  return null;
};

// Initialize a bridge so when Supabase auth changes, the backend JWT syncs
export const initAuthBridge = () => {
  try {
    // On load, attempt to ensure the app JWT (non-blocking)
    ensureAppJwt().catch(() => {});
    // Listen to future auth changes
    supabase.auth.onAuthStateChange(async (_event, _session) => {
      if (_session?.access_token) {
        ensureAppJwt().catch(() => {});
      } else {
        try { localStorage.removeItem('token'); } catch {}
      }
    });
  } catch {}
};
