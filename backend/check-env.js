// Environment Variables Checker
// Run: node check-env.js

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('\n🔍 Environment Variables Check\n');
console.log('================================\n');

const checks = [
  {
    name: 'Plant.id API Key',
    key: 'PLANT_ID_API_KEY',
    required: true,
    link: 'https://web.plant.id/'
  },
  {
    name: 'Supabase URL',
    key: 'SUPABASE_URL',
    required: true,
    link: 'https://supabase.com/'
  },
  {
    name: 'Supabase Anon Key',
    key: 'SUPABASE_ANON_KEY',
    required: true,
    link: 'https://supabase.com/'
  },
  {
    name: 'Supabase Service Key',
    key: 'SUPABASE_SERVICE_KEY',
    required: true,
    link: 'https://supabase.com/'
  },
  {
    name: 'OpenAI API Key',
    key: 'OPENAI_API_KEY',
    required: false,
    link: 'https://platform.openai.com/'
  }
];

let allGood = true;

checks.forEach(check => {
  const value = process.env[check.key];
  const status = value ? '✅' : (check.required ? '❌' : '⚠️');
  const message = value 
    ? `${status} ${check.name}: Set (${value.substring(0, 10)}...)`
    : `${status} ${check.name}: ${check.required ? 'MISSING (Required)' : 'Not set (Optional)'}`;
  
  console.log(message);
  
  if (check.required && !value) {
    console.log(`   Get it here: ${check.link}\n`);
    allGood = false;
  }
});

console.log('\n================================\n');

if (allGood) {
  console.log('✅ All required environment variables are set!');
  console.log('✅ You can start the server with: npm run dev\n');
} else {
  console.log('❌ Some required environment variables are missing!');
  console.log('📝 Please add them to backend/.env file');
  console.log('📖 See .env.example for reference\n');
  process.exit(1);
}
