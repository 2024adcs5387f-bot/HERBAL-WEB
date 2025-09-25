import { supabase } from "../config/supabase";

// Sign up
export const signUp = async ({ email, password, name, user_type }) => {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not initialized. Please set up Supabase credentials.") };
  }

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
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not initialized. Please set up Supabase credentials.") };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

// Sign out
export const signOut = async () => {
  if (!supabase) {
    return { error: new Error("Supabase is not initialized. Please set up Supabase credentials.") };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current user
export const getUser = () => {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not initialized. Please set up Supabase credentials.") };
  }

  return supabase.auth.getUser();
};
