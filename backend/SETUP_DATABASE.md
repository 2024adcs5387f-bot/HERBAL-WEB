# Database Setup Guide

## Problem
The `medicinal_plants` table is missing from your Supabase database, causing:
- Comparison feature to fail
- Medicinal uses not showing up
- Database lookup errors

## Solution: Create the Required Tables

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the SQL Scripts

You need to run these scripts **in order**:

#### Option A: Run All Tables (Recommended)

1. Open the file: `backend/scripts/supabase-ai-tables.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **Run** button

This will create:
- `medicinal_plants` table
- `herbal_remedies` table
- `plant_diseases` table
- `user_health_profiles` table
- All necessary indexes and policies

#### Option B: Populate with Sample Data

After creating the tables, add sample medicinal plants:

1. Open the file: `backend/scripts/populate-plant-database.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **Run** button

This will add 30+ common medicinal plants with full information.

### Step 3: Verify Tables Were Created

Run this query in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('medicinal_plants', 'herbal_remedies', 'plant_diseases');
```

You should see all three tables listed.

### Step 4: Check Data

```sql
SELECT common_name, scientific_name, medicinal_uses 
FROM medicinal_plants 
LIMIT 10;
```

You should see medicinal plants with their uses.

### Step 5: Restart Backend Server

After creating the tables:

```bash
cd backend
npm start
```

## What This Fixes

✅ **Medicinal uses will display** - Plants will show their medicinal properties
✅ **Comparison feature works** - Can compare identified plants with database
✅ **No more PGRST205 errors** - Database tables exist
✅ **Full plant information** - Active compounds, safety info, traditional uses

## Quick Test

1. Upload a plant image (try chamomile, ginger, or peppermint)
2. After identification, you should see:
   - ✅ Medicinal Uses section with badges
   - ✅ Active Compounds
   - ✅ Traditional Uses
   - ✅ Safety Information
   - ✅ Comparison table (if data exists)

## Troubleshooting

### Error: "relation already exists"
- Tables are already created, skip to Step 4

### Error: "permission denied"
- Make sure you're logged into the correct Supabase project
- Check you have admin/owner access

### Still no medicinal uses showing?
1. Check backend logs for errors
2. Verify data exists: `SELECT COUNT(*) FROM medicinal_plants;`
3. Make sure `verified = true` for plants
4. Restart backend server

## Need Help?

Check the backend console logs for specific error messages. The system will now gracefully handle missing tables, but creating them enables full functionality.
