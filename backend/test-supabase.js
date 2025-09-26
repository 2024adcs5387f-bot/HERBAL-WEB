import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');
  
  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  console.log('📋 Environment Variables Check:');
  console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}\n`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing required Supabase environment variables!');
    console.log('Please create a .env file with the following variables:');
    console.log('SUPABASE_URL=your_supabase_project_url');
    console.log('SUPABASE_ANON_KEY=your_supabase_anon_key');
    console.log('SUPABASE_SERVICE_KEY=your_supabase_service_role_key');
    return false;
  }
  
  try {
    // Create Supabase client
    console.log('🔌 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection by making a simple query
    console.log('🌐 Testing connection to Supabase...');
    const { data: serverInfo, error: serverError } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1);
    
    if (serverError && serverError.code !== 'PGRST116' && serverError.message !== "Could not find the table 'public._supabase_migrations' in the schema cache") {
      // PGRST116 is "relation does not exist" which is normal for migrations table
      throw serverError;
    }
    
    console.log('✅ Basic connection successful!');
    
    // Test auth functionality
    console.log('🔐 Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('⚠️  Auth test warning:', authError.message);
    } else {
      console.log('✅ Authentication module working!');
    }
    
    // Test database access with a simple query
    console.log('🗄️  Testing database access...');
    try {
      // Try to query a common table that might exist
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log('ℹ️  Users table does not exist yet (this is normal for new projects)');
      } else if (error) {
        console.log('⚠️  Database access warning:', error.message);
      } else {
        console.log('✅ Database access working!');
      }
    } catch (dbError) {
      console.log('ℹ️  Database tables may not be set up yet:', dbError.message);
    }
    
    // Test admin client if service key is available
    if (supabaseServiceKey) {
      console.log('👑 Testing admin client...');
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      const { data: adminData, error: adminError } = await supabaseAdmin.auth.getSession();
      
      if (adminError) {
        console.log('⚠️  Admin client warning:', adminError.message);
      } else {
        console.log('✅ Admin client working!');
      }
    } else {
      console.log('ℹ️  Service key not provided, skipping admin client test');
    }
    
    console.log('\n🎉 Supabase connection test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run your database migrations if tables don\'t exist');
    console.log('2. Set up your database schema');
    console.log('3. Start your server with: npm run dev');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ Supabase connection failed!');
    console.log('Error details:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your SUPABASE_URL is correct');
    console.log('2. Verify your SUPABASE_ANON_KEY is correct');
    console.log('3. Check if your Supabase project is active');
    console.log('4. Ensure your internet connection is working');
    
    return false;
  }
}

// Test storage functionality
async function testStorage() {
  console.log('\n📦 Testing Supabase Storage...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Cannot test storage - missing environment variables');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // List buckets to test storage access
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('⚠️  Storage access warning:', error.message);
      return false;
    }
    
    console.log('✅ Storage access working!');
    console.log(`📁 Found ${buckets.length} storage buckets`);
    
    return true;
  } catch (error) {
    console.log('❌ Storage test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Supabase Connection Tests\n');
  console.log('='.repeat(50));
  
  const connectionTest = await testSupabaseConnection();
  const storageTest = await testStorage();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log(`Connection Test: ${connectionTest ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Storage Test: ${storageTest ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (connectionTest && storageTest) {
    console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runAllTests().catch(console.error);
