# 🔧 Complete Troubleshooting Guide - Plant Identification System

## Table of Contents
1. [Results Not Displaying](#results-not-displaying)
2. [Camera Not Working](#camera-not-working)
3. [Error Messages Not Showing](#error-messages-not-showing)
4. [API Connection Issues](#api-connection-issues)
5. [Database Issues](#database-issues)
6. [Performance Problems](#performance-problems)
7. [Common Errors](#common-errors)

---

## 1. Results Not Displaying

### Symptoms
- Image analyzed but no results shown
- Loading spinner disappears but screen blank
- No plant information displayed

### Debug Steps

#### Step 1: Check Browser Console
```javascript
// Press F12 → Console tab
// Look for these logs:
API Response: {...}
Data success: true/false
Setting results: {...}
```

#### Step 2: Verify API Response
```javascript
// Check Network tab
// Find: /api/ai/plant-identify
// Response should be:
{
  "success": true,
  "data": {
    "suggestions": [...]
  }
}
```

#### Step 3: Check Debug UI
In development mode, gray box shows:
- Results: YES/NO
- Has suggestions: YES/NO
- Suggestions count: number

### Solutions

**Solution 1: Clear State**
```javascript
// In component, add:
useEffect(() => {
  console.log('Results changed:', results);
}, [results]);
```

**Solution 2: Verify Data Structure**
```javascript
// Backend should return:
res.json({
  success: true,
  data: {
    suggestions: [...]
  }
});

// Frontend expects:
data.data.suggestions
```

**Solution 3: Check Conditional Rendering**
```jsx
{results && results.suggestions && results.suggestions.length > 0 && (
  // Results display
)}
```

---

## 2. Camera Not Working

### Symptoms
- "Use Camera" button doesn't respond
- Camera permission denied
- Black screen in camera modal
- Camera doesn't open

### Debug Steps

#### Check Browser Permissions
```
Chrome: Settings → Privacy → Site Settings → Camera
Firefox: about:preferences#privacy → Permissions → Camera
Edge: Settings → Cookies and site permissions → Camera
```

#### Check HTTPS Requirement
Camera API requires:
- ✅ `https://` URL
- ✅ `localhost` (development)
- ❌ `http://` (production)

### Solutions

**Solution 1: Grant Camera Permission**
1. Click camera icon in address bar
2. Select "Allow"
3. Reload page

**Solution 2: Check Browser Support**
```javascript
// Test in console:
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => console.log('Camera works!'))
  .catch(err => console.error('Camera error:', err));
```

**Solution 3: Use File Upload Instead**
If camera fails, use "Choose File" button as fallback

**Solution 4: Mobile Camera**
```javascript
// Ensure facingMode is set:
video: { 
  facingMode: 'environment' // Back camera
}
```

---

## 3. Error Messages Not Showing

### Symptoms
- Errors occur but no message displayed
- Red error box doesn't appear
- Console shows errors but UI doesn't

### Debug Steps

#### Check Error State
```javascript
// In console:
// After error occurs, check:
console.log('Error state:', error);
```

#### Verify Error Handling
```javascript
// Backend should return:
res.status(500).json({
  success: false,
  message: "Actual error message"
});
```

### Solutions

**Solution 1: Check Response Status**
```javascript
if (!response.ok || !data.success) {
  const errorMessage = data.message || data.error || 'Failed';
  setError(errorMessage);
}
```

**Solution 2: Add Error Boundary**
```jsx
<AnimatePresence>
  {error && (
    <motion.div className="error-box">
      {error}
    </motion.div>
  )}
</AnimatePresence>
```

**Solution 3: Backend Error Format**
```javascript
// Ensure backend returns:
catch (error) {
  res.status(500).json({
    success: false,
    message: error.message // Pass actual error
  });
}
```

---

## 4. API Connection Issues

### Symptoms
- "Network error" message
- API requests fail
- CORS errors
- Timeout errors

### Debug Steps

#### Check Backend Running
```bash
# Terminal should show:
🚀 Server running on port 5000
```

#### Check API URL
```javascript
// Frontend .env.local
VITE_API_BASE_URL=http://localhost:5000

// Verify in console:
console.log(import.meta.env.VITE_API_BASE_URL);
```

#### Test API Directly
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"OK"}
```

### Solutions

**Solution 1: Start Backend**
```bash
cd backend
npm run dev
```

**Solution 2: Fix CORS**
```javascript
// backend/server.js
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
```

**Solution 3: Check Firewall**
- Allow port 5000
- Disable antivirus temporarily
- Check Windows Firewall settings

**Solution 4: Environment Variables**
```bash
# Restart after changing .env files
# Frontend: Ctrl+C then npm run dev
# Backend: Ctrl+C then npm run dev
```

---

## 5. Database Issues

### Symptoms
- "Supabase connection failed"
- Cache not working
- Feedback not saving
- No history data

### Debug Steps

#### Test Supabase Connection
```javascript
// In backend console:
import { supabase } from './config/supabase.js';
const { data, error } = await supabase.from('plant_identifications').select('*').limit(1);
console.log('Supabase test:', data, error);
```

#### Check Environment Variables
```bash
# backend/.env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
```

#### Verify Tables Exist
```sql
-- Run in Supabase SQL Editor:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Solutions

**Solution 1: Run SQL Scripts**
```sql
-- In Supabase SQL Editor:
-- Run: backend/scripts/supabase-ai-tables.sql
-- Run: backend/scripts/add-feedback-table.sql
```

**Solution 2: Check RLS Policies**
```sql
-- Verify policies exist:
SELECT * FROM pg_policies 
WHERE tablename = 'plant_identifications';
```

**Solution 3: Regenerate API Keys**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy new keys
4. Update `.env` file
5. Restart backend

**Solution 4: Check Service Role**
```javascript
// Use service role for admin operations:
import { supabaseAdmin } from './config/supabase.js';
```

---

## 6. Performance Problems

### Symptoms
- Slow identification
- Long loading times
- UI freezes
- High memory usage

### Debug Steps

#### Check Network Speed
```javascript
// In console:
console.time('API Call');
// Upload image
console.timeEnd('API Call');
```

#### Monitor Cache Hit Rate
```sql
-- In Supabase:
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN cache_hit_count > 0 THEN 1 ELSE 0 END) as cached
FROM plant_identifications;
```

### Solutions

**Solution 1: Optimize Images**
```javascript
// Resize before upload:
function resizeImage(base64, maxWidth = 800) {
  // Implementation in code
}
```

**Solution 2: Enable Caching**
```javascript
// Verify cache is working:
console.log('Cache result:', cacheResult);
```

**Solution 3: Reduce Image Quality**
```javascript
canvas.toDataURL('image/jpeg', 0.8); // 80% quality
```

**Solution 4: Use Batch Processing**
```javascript
// For multiple images:
POST /api/ai/plant-identify-batch
```

---

## 7. Common Errors

### Error: "Plant.id API key not configured"

**Cause:** Missing API key

**Solution:**
```bash
# Add to backend/.env:
PLANT_ID_API_KEY=your_key_here
```

### Error: "No plant detected in image"

**Cause:** Non-plant image uploaded

**Solution:**
- Upload image with visible plant parts
- Ensure good lighting
- Focus on leaves, flowers, or stems

### Error: "Image size should be between 10KB and 10MB"

**Cause:** Image too small or too large

**Solution:**
```javascript
// Resize image before upload
// Or compress large images
```

### Error: "Unable to access camera"

**Cause:** Permission denied or HTTPS required

**Solution:**
1. Grant camera permission
2. Use HTTPS or localhost
3. Try file upload instead

### Error: "Network error"

**Cause:** Backend not running or wrong URL

**Solution:**
```bash
# Check backend is running:
curl http://localhost:5000/api/health

# Verify VITE_API_BASE_URL in .env.local
```

### Error: "Failed to record feedback"

**Cause:** Feedback table doesn't exist

**Solution:**
```sql
-- Run in Supabase:
-- backend/scripts/add-feedback-table.sql
```

---

## 🔍 Diagnostic Checklist

### Before Starting
- [ ] Node.js installed (v16+)
- [ ] npm packages installed
- [ ] Environment variables set
- [ ] Supabase project created
- [ ] Plant.id API key obtained

### Backend Checks
- [ ] Backend server running
- [ ] Port 5000 accessible
- [ ] No errors in terminal
- [ ] API health endpoint works
- [ ] Database connected

### Frontend Checks
- [ ] Frontend server running
- [ ] Port 5173 accessible
- [ ] No console errors
- [ ] API URL configured
- [ ] Camera permissions granted

### Database Checks
- [ ] Tables created
- [ ] RLS policies enabled
- [ ] Sample data exists
- [ ] Indexes created
- [ ] Triggers working

### API Checks
- [ ] Plant.id key valid
- [ ] Supabase keys valid
- [ ] CORS configured
- [ ] Rate limits not exceeded
- [ ] Network connection stable

---

## 🚀 Quick Fixes

### Fix 1: Complete Reset
```bash
# Stop all servers
Ctrl+C (both terminals)

# Clear node_modules
rm -rf node_modules
rm -rf backend/node_modules

# Reinstall
npm install
cd backend && npm install

# Restart
npm run dev (frontend)
cd backend && npm run dev (backend)
```

### Fix 2: Clear Browser Data
```
Chrome: Ctrl+Shift+Delete
- Clear cache
- Clear cookies
- Reload page
```

### Fix 3: Reset Database
```sql
-- In Supabase SQL Editor:
DROP TABLE IF EXISTS plant_identifications CASCADE;
DROP TABLE IF EXISTS plant_identification_feedback CASCADE;

-- Then re-run SQL scripts
```

### Fix 4: Check Logs
```bash
# Backend logs:
cd backend
npm run dev
# Watch for errors

# Frontend logs:
# Open browser console (F12)
# Check for errors
```

---

## 📞 Getting Help

### Information to Provide

When asking for help, include:

1. **Error Message**
   ```
   Exact error text from console
   ```

2. **Browser Console Output**
   ```javascript
   // Copy all relevant logs
   ```

3. **Network Tab**
   - Request URL
   - Response status
   - Response body

4. **Environment**
   - OS: Windows/Mac/Linux
   - Browser: Chrome/Firefox/Edge
   - Node version: `node --version`
   - npm version: `npm --version`

5. **Steps to Reproduce**
   1. Step 1
   2. Step 2
   3. Error occurs

---

## ✅ Verification Tests

### Test 1: Basic Upload
```
1. Upload plant image
2. Click "Identify Plant"
3. ✅ Results display
```

### Test 2: Camera Capture
```
1. Click "Use Camera"
2. ✅ Camera opens
3. Click "Capture"
4. ✅ Image captured
5. Click "Identify Plant"
6. ✅ Results display
```

### Test 3: Error Handling
```
1. Upload non-plant image
2. Click "Identify Plant"
3. ✅ Error message shows
4. ❌ No results display
```

### Test 4: Feedback System
```
1. Identify plant successfully
2. ✅ Feedback buttons appear
3. Click "Yes, Correct"
4. ✅ Thank you message shows
```

### Test 5: Cache Performance
```
1. Upload same image twice
2. First time: ~2-5 seconds
3. Second time: ~10-50ms
4. ✅ Cache working
```

---

## 🎯 Success Indicators

System is working correctly when:

- ✅ Camera opens on button click
- ✅ Images upload successfully
- ✅ Analysis completes in reasonable time
- ✅ Results display with plant information
- ✅ Error messages show when needed
- ✅ Feedback system works
- ✅ Cache improves performance
- ✅ No console errors

---

**Last Updated:** 2025-10-01
**Version:** 1.0.0
