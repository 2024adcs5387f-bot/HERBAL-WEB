import { useState, useRef, useEffect } from 'react';
import './PlantScanner.css';
import { Camera, Upload, Loader2, Leaf, AlertCircle, CheckCircle, Download, Share2, Heart, History, Star, Info, BookOpen, Zap, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { identifyPlantOffline, cachePlantData } from '../../utils/offlinePlantDB';

const PlantScanner = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraLoadError, setCameraLoadError] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Load scan history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('plantScanHistory');
    const savedFavorites = localStorage.getItem('plantFavorites');
    if (savedHistory) setScanHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    
    // Check online status
    setIsOnline(navigator.onLine);
    
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check camera permission on component mount
    checkCameraPermission();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (!navigator.permissions) {
        console.log('Permissions API not supported');
        return 'unknown';
      }

      const permission = await navigator.permissions.query({ name: 'camera' });
      console.log('Camera permission status:', permission.state);
      setCameraPermission(permission.state);
      return permission.state;
    } catch (error) {
      console.log('Error checking camera permission:', error);
      return 'unknown';
    }
  };

  const requestCameraPermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported on this device. Please use the file upload option.');
        return false;
      }

      // Check if we're on HTTPS or localhost
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        setError('Camera access requires HTTPS. Please use the file upload option or access via HTTPS.');
        return false;
      }

      setError(null);
      setShowPermissionModal(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      // Permission granted - stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      setCameraPermission('granted');
      setShowPermissionModal(false);
      return true;

    } catch (error) {
      console.error('Camera permission error:', error);
      setShowPermissionModal(false);
      
      let errorMessage = 'Camera access denied. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions in your browser settings and try again.';
        setCameraPermission('denied');
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
        setCameraPermission('denied');
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported on this device.';
        setCameraPermission('denied');
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
        setCameraPermission('denied');
      } else {
        errorMessage += 'Please try using the file upload option instead.';
        setCameraPermission('denied');
      }
      
      setError(errorMessage);
      return false;
    }
  };

  const openCamera = async () => {
    try {
      setIsCameraOpen(true);
      setIsCameraLoading(true);
      setCameraLoadError('');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraLoadError('Camera not supported on this device.');
        setIsCameraLoading(false);
        return;
      }

      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        setError('Camera access requires HTTPS. Please use the file upload option or access via HTTPS.');
        return;
      }

      setError(null);
      // Try to use a specific camera if we have one selected
      let constraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      if (availableCameras.length > 0) {
        const device = availableCameras[currentCameraIndex % availableCameras.length];
        constraints.video.deviceId = { exact: device.deviceId };
      } else {
        constraints.video.facingMode = { ideal: cameraFacingMode };
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (primaryErr) {
        // Relax constraints and retry
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (fallbackErr) {
          console.error('Camera open failed:', primaryErr, fallbackErr);
          setCameraLoadError('Unable to access camera. Check permissions or if another app is using it.');
          setIsCameraLoading(false);
          return;
        }
      }
      mediaStreamRef.current = stream;
      // Wait for modal to render video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setIsCameraLoading(false);
      }, 0);

      // Enumerate devices for switching support
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(d => d.kind === 'videoinput');
        if (cameras.length > 0) {
          // Prefer environment/back cameras first if labels are available
          const sorted = cameras.sort((a, b) => {
            const al = (a.label || '').toLowerCase();
            const bl = (b.label || '').toLowerCase();
            const ascore = al.includes('back') || al.includes('rear') || al.includes('external') ? 0 : 1;
            const bscore = bl.includes('back') || bl.includes('rear') || bl.includes('external') ? 0 : 1;
            return ascore - bscore;
          });
          setAvailableCameras(sorted);
          // Reset index if out of bounds
          setCurrentCameraIndex((idx) => Math.min(idx, Math.max(sorted.length - 1, 0)));
        }
      } catch (e) {
        // ignore enumeration errors
      }
    } catch (err) {
      console.error('Error opening camera:', err);
      setCameraLoadError('Unable to access camera. Please allow permissions or use file upload.');
      setIsCameraLoading(false);
    }
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    setIsCameraLoading(false);
    setCameraLoadError('');
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
  };

  const capturePhoto = async () => {
    try {
      const video = videoRef.current;
      if (!video) return;
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      // Draw maintaining aspect ratio into target canvas size
      const vw = video.videoWidth || width;
      const vh = video.videoHeight || height;
      const videoAspect = vw / vh;
      const targetAspect = width / height;
      let drawW = width;
      let drawH = height;
      let dx = 0;
      let dy = 0;
      if (videoAspect > targetAspect) {
        // video wider than target, fit height
        drawH = height;
        drawW = height * videoAspect;
        dx = (width - drawW) / 2;
      } else {
        // video taller than target, fit width
        drawW = width;
        drawH = width / videoAspect;
        dy = (height - drawH) / 2;
      }
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(video, dx, dy, drawW, drawH);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to capture photo.');
          return;
        }
        const file = new File([blob], `plant-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage({ file, preview: e.target.result });
          setResults(null);
          setError(null);
          closeCamera();
        };
        reader.readAsDataURL(file);
      }, 'image/jpeg', 0.92);
    } catch (err) {
      console.error('Capture error:', err);
      setError('Failed to capture image from camera.');
    }
  };

  const toggleCameraFacing = async () => {
    if (availableCameras.length > 0) {
      // Cycle through actual devices
      setCurrentCameraIndex((idx) => {
        const nextIdx = (idx + 1) % availableCameras.length;
        return nextIdx;
      });
    } else {
      // Fallback to facingMode toggle
      const next = cameraFacingMode === 'environment' ? 'user' : 'environment';
      setCameraFacingMode(next);
    }
    // Restart stream with new selection
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    setTimeout(() => {
      openCamera();
    }, 50);
  };

  const handleImageUpload = (event) => {
    console.log('handleImageUpload called');
    console.log('event.target.files:', event.target.files);
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File read successfully');
        setSelectedImage({
          file,
          preview: e.target.result
        });
        setResults(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  };


  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Check if we're online
      if (!isOnline) {
        // Use offline identification
        const offlineResult = identifyPlantOffline(selectedImage.file);
        if (offlineResult.success) {
          setResults(offlineResult.data);
          // Save to scan history
          const newScan = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            image: selectedImage.preview,
            results: offlineResult.data,
            plantName: offlineResult.data.suggestions?.[0]?.plant_name || 'Unknown Plant',
            offline: true
          };
          const updatedHistory = [newScan, ...scanHistory.slice(0, 49)];
          setScanHistory(updatedHistory);
          localStorage.setItem('plantScanHistory', JSON.stringify(updatedHistory));
        } else {
          setError('Offline identification failed. Please check your internet connection.');
        }
        return;
      }

      // Online identification
      const base64Image = await convertImageToBase64(selectedImage.file);
      
      const response = await fetch('http://localhost:5000/api/ai/plant-identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: [base64Image],
          modifiers: ["crops_fast", "similar_images", "health_only", "disease_similar_images"],
          plant_details: ["common_names", "url", "name_authority", "wiki_description", "taxonomy"]
        })
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        // Cache the result for offline use
        if (data.data.suggestions?.[0]?.plant_name) {
          cachePlantData(data.data.suggestions[0].plant_name, data.data);
        }
        // Save to scan history
        const newScan = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          image: selectedImage.preview,
          results: data.data,
          plantName: data.data.suggestions?.[0]?.plant_name || 'Unknown Plant'
        };
        const updatedHistory = [newScan, ...scanHistory.slice(0, 49)]; // Keep last 50 scans
        setScanHistory(updatedHistory);
        localStorage.setItem('plantScanHistory', JSON.stringify(updatedHistory));
      } else {
        setError(data.message || 'Failed to identify plant');
      }
    } catch (err) {
      // If online request fails, try offline identification
      if (isOnline) {
        console.warn('Online identification failed, trying offline:', err);
        const offlineResult = identifyPlantOffline(selectedImage.file);
        if (offlineResult.success) {
          setResults(offlineResult.data);
          // Save to scan history
          const newScan = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            image: selectedImage.preview,
            results: offlineResult.data,
            plantName: offlineResult.data.suggestions?.[0]?.plant_name || 'Unknown Plant',
            offline: true
          };
          const updatedHistory = [newScan, ...scanHistory.slice(0, 49)];
          setScanHistory(updatedHistory);
          localStorage.setItem('plantScanHistory', JSON.stringify(updatedHistory));
        } else {
          setError('Network error and offline identification failed. Please check your connection and try again.');
        }
      } else {
      setError('Network error. Please check your connection and try again.');
      }
      console.error('Plant identification error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const toggleFavorite = (plantName) => {
    const isFavorite = favorites.includes(plantName);
    const updatedFavorites = isFavorite 
      ? favorites.filter(name => name !== plantName)
      : [...favorites, plantName];
    setFavorites(updatedFavorites);
    localStorage.setItem('plantFavorites', JSON.stringify(updatedFavorites));
  };

  const shareResult = async () => {
    if (!results) return;
    
    const plantName = results.suggestions?.[0]?.plant_name || 'Unknown Plant';
    const confidence = Math.round((results.suggestions?.[0]?.probability || 0) * 100);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Plant Identification: ${plantName}`,
          text: `I just identified a ${plantName} with ${confidence}% confidence using the Herbal Plant Scanner!`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      const text = `Plant: ${plantName}\nConfidence: ${confidence}%\nIdentified with Herbal Plant Scanner`;
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  };

  const downloadReport = () => {
    if (!results) return;
    
    const plantName = results.suggestions?.[0]?.plant_name || 'Unknown Plant';
    const confidence = Math.round((results.suggestions?.[0]?.probability || 0) * 100);
    const report = `
PLANT IDENTIFICATION REPORT
============================

Plant Name: ${plantName}
Scientific Name: ${results.suggestions?.[0]?.plant_details?.scientific_name || 'N/A'}
Confidence: ${confidence}%
Date: ${new Date().toLocaleDateString()}

DESCRIPTION:
${results.suggestions?.[0]?.plant_details?.wiki_description?.citation || 'No description available'}

MEDICINAL USES:
${results.suggestions?.[0]?.medicinal_uses?.join('\n• ') || 'No medicinal uses available'}

SAFETY INFORMATION:
${results.suggestions?.[0]?.safety_info || 'No safety information available'}

---
Report generated by Herbal Plant Scanner
    `.trim();
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plantName.replace(/\s+/g, '_')}_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="plant-scanner min-h-screen">
      <div className="plant-bg-layer" aria-hidden="true"></div>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <Leaf className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            AI Plant Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Identify plants instantly with AI-powered image recognition. Discover medicinal properties, care requirements, and more.
          </p>
          
          {/* Quick Actions */}
          <div className="flex justify-center gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              <History className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">History ({scanHistory.length})</span>
            </motion.button>
            {favorites.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-gray-700">Favorites ({favorites.length})</span>
              </motion.button>
            )}
          </div>

          {/* Status Indicators */}
          <div className="flex justify-center gap-4 mt-4">
            {/* Online/Offline Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isOnline 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Online - Full AI Analysis Available</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span>Offline - Basic Identification Only</span>
                </>
              )}
            </div>

            {/* Camera Permission Status */}
            {cameraPermission && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                cameraPermission === 'granted'
                  ? 'bg-green-100 text-green-700'
                  : cameraPermission === 'denied'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                <Camera className="h-4 w-4" />
                <span>
                  Camera: {
                    cameraPermission === 'granted' ? 'Allowed' :
                    cameraPermission === 'denied' ? 'Blocked' : 'Unknown'
                  }
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Plant Image</h2>
              
              {!selectedImage ? (
        <div className="space-y-4">
          {/* Upload Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed border-green-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-sm sm:text-base"
            >
                      <Upload className="h-10 w-10 text-green-500 mb-3" />
              <span className="text-lg font-medium text-gray-700">Upload Image</span>
              <span className="text-sm text-gray-500 mt-1">Choose from gallery</span>
            </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={openCamera}
                      className="flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed border-green-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer text-sm sm:text-base"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <Camera className="h-10 w-10 text-green-500 mb-3" />
                      <span className="text-lg font-medium text-gray-700">Use Camera</span>
                      <span className="text-sm text-gray-500 mt-1">Take photo with device camera</span>
                    </motion.button>
                    
                    {/* Test buttons */}
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => {
                          console.log('Simple test button clicked');
                          setError('Simple test button works!');
                        }}
                        className="w-full px-3 py-2 sm:py-2.5 bg-blue-500 text-white text-sm sm:text-base rounded-lg hover:bg-blue-600"
                      >
                        Test Button (Should Show Message)
                      </button>
                      
                      <button
                        onClick={() => {
                          console.log('Direct camera input test');
                          const input = document.getElementById('camera-input');
                          if (input) {
                            console.log('Found camera input, clicking...');
                            input.click();
                          } else {
                            console.error('Camera input not found');
                            setError('Camera input not found');
                          }
                        }}
                        className="w-full px-3 py-2 sm:py-2.5 bg-purple-500 text-white text-sm sm:text-base rounded-lg hover:bg-purple-600"
                      >
                        Direct Camera Input Test
                      </button>
                      
                      <button
                        onClick={() => {
                          console.log('Debug button clicked');
                          console.log('User Agent:', navigator.userAgent);
                          console.log('Is mobile:', /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
                          console.log('Is HTTPS:', location.protocol === 'https:');
                          console.log('Is localhost:', location.hostname === 'localhost' || location.hostname === '127.0.0.1');
                          setError('Check console for debug info');
                        }}
                        className="w-full px-3 py-1.5 bg-gray-500 text-white text-xs sm:text-sm rounded-lg hover:bg-gray-600"
                      >
                        Debug Info
                      </button>
                    </div>
                    
                    {/* Camera input kept for fallback on some mobile browsers */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="camera-input"
                    />
                    
                    {/* Alternative approach - direct file input */}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="camera-input-alt"
                    />
          </div>
                </div>
              ) : null}

              {/* Image Preview and Actions */}
              {selectedImage && (
            <div className="space-y-4">
          <div className="relative">
            <img
              src={selectedImage.preview}
              alt="Selected plant"
                      className="w-full max-h-[85vh] object-contain rounded-xl bg-black/5"
            />
            <button
              onClick={resetScanner}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
          <div className="flex gap-3">
            <a
              href={selectedImage.preview}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            >
              View Full Size
            </a>
          </div>
                  <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={analyzeImage}
              disabled={isAnalyzing}
                      className="flex-1 bg-green-600 text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg md:rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isAnalyzing ? (
                <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                          <Zap className="h-5 w-5" />
                  Identify Plant
                </>
              )}
            </motion.button>
            <button
              onClick={resetScanner}
                      className="px-4 sm:px-6 py-3 sm:py-3.5 border border-gray-300 text-gray-700 rounded-lg md:rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
                      Change Image
            </button>
          </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Info className="h-5 w-5" />
                Tips for Best Results
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Ensure good lighting and clear focus</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Include leaves, flowers, and distinctive features</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Avoid blurry or heavily filtered images</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Take photos from multiple angles if possible</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    <div>
                      <h3 className="font-semibold text-red-800">Error</h3>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>

            {/* Loading State */}
            {isAnalyzing && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Analyzing Your Plant
                </h3>
                <p className="text-gray-600">
                  Our AI is examining the image to identify the plant species...
                </p>
              </div>
            )}

          {/* Results */}
          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-8 w-8" />
                          <div>
                            <h2 className="text-2xl font-bold">Plant Identified!</h2>
                            <p className="text-green-100">
                              {results.offline ? 'Offline analysis complete' : 'AI analysis complete'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-6 w-6 text-yellow-300" />
                          <span className="text-2xl font-bold">
                            {Math.round((results.suggestions?.[0]?.probability || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                      {results.offline && (
                        <div className="flex items-center gap-2 text-green-100 text-sm">
                          <WifiOff className="h-4 w-4" />
                          <span>Identified using offline database</span>
                        </div>
                      )}
                </div>

                    {/* Results Content */}
                {results.suggestions && results.suggestions.length > 0 && (
                      <div className="p-6 space-y-6">
                    {results.suggestions.slice(0, 3).map((suggestion, index) => (
                          <div key={index} className={`border rounded-xl p-6 ${index === 0 ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-gray-900 mb-2">
                              {suggestion.plant_name}
                            </h4>
                            {suggestion.plant_details?.common_names && (
                                  <p className="text-gray-600 mb-2">
                                    <span className="font-medium">Common names:</span> {suggestion.plant_details.common_names.join(', ')}
                                  </p>
                                )}
                                {suggestion.plant_details?.scientific_name && (
                                  <p className="text-gray-600 italic">
                                    <span className="font-medium">Scientific name:</span> {suggestion.plant_details.scientific_name}
                              </p>
                            )}
                          </div>
                              <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {Math.round(suggestion.probability * 100)}% match
                          </span>
                                {index === 0 && (
                                  <button
                                    onClick={() => toggleFavorite(suggestion.plant_name)}
                                    className={`p-2 rounded-full transition-colors ${
                                      favorites.includes(suggestion.plant_name)
                                        ? 'bg-red-100 text-red-500'
                                        : 'bg-gray-100 text-gray-400 hover:text-red-500'
                                    }`}
                                  >
                                    <Heart className={`h-5 w-5 ${favorites.includes(suggestion.plant_name) ? 'fill-current' : ''}`} />
                                  </button>
                                )}
                              </div>
                        </div>

                        {suggestion.plant_details?.wiki_description && (
                          <div className="mb-4">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4" />
                                  Description
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed">
                              {suggestion.plant_details.wiki_description.citation}
                            </p>
                          </div>
                        )}

                        {suggestion.medicinal_uses && (
                          <div className="mb-4">
                                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Leaf className="h-4 w-4" />
                                  Medicinal Uses
                                </h5>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.medicinal_uses.map((use, useIndex) => (
                                <span
                                  key={useIndex}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                  {use}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {suggestion.safety_info && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h5 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4" />
                                  Safety Information
                                </h5>
                            <p className="text-yellow-800 text-sm">{suggestion.safety_info}</p>
                          </div>
                        )}

                            {suggestion.identification_features && (
                              <div className="mb-4">
                                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Info className="h-4 w-4" />
                                  Identification Features
                                </h5>
                                <ul className="space-y-1">
                                  {suggestion.identification_features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                      </div>
                    ))}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={downloadReport}
                            className="flex-1 bg-gray-600 text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg md:rounded-xl font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                          >
                            <Download className="h-5 w-5" />
                            Download Report
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={shareResult}
                            className="flex-1 bg-green-600 text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg md:rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                          >
                            <Share2 className="h-5 w-5" />
                            Share Result
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>

                <div className="text-center">
                  <button
                    onClick={resetScanner}
                      className="px-6 sm:px-8 py-3 sm:py-3.5 bg-gray-600 text-white rounded-lg md:rounded-xl hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base"
                  >
                    Scan Another Plant
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

            {/* Placeholder when no image */}
            {!selectedImage && !results && !isAnalyzing && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to Identify
                </h3>
                <p className="text-gray-600">
                  Upload a plant image to get started with AI-powered identification
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Camera Permission Modal */}
        <AnimatePresence>
          {showPermissionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowPermissionModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Camera Permission Required</h2>
                  <p className="text-gray-600 mb-6">
                    This app needs access to your camera to take photos for plant identification. 
                    Please allow camera access when prompted by your browser.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Click "Allow" when your browser asks for camera permission</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Make sure you're on HTTPS or localhost</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Check browser settings if permission is blocked</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPermissionModal(false)}
                    className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Live Camera - Fullscreen Clear UI */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] bg-black"
          >
            {/* Video area: fixed size (6000x400) centered; scroll if overflow */}
            <div className="absolute inset-0 flex items-center justify-center overflow-auto">
              <div className="relative" style={{ width: '6000px', height: '400px' }}>
                <video
                  ref={videoRef}
                  style={{ width: '6000px', height: '400px' }}
                  className="bg-black object-cover"
                  playsInline
                  muted
                  autoPlay
                  onLoadedMetadata={() => {
                    try { videoRef.current && videoRef.current.play(); } catch (_) {}
                  }}
                />
                {/* Overlay controls on the capturing screen */}
                <div className="absolute left-0 right-0 bottom-3 flex items-center justify-center gap-6 px-4">
                  <button
                    onClick={closeCamera}
                    className="inline-flex px-5 h-12 rounded-full bg-white/15 text-white font-medium backdrop-blur-sm border border-white/25 hover:bg-white/25 transition items-center justify-center"
                    title="Close"
                    aria-label="Close camera"
                  >
                    Close
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="inline-flex px-6 h-12 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 shadow-lg transition items-center justify-center"
                    title="Capture"
                    aria-label="Capture photo"
                  >
                    Capture
                  </button>
                </div>
              </div>
            </div>

            {/* Loading / Error overlays */}
            {isCameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm text-sm">
                  Opening camera...
                </div>
              </div>
            )}
            {!!cameraLoadError && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-3">
                  <div className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 backdrop-blur-sm text-sm">
                    {cameraLoadError}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={openCamera}
                      className="px-4 py-2 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => {
                        closeCamera();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition"
                    >
                      Use File Upload
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Top bar controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
              <button
                onClick={closeCamera}
                className="px-4 py-2 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition"
              >
                Close
              </button>
              <div className="text-white text-sm opacity-80">
                {cameraFacingMode === 'environment' ? 'Rear Camera' : 'Front Camera'}
              </div>
              <button
                onClick={toggleCameraFacing}
                className="px-4 py-2 rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition"
              >
                Switch
              </button>
            </div>

            {/* Removed bottom-of-screen controls; controls now overlay on video */}
          </motion.div>
        )}
      </AnimatePresence>

        {/* Scan History Modal */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Scan History</h2>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                {scanHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No scan history yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scanHistory.map((scan) => (
                      <div key={scan.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <img
                            src={scan.image}
                            alt={scan.plantName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{scan.plantName}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(scan.timestamp).toLocaleDateString()} at {new Date(scan.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedImage({ preview: scan.image });
                              setResults(scan.results);
                              setShowHistory(false);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default PlantScanner;
