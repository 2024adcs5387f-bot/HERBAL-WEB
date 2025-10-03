# Supabase AI Data Storage Setup Guide

## 📋 Overview

This guide explains how to set up Supabase tables for AI feature data storage and caching. The system provides:

- **Plant identification caching** - Reduces API calls and costs
- **Symptom check history** - Track user health queries
- **AI recommendations storage** - Save personalized suggestions
- **Medicinal plants database** - Comprehensive herbal knowledge base
- **Herbal remedies catalog** - Formulations and preparations

## 🚀 Quick Setup

### 1. Run SQL Schema in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `backend/scripts/supabase-ai-tables.sql`
4. Click **Run** to execute

This will create:
- 6 main tables
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for auto-updates
- Sample data for medicinal plants

### 2. Verify Tables Created

In Supabase dashboard, go to **Table Editor** and verify these tables exist:

- ✅ `plant_identifications`
- ✅ `symptom_checks`
- ✅ `ai_recommendations`
- ✅ `medicinal_plants`
- ✅ `herbal_remedies`
- ✅ `user_health_profiles`

### 3. Update Environment Variables

Ensure your backend `.env` has Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 4. Test the Integration

Start your backend server:
```bash
cd backend
npm run dev
```

The Plant Scanner will now:
1. Check Supabase cache before calling Plant.id API
2. Save new identifications to cache
3. Return cached results instantly for duplicate images

## 📊 Database Schema

### 1. Plant Identifications Table

Stores plant identification results with caching.

**Key Fields:**
- `image_hash` - MD5 hash for deduplication
- `plant_name` - Common name
- `scientific_name` - Latin name
- `medicinal_uses` - Array of medicinal properties
- `cache_hit_count` - Usage tracking
- `is_verified` - Herbalist verification flag

**Benefits:**
- ⚡ Instant results for duplicate images
- 💰 Reduced API costs
- 📈 Usage analytics
- ✅ Quality verification by herbalists

### 2. Symptom Checks Table

Stores symptom analysis history.

**Key Fields:**
- `symptoms` - JSONB array of symptoms
- `symptom_hash` - Hash for similar symptom combinations
- `conditions` - Possible diagnoses
- `recommended_herbs` - Herbal suggestions
- `requires_medical_attention` - Safety flag

**Benefits:**
- 📊 Health tracking over time
- 🔍 Pattern recognition
- 🌿 Personalized herbal recommendations

### 3. AI Recommendations Table

Stores AI-generated herbal recommendations.

**Key Fields:**
- `query` - User's question/condition
- `recommended_products` - Product IDs with scores
- `herbal_remedies` - Suggested herbs
- `ai_explanation` - Reasoning
- `user_rating` - Feedback (1-5)

**Benefits:**
- 🎯 Personalized suggestions
- 📚 Learning from feedback
- 🔗 Product recommendations

### 4. Medicinal Plants Database

Comprehensive herbal knowledge base.

**Key Fields:**
- `common_name` / `scientific_name`
- `medicinal_uses` - Therapeutic applications
- `active_compounds` - Chemical constituents
- `contraindications` - Safety warnings
- `research_studies` - Scientific evidence
- `verified` - Expert validation

**Benefits:**
- 📖 Centralized knowledge
- 🔬 Evidence-based information
- 🛡️ Safety data
- 🌱 Growing conditions

### 5. Herbal Remedies Table

Specific remedy formulations.

**Key Fields:**
- `ingredients` - Plant combinations with quantities
- `preparation_instructions` - How to make
- `dosage` - How much to take
- `conditions_treated` - What it helps
- `success_rate` - Effectiveness data

**Benefits:**
- 📝 Standardized formulations
- 👨‍⚕️ Traditional & clinical recipes
- ⭐ User ratings and reviews

### 6. User Health Profiles (Optional)

Privacy-sensitive health preferences.

**Key Fields:**
- `allergies` - Known allergies
- `contraindicated_plants` - Plants to avoid
- `current_medications` - Drug interactions
- `anonymize_data` - Privacy setting

**Benefits:**
- 🔒 Personalized safety
- 🚫 Automatic contraindication checking
- 🎯 Better recommendations

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies:

**Plant Identifications:**
- Users can view their own identifications
- Public can view verified identifications
- Herbalists can verify entries

**Symptom Checks:**
- Strictly private - users see only their own data
- No public access

**Medicinal Plants:**
- Public read access for verified plants
- Herbalists can create/edit
- Contributors can update their own entries

**User Health Profiles:**
- Completely private
- Only user can access their own profile

### Data Privacy

- User IDs are nullable (anonymous usage allowed)
- Health data can be anonymized
- Consent flags for data sharing
- Automatic cleanup of old unverified cache

## 🚀 Performance Optimizations

### Indexes Created

- **Image hash** - Fast cache lookups
- **Plant names** - Quick searches
- **User IDs** - Efficient user queries
- **Timestamps** - Chronological sorting
- **Full-text search** - Natural language queries

### Caching Strategy

1. **Image-based caching:**
   - MD5 hash of image data
   - Instant retrieval for duplicate images
   - Tracks cache hit count

2. **Symptom-based caching:**
   - Hash of symptom combinations
   - Similar symptoms get similar results

3. **Auto-cleanup:**
   - Removes unverified entries after 30 days
   - Keeps verified data indefinitely

## 📈 Usage Examples

### 1. Plant Identification with Cache

```javascript
// Backend automatically:
// 1. Generates image hash
// 2. Checks Supabase cache
// 3. Returns cached result OR calls Plant.id API
// 4. Saves new results to cache

POST /api/ai/plant-identify
{
  "images": ["base64_image_data"]
}

// Response includes:
{
  "from_cache": true,  // or false
  "cache_hit_count": 5,
  "suggestions": [...]
}
```

### 2. Get User's Plant History

```javascript
import plantIdentificationService from './services/plantIdentificationService.js';

const history = await plantIdentificationService.getUserHistory(userId, 20);
```

### 3. Search Medicinal Plants

```javascript
const { data } = await supabase
  .from('medicinal_plants')
  .select('*')
  .textSearch('common_name', 'chamomile')
  .eq('verified', true);
```

### 4. Verify Plant Identification (Herbalist)

```javascript
await plantIdentificationService.verifyIdentification(
  identificationId,
  herbalistUserId
);
```

## 🔧 Maintenance

### Cleanup Old Cache

Run periodically (e.g., weekly cron job):

```javascript
import plantIdentificationService from './services/plantIdentificationService.js';

// Remove unverified entries older than 30 days
await plantIdentificationService.cleanupOldCache(30);
```

### Monitor Cache Performance

Query cache hit statistics:

```sql
SELECT 
  plant_name,
  COUNT(*) as total_identifications,
  AVG(cache_hit_count) as avg_cache_hits
FROM plant_identifications
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY plant_name
ORDER BY total_identifications DESC
LIMIT 20;
```

### Popular Plants View

Pre-built view for analytics:

```sql
SELECT * FROM popular_plants LIMIT 10;
```

## 🎯 Next Steps

### 1. Populate Medicinal Plants Database

Add more plants to the knowledge base:
- Import from existing databases
- Allow herbalist contributions
- Verify with research citations

### 2. Implement Frontend Features

- **Plant History Page** - Show user's past identifications
- **Medicinal Plants Library** - Browse comprehensive database
- **Remedy Builder** - Create custom formulations
- **Health Profile** - Manage allergies and preferences

### 3. Advanced Features

- **AI Learning** - Improve recommendations based on feedback
- **Batch Identification** - Process multiple images
- **Image Similarity Search** - Find visually similar plants
- **Seasonal Trends** - Track popular plants by season

## 📚 API Endpoints

### Plant Identification

```
POST /api/ai/plant-identify
- Checks cache, calls API if needed
- Saves to Supabase
- Returns identification results
```

### User History

```
GET /api/ai/plant-history
- Returns user's identification history
- Paginated results
```

### Search Plants

```
GET /api/plants/search?q=chamomile
- Full-text search
- Filters by verified status
```

### Verify Identification (Herbalist)

```
POST /api/ai/plant-identify/:id/verify
- Marks as verified
- Requires herbalist role
```

## 🐛 Troubleshooting

### Cache Not Working

1. Check Supabase connection:
   ```javascript
   import { testSupabaseConnection } from './config/supabase.js';
   await testSupabaseConnection();
   ```

2. Verify RLS policies allow access

3. Check service role key is set (for admin operations)

### Slow Queries

1. Verify indexes are created:
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'plant_identifications';
   ```

2. Use EXPLAIN ANALYZE to debug:
   ```sql
   EXPLAIN ANALYZE 
   SELECT * FROM plant_identifications WHERE image_hash = 'abc123';
   ```

### Permission Errors

1. Check RLS policies match your auth setup
2. Verify user roles in JWT token
3. Use service role key for admin operations

## 📊 Analytics Queries

### Most Identified Plants

```sql
SELECT 
  plant_name,
  COUNT(*) as identification_count,
  AVG(probability) as avg_confidence
FROM plant_identifications
GROUP BY plant_name
ORDER BY identification_count DESC
LIMIT 10;
```

### Cache Hit Rate

```sql
SELECT 
  COUNT(*) FILTER (WHERE cache_hit_count > 0) * 100.0 / COUNT(*) as cache_hit_rate
FROM plant_identifications;
```

### User Engagement

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_identifications
FROM plant_identifications
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## ✅ Setup Complete!

Your Supabase AI data storage is now configured for:
- ⚡ Fast plant identification with caching
- 📊 User health tracking
- 🌿 Comprehensive herbal knowledge base
- 🔒 Privacy-compliant data storage
- 📈 Analytics and insights

**Next:** Test the Plant Scanner and watch the cache build up!
