import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client with anon key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing required environment variables SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Helper function to format object values
const formatValue = (value) => {
  if (value === null || value === undefined) return 'Not set';
  if (Array.isArray(value) && value.length === 0) return 'None';
  if (typeof value === 'object' && Object.keys(value).length === 0) return 'Empty';
  return JSON.stringify(value, null, 2);
};

async function listUsers() {
  try {
    console.log('Fetching users from Supabase...\n');
    
    // Get all users from the profiles table
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('ℹ️  No users found in the profiles table.');
      return;
    }
    
    console.log(`✅ Found ${profiles.length} user(s)\n`);
    console.log('='.repeat(80));
    
    // Display each user's information
    profiles.forEach((user, index) => {
      console.log(`\n👤 USER #${index + 1}`);
      console.log('─'.repeat(40));
      
      // Basic Info
      console.log('\nBASIC INFORMATION');
      console.log('├─ ID:', user.id);
      console.log(`├─ Name: ${user.name || user.full_name || 'Not provided'}`);
      console.log(`├─ Email: ${user.email || 'Not provided'}`);
      console.log(`├─ User Type: ${user.user_type || 'Not specified'}`);
      console.log(`└─ Role: ${user.role || 'user'}`);
      
      // Account Info
      console.log('\nACCOUNT INFORMATION');
      console.log(`├─ Created: ${formatDate(user.created_at)}`);
      console.log(`└─ Last Updated: ${formatDate(user.updated_at)}`);
      
      // Contact Info
      console.log('\nCONTACT INFORMATION');
      console.log(`├─ Phone: ${user.phone || 'Not provided'}`);
      console.log(`└─ Address: ${formatValue(user.address)}`);
      
      // Business Info (if applicable)
      if (user.business_name || user.business_license) {
        console.log('\nBUSINESS INFORMATION');
        if (user.business_name) console.log(`├─ Business Name: ${user.business_name}`);
        if (user.business_license) console.log(`└─ License: ${user.business_license}`);
      }
      
      // Additional Info
      console.log('\nADDITIONAL INFORMATION');
      const specialInfo = [
        { label: 'Bio', value: user.bio },
        { label: 'Specializations', value: user.specializations },
        { label: 'Credentials', value: user.credentials },
        { label: 'Avatar URL', value: user.avatar }
      ];
      
      specialInfo.forEach(({ label, value }, i) => {
        const prefix = i === specialInfo.length - 1 ? '└' : '├';
        console.log(`${prefix}─ ${label}: ${formatValue(value)}`);
      });
      
      console.log('\n' + '='.repeat(80));
    });
    
    // Summary
    console.log('\nSUMMARY');
    console.log('─'.repeat(40));
    console.log(`• Total Users: ${profiles.length}`);
    
    // Count by user type
    const userTypes = profiles.reduce((acc, user) => {
      const type = user.user_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nUSERS BY TYPE:');
    Object.entries(userTypes).forEach(([type, count]) => {
      console.log(`• ${type.charAt(0).toUpperCase() + type.slice(1)}: ${count}`);
    });
    
  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the function
console.clear(); // Clear the console for better readability
listUsers();
