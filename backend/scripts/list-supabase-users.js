import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client with service role key
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
    console.log('Fetching users from Supabase Auth...');
    
    // Get the first page of users
    let page = 1;
    const perPage = 100; // Maximum allowed by Supabase
    let hasMore = true;
    let allUsers = [];
    
    while (hasMore) {
      const { data: { users }, error } = await supabase.auth.admin.listUsers({
        page: page,
        perPage: perPage
      });
      
      if (error) {
        console.error('Error fetching users:', error);
        return;
      }
      
      if (!users || users.length === 0) {
        hasMore = false;
      } else {
        allUsers = [...allUsers, ...users];
        console.log(`Fetched ${users.length} users (page ${page})...`);
        
        // If we got fewer users than requested, we've reached the end
        if (users.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }
    
    if (allUsers.length === 0) {
      console.log('No users found in the auth system.');
      return;
    }
    
    console.log(`\n=== Found ${allUsers.length} user(s) ===`);
    
    allUsers.forEach((user, index) => {
      console.log(`\nUser #${index + 1}:`);
      console.log(`- ID: ${user.id}`);
      console.log(`- Email: ${user.email || 'N/A'}`);
      console.log(`- Phone: ${user.phone || 'N/A'}`);
      console.log(`- Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`- Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
      console.log(`- Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`- Role: ${user.role || 'user'}`);
      console.log(`- Is Anonymous: ${user.is_anonymous ? 'Yes' : 'No'}`);
      
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
listUsers();
