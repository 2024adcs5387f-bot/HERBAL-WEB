# 🔧 Error Fix Guide - 500 & 401 Errors

## 🚨 Current Errors

### Error 1: 500 Internal Server Error
```
Failed to load resource: the server responded with a status of 500
```

### Error 2: 401 Unauthorized
```
Error message: Request failed with status code 401
```

### Error 3: Socket Hang Up
```
Error message: socket hang up
```

## 🎯 Root Cause

**Plant.id API Key Issue:**
- Missing API key
- Invalid API key
- Expired API key
- API rate limit exceeded

## ✅ Solution Steps

### Step 1: Check Plant.id API Key

1. **Open backend/.env file**
2. **Check if PLANT_ID_API_KEY exists:**

```env
PLANT_ID_API_KEY=your_actual_key_here
```

3. **If missing or invalid, get a new key:**
   - Go to: https://web.plant.id/
   - Sign up for free account
   - Get API key from dashboard
   - Copy the key

### Step 2: Update .env File

```env
# backend/.env

# Plant.id API (REQUIRED)
PLANT_ID_API_KEY=your_actual_plant_id_api_key_here

# Supabase (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# OpenAI (Optional - for advanced features)
OPENAI_API_KEY=your_openai_key
```

### Step 3: Restart Backend

```bash
# Stop backend (Ctrl+C)
cd backend
npm run dev
```

### Step 4: Test API Key

```bash
# Test Plant.id API directly
curl -X POST https://api.plant.id/v2/identify \
  -H "Content-Type: application/json" \
  -H "Api-Key: YOUR_API_KEY_HERE" \
  -d '{
    "images": ["base64_image_data"],
    "modifiers": ["crops_fast"]
  }'
```

## 🔧 Backend Error Handling Fix

Let me improve the error handling to show better messages:

### Update: backend/routes/ai.js

Add better error handling:

```javascript
router.post('/plant-identify', optionalAuth, async (req, res) => {
  try {
    const { images, modifiers, plant_details } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }

    // Check if API key exists
    if (!process.env.PLANT_ID_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Plant.id API key not configured. Please add PLANT_ID_API_KEY to .env file'
      });
    }

    const userId = req.user?.id || null;

    const result = await imageComparisonService.identifyPlantFromImage(
      images[0],
      userId
    );

    // Enhance with medicinal information
    if (result.success && result.data.suggestions) {
      result.data.suggestions = result.data.suggestions.map(suggestion => ({
        ...suggestion,
        medicinal_uses: suggestion.medicinal_uses || getMedicinalUses(suggestion.plant_name),
        safety_info: suggestion.safety_info || getSafetyInfo(suggestion.plant_name)
      }));
    }

    res.json(result);

  } catch (error) {
    console.error('Plant identification error:', error.message);
    
    // Handle specific error types
    let errorMessage = error.message || 'Plant identification failed';
    
    if (error.response?.status === 401) {
      errorMessage = 'Invalid Plant.id API key. Please check your API key configuration.';
    } else if (error.response?.status === 429) {
      errorMessage = 'API rate limit exceeded. Please try again later.';
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = 'Request timeout. Please try again with a smaller image.';
    } else if (error.message.includes('socket hang up')) {
      errorMessage = 'Connection lost. Please check your internet connection and try again.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});
```

## 🔍 Debugging Steps

### Check 1: Backend Running?

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Should return: {"status":"OK"}
```

### Check 2: Environment Variables Loaded?

Add to backend/server.js:

```javascript
console.log('🔑 Environment Check:');
console.log('Plant.id API Key:', process.env.PLANT_ID_API_KEY ? '✅ Set' : '❌ Missing');
console.log('Supabase URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
```

### Check 3: API Key Valid?

```bash
# Test with curl
curl -X POST https://api.plant.id/v2/health_assessment \
  -H "Api-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"images":["test"]}'

# If 401: Key is invalid
# If 400: Key is valid (just bad request data)
```

## 🚀 Quick Fix Commands

### Fix 1: Restart Everything

```bash
# Terminal 1 - Backend
cd backend
# Ctrl+C to stop
npm run dev

# Terminal 2 - Frontend
# Ctrl+C to stop
npm run dev

# Browser
# Ctrl+Shift+R (hard refresh)
```

### Fix 2: Clear Cache

```bash
# Clear node_modules
rm -rf node_modules
rm -rf backend/node_modules

# Reinstall
npm install
cd backend && npm install

# Restart
npm run dev (both terminals)
```

### Fix 3: Check Ports

```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID_NUMBER> /F
```

## 📋 Checklist

Before testing again:

- [ ] Plant.id API key added to backend/.env
- [ ] Backend restarted after adding key
- [ ] Backend shows "✅ Set" for API key
- [ ] No errors in backend terminal
- [ ] Frontend restarted
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Test with small image first

## 🎯 Expected Behavior

### Success:
```
Console:
✅ SUCCESS - Setting results: {...}
✅ Data structure: {...}
✅ Results state updated

Backend:
🔍 Starting plant identification...
🌐 No cache match, calling Plant.id API...
✅ Plant identified successfully
```

### If Still Failing:

1. **Check backend terminal** for exact error
2. **Copy full error message**
3. **Check Plant.id dashboard** for API usage
4. **Try with different image** (smaller file)

## 🔐 Get Plant.id API Key

### Free Tier:
1. Go to: https://web.plant.id/
2. Click "Sign Up"
3. Verify email
4. Go to Dashboard
5. Copy API key
6. Paste in backend/.env

### Limits:
- **Free:** 100 requests/month
- **Paid:** More requests + faster

## 🐛 Common Issues

### Issue: "API key not configured"
**Fix:** Add PLANT_ID_API_KEY to backend/.env

### Issue: "401 Unauthorized"
**Fix:** API key is wrong, get new one

### Issue: "429 Rate Limit"
**Fix:** Wait or upgrade plan

### Issue: "Socket hang up"
**Fix:** Image too large, compress it

### Issue: "Timeout"
**Fix:** Slower connection, try smaller image

## 📊 Test with Sample Request

```javascript
// Test in browser console
fetch('http://localhost:5000/api/ai/plant-identify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    images: ['iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='],
    modifiers: ['crops_fast']
  })
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e));
```

## ✅ Success Indicators

System working when:
- ✅ Backend starts without errors
- ✅ Console shows "✅ Set" for API key
- ✅ Upload image works
- ✅ No 500 errors
- ✅ No 401 errors
- ✅ Results display

## 🎉 Summary

**Main Problem:** Plant.id API key missing or invalid

**Solution:**
1. Get API key from https://web.plant.id/
2. Add to backend/.env
3. Restart backend
4. Test again

**Status after fix:** ✅ Should work!
