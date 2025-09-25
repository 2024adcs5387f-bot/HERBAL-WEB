// File: src/services/userService.js
import { supabase } from "../config/supabase";

/**
 * Sign up a new user
 * @param {Object} userData - { name, email, password, role }
 * @returns {Object} session or throws error
 */
export const signUp = async ({ name, email, password, role }) => {
  if (!supabase) {
    throw new Error("Supabase is not initialized. Please set up Supabase credentials.");
  }

  // Create user in Supabase auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  });

  if (authError) throw authError;

  return authData;
};

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Object} session or throws error
 */
export const signIn = async ({ email, password }) => {
  if (!supabase) {
    throw new Error("Supabase is not initialized. Please set up Supabase credentials.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Logout user
 */
export const signOut = async () => {
  if (!supabase) {
    throw new Error("Supabase is not initialized. Please set up Supabase credentials.");
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get current authenticated user (from Supabase + profile)
 */
export const getCurrentUser = async () => {
  if (!supabase) {
    return null;
  }

  // First, check if we have a session; if not, return null (prevents AuthSessionMissingError)
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session) return null;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;

  // Fetch profile from 'profiles' table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle();

  // If no profile row yet, fall back to 'users' table for role and details
  let userRow = null;
  if (!profile) {
    const { data: uRow, error: userRowError } = await supabase
      .from("users")
      .select("id, name, email, user_type, avatar")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (userRowError) {
      // Don't hard fail auth; continue to attempt auto-provision
    }
    userRow = uRow;
  }

  // If neither profiles nor users has a row, auto-provision a minimal users row (RLS allows self insert)
  if (!profile && !userRow) {
    const minimal = {
      id: authData.user.id,
      name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
      email: authData.user.email,
      user_type: 'buyer'
    };
    const { error: insErr } = await supabase.from('users').insert([minimal]);
    // If insert fails due to RLS or race, we proceed without throwing
    if (!insErr) {
      // Re-fetch the row
      const { data: uRow2 } = await supabase
        .from('users')
        .select('id, name, email, user_type, avatar')
        .eq('id', authData.user.id)
        .maybeSingle();
      userRow = uRow2 || null;
    }
  }

  // Normalize return: always include a profile-like shape for role-based checks
  const normalizedProfile = profile || (userRow ? {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    user_type: userRow.user_type,
    avatar: userRow.avatar
  } : null);

  return { ...authData.user, profile: normalizedProfile, user_type: normalizedProfile?.user_type };
};

/**
 * Get user profile from 'users' table
 * @param {string} userId
 */
export const getUserProfile = async (userId) => {
  if (!supabase) {
    throw new Error("Supabase is not initialized. Please set up Supabase credentials.");
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update user profile
 * @param {string} userId
 * @param {Object} updates
 */
export const updateUserProfile = async (userId, updates) => {
  if (!supabase) {
    throw new Error("Supabase is not initialized. Please set up Supabase credentials.");
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * General update (Admin can update any user)
 */
export const updateUser = async (userId, updates) => {
  return await updateUserProfile(userId, updates);
};

/**
 * Check if the user has a certain role
 * @param {Object} user - { user_type }
 * @param {string} role - 'buyer', 'seller', 'herbalist', 'researcher', 'admin'
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  return user?.user_type === role;
};

/**
 * Helper for admin
 */
export const isAdmin = (user) => hasRole(user, "admin");

/**
 * Get all users (for AdminDashboard)
 */
export const getAllUsers = async () => {
  if (!supabase) {
    throw new Error("Supabase is not initialized. Please set up Supabase credentials.");
  }

  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;
  return data;
};

/**
 * Delete a user (Admin only)
 */
export const deleteUser = async (userId) => {
  if (!supabase) {
    throw new Error("Supabase is not initialized. Please set up Supabase credentials.");
  }

  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw error;
  return true;
};

export const getUser = async () => {
  if (!supabase) {
    return null;
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

/**
 * Export default object for simpler imports
 */
export default {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  updateUser,
  hasRole,
  isAdmin,
  getAllUsers,
  deleteUser,
  getUser,
};
