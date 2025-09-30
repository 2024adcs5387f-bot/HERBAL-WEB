import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing required environment variables SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listAuthUsers() {
  try {
    console.log('Fetching auth users from Supabase...');
    
    // Query the auth.users table directly
    const { data: users, error } = await supabase
      .from('auth.users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('No users found in the auth system.');
      return;
    }
    
    console.log(`\n=== Found ${users.length} user(s) ===`);
    
    users.forEach((user, index) => {
      console.log(`\nUser #${index + 1}:`);
      console.log(`- ID: ${user.id}`);
      console.log(`- Email: ${user.email || 'N/A'}`);
      console.log(`- Phone: ${user.phone || 'N/A'}`);
      console.log(`- Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`- Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
      console.log(`- Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`- Role: ${user.raw_app_meta_data?.role || 'user'}`);
      console.log(`- Provider: ${user.app_metadata?.provider || 'email'}`);
      
      if (user.user_metadata) {
        console.log('User Metadata:');
        Object.entries(user.user_metadata).forEach(([key, value]) => {
          console.log(`  - ${key}: ${JSON.stringify(value)}`);
        });
      }
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
listAuthUsers();
