# 🚨 QUICK FIX - 401 Error (Invalid API Key)

## Problem
```
Error: Request failed with status code 401
Status: 500 Internal Server Error
```

## Cause
**Plant.id API key is missing or invalid**

## ✅ Solution (5 Minutes)

### Step 1: Get API Key (2 min)
1. Go to: **https://web.plant.id/**
2. Click **"Sign Up"** (free account)
3. Verify your email
4. Go to **Dashboard**
5. Copy your **API Key**

### Step 2: Add to .env File (1 min)
1. Open: `backend/.env`
2. Add this line:
```env
PLANT_ID_API_KEY=paste_your_key_here
```

### Step 3: Restart Backend (1 min)
```bash
# In backend terminal
# Press Ctrl+C to stop
npm run dev
```

### Step 4: Test (1 min)
1. Upload a plant image
2. Click "Identify Plant"
3. ✅ Should work now!

## 🔍 Verify It's Fixed

### Check Backend Terminal
Should see:
```
✅ Plant.id API Key: Set
🚀 Server running on port 5000
```

### Check Browser Console
Should see:
```
✅ SUCCESS - Setting results: {...}
✅ Results state updated
```

## 🎯 Quick Test

Run this command:
```bash
cd backend
node check-env.js
```

Should show:
```
✅ Plant.id API Key: Set
✅ Supabase URL: Set
✅ All required environment variables are set!
```

## ❌ Still Not Working?

### Check 1: API Key Copied Correctly
- No extra spaces
- Complete key copied
- Quotes not needed

### Check 2: .env File Location
- Must be in `backend/.env`
- Not `backend/.env.example`
- Not root `.env`

### Check 3: Backend Restarted
- Stop with Ctrl+C
- Start with `npm run dev`
- Wait for "Server running" message

## 📋 Complete .env Template

```env
# REQUIRED - Get from https://web.plant.id/
PLANT_ID_API_KEY=your_actual_key_here

# REQUIRED - Get from https://supabase.com/
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Optional
OPENAI_API_KEY=your_openai_key
```

## ✅ Success Checklist

- [ ] API key obtained from Plant.id
- [ ] Added to backend/.env file
- [ ] Backend restarted
- [ ] No errors in terminal
- [ ] Test upload works
- [ ] Results display

## 🎉 Done!

After following these steps, the 401 error should be gone and plant identification should work!

---

**Need more help?** See `ERROR_FIX_GUIDE.md` for detailed troubleshooting.
