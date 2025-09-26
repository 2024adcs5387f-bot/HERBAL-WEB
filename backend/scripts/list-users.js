import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase admin client with service role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required environment variables SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function listUsers() {
  try {
    console.log('Fetching users from Supabase...');
    
    // First try to get users from the profiles table
    console.log('\nChecking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.log('Error fetching from profiles table (this is normal if the table does not exist):', profilesError.message);
    } else if (profiles && profiles.length > 0) {
      console.log('\n=== Users (from profiles table) ===');
      profiles.forEach((profile, index) => {
        console.log(`\nUser #${index + 1}:`);
        console.log(`- ID: ${profile.id}`);
        console.log(`- Email: ${profile.email || 'N/A'}`);
        console.log(`- Full Name: ${profile.full_name || 'N/A'}`);
        console.log(`- Role: ${profile.role || 'user'}`);
        console.log(`- Created: ${profile.created_at ? new Date(profile.created_at).toLocaleString() : 'N/A'}`);
        if (profile.updated_at) {
          console.log(`- Updated: ${new Date(profile.updated_at).toLocaleString()}`);
        }
      });
    } else {
      console.log('No users found in the profiles table.');
    }
    
    // Then try to get users from auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching users from auth:', authError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('No users found in the auth system.');
      return;
    }
    
    console.log('\n=== Users (from auth) ===');
    users.forEach((user, index) => {
      console.log(`\nUser #${index + 1}:`);
      console.log(`- ID: ${user.id}`);
      console.log(`- Email: ${user.email || 'N/A'}`);
      console.log(`- Phone: ${user.phone || 'N/A'}`);
      console.log(`- Role: ${user.role || 'user'}`);
      console.log(`- Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`- Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
      console.log(`- Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`- Anonymous: ${user.is_anonymous ? 'Yes' : 'No'}`);
      if (user.user_metadata) {
        console.log('- Metadata:', JSON.stringify(user.user_metadata, null, 2));
      }
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
listUsers();
