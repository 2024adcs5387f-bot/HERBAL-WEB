// ./config/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env'
  );
}

// General client (RLS applies)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client (bypasses RLS, server-side only)
if (!supabaseServiceKey) {
  throw new Error(
    'Missing SUPABASE_SERVICE_KEY for admin client. The service role key is required server-side to bypass RLS (e.g., for comments/posts mutations).'
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Optional: helper function to test connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Supabase client connection successful');
  } catch (err) {
    console.error('❌ Supabase client connection failed:', err.message);
  }
};

export default supabase;
