# Plant Scanner - Setup & Usage Guide

## ✅ What Was Done

### 1. **Consolidated Implementation**
- Removed duplicate Plant Scanner code
- Kept the component version with backend integration at `src/components/PlantScanner/PlantScanner.jsx`
- Updated the page at `src/pages/PlantScanner.jsx` to import and render the component
- Page now provides the header/layout, component handles the scanner functionality

### 2. **Environment Configuration**
- Created `.env.example` with API base URL configuration
- Updated component to use `import.meta.env.VITE_API_BASE_URL` (Vite environment variable)
- Falls back to `http://localhost:5000` if not set
- Updated README.md with frontend environment setup instructions

### 3. **Features Implemented**
- ✅ Image upload from device
- ✅ Camera capture (mobile-friendly with `capture="environment"`)
- ✅ Backend API integration (`/api/ai/plant-identify`)
- ✅ Base64 image conversion
- ✅ Loading states with animations
- ✅ Error handling with user-friendly messages
- ✅ Success state with plant identification results
- ✅ Dark mode support throughout
- ✅ Responsive design (mobile & desktop)
- ✅ Framer Motion animations

## 🚀 Setup Instructions

### 1. Create Environment File
Create a `.env.local` file in the root directory (`HERBAL-WEB/`):

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
```

**Note:** `.env.local` is gitignored, so you need to create it manually. Use `.env.example` as a template.

### 2. Ensure Backend is Running
The Plant Scanner requires the backend API to be running at `http://localhost:5000` (or your configured URL).

Make sure:
- Backend server is running (`cd backend && npm run dev`)
- Plant.id API key is configured in backend `.env`
- CORS is enabled for your frontend URL

### 3. Start Frontend
```bash
npm run dev
```

Visit `http://localhost:5173` and navigate to the Plant Scanner page.

## 📋 API Integration

### Endpoint
```
POST /api/ai/plant-identify
```

### Request Format
```json
{
  "images": ["base64_encoded_image_string"],
  "modifiers": ["crops_fast", "similar_images", "health_only", "disease_similar_images"],
  "plant_details": ["common_names", "url", "name_authority", "wiki_description", "taxonomy"]
}
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "plant_name": "Plant Name",
        "probability": 0.95,
        "plant_details": {
          "common_names": ["Name 1", "Name 2"],
          "wiki_description": {
            "citation": "Description text..."
          }
        },
        "medicinal_uses": ["Use 1", "Use 2"],
        "safety_info": "Safety information..."
      }
    ]
  }
}
```

## 🎨 Component Structure

```
PlantScanner (Page)
└── PlantScannerComponent
    ├── Upload Section (Left Column)
    │   ├── File Upload Button
    │   ├── Camera Capture Button
    │   ├── Image Preview
    │   └── Tips Section
    └── Results Section (Right Column)
        ├── Error Display
        ├── Loading State
        ├── Success Message
        ├── Plant Identification Results
        └── Placeholder State
```

## 🔧 Customization

### Change API URL
Edit `.env.local`:
```env
VITE_API_BASE_URL=https://your-production-api.com
```

### Modify Request Parameters
Edit `src/components/PlantScanner/PlantScanner.jsx`, line 56-59:
```javascript
body: JSON.stringify({
  images: [base64Image],
  modifiers: ["crops_fast", "similar_images"],  // Customize modifiers
  plant_details: ["common_names", "url"]        // Customize details
})
```

### Styling
The component uses Tailwind CSS with dark mode support. Key classes:
- `dark:bg-neutral-800` - Dark mode backgrounds
- `btn btn-primary` - Primary button style
- `btn btn-outline` - Outline button style

## 🐛 Troubleshooting

### "Network error" message
- **Check:** Backend server is running
- **Check:** API URL in `.env.local` is correct
- **Check:** CORS is enabled in backend for your frontend URL

### Camera not working
- **Mobile:** Ensure HTTPS or localhost (camera requires secure context)
- **Desktop:** Browser may not support camera capture on desktop

### Images not uploading
- **Check:** File size limits in backend
- **Check:** Image format is supported (jpg, png, etc.)
- **Check:** Base64 conversion is working (check browser console)

### Dark mode not working
- **Check:** Your app has dark mode toggle implemented
- **Check:** Tailwind dark mode is configured in `tailwind.config.js`

## 📱 Mobile Support

The Plant Scanner is fully mobile-responsive:
- Touch-friendly buttons
- Camera capture with `capture="environment"` (uses rear camera)
- Responsive grid layout (stacks on mobile)
- Optimized image preview sizes

## 🔐 Security Notes

- Images are converted to base64 before sending to backend
- No images are stored in frontend localStorage
- API calls use environment variables (not hardcoded URLs)
- Backend should validate and sanitize all inputs

## 📝 Future Enhancements

Potential improvements:
- [ ] Add image compression before upload
- [ ] Support multiple image uploads
- [ ] Save scan history to user account
- [ ] Add plant comparison feature
- [ ] Export results as PDF
- [ ] Share results on social media
- [ ] Offline mode with cached results

---

**Status:** ✅ Fully functional and ready to use!
