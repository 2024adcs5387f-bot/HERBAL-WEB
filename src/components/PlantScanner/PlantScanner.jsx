import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Leaf, AlertCircle, CheckCircle, X, History, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlantComparisonTable from './PlantComparisonTable';
import PlantHistory, { saveToHistory } from './PlantHistory';
import ShareResults from './ShareResults';
import AudioAssistant from './AudioAssistant';

const PlantScanner = ({ onResultsChange, onAnalyzingChange, onErrorChange }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const compressImage = (file, maxWidth = 400, maxHeight = 200) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions maintaining aspect ratio
          // Only resize if image is larger than max dimensions
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Use lower quality for better compression
          canvas.toBlob((blob) => {
            resolve({
              blob,
              preview: canvas.toDataURL('image/jpeg', 0.7)
            });
          }, 'image/jpeg', 0.7);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const compressed = await compressImage(file);
      setSelectedImage({
        file: new File([compressed.blob], file.name, { type: 'image/jpeg' }),
        preview: compressed.preview
      });
      setError(null);
      setResults(null);
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
      const base64Image = await convertImageToBase64(selectedImage.file);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiBaseUrl}/api/ai/plant-identify`, {
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
      
      console.log('API Response:', data); // Debug log
      console.log('Response status:', response.status); // Debug log
      console.log('Data success:', data.success); // Debug log
      console.log('Data.data:', data.data); // Debug log

      // Check if response was successful
      if (!response.ok || !data.success) {
        // Handle error response
        const errorMessage = data.message || data.error || 'Failed to identify plant';
        
        console.log('Error message:', errorMessage); // Debug log
        
        if (errorMessage.includes('NOT A PLANT') || 
            errorMessage.includes('not a plant') || 
            errorMessage.includes('No plant') ||
            errorMessage.includes('does not contain plant material') ||
            errorMessage.includes('No plant material detected')) {
          setError('🚫 NOT A PLANT DETECTED\n\nThis image does not contain plant material. We can only identify:\n✅ Roots\n✅ Stems\n✅ Leaves\n✅ Flowers\n✅ Seeds\n✅ Bark\n\n❌ We cannot identify:\n• Animals (dogs, cats, birds, etc.)\n• People\n• Objects\n• Food (unless it\'s a plant)\n• Buildings or landscapes\n\nPlease upload a clear photo of a plant.');
        } else if (errorMessage.includes('UNCLEAR IMAGE') || errorMessage.includes('confidence') || errorMessage.includes('clearer')) {
          setError('🔍 UNCLEAR IMAGE\n\nThe image quality is too low to identify the plant. Please:\n• Use better lighting\n• Focus on the plant\n• Show clear plant parts (leaves, flowers, stems)\n• Avoid blurry or dark images\n• Take photo from closer distance');
        } else if (errorMessage.includes('size')) {
          setError('📏 IMAGE SIZE ISSUE\n\nImage must be between 10KB and 10MB.\n• Compress large images\n• Use higher quality for small images');
        } else {
          setError(errorMessage);
        }
        return; // Stop processing
      }

      // Success - set results
      console.log('✅ SUCCESS - Setting results:', data.data); // Debug log
      console.log('✅ Data structure:', JSON.stringify(data.data, null, 2)); // Debug log
      
      setResults(data.data);
      setShowFeedback(true);
      setFeedbackSubmitted(false);
      
      console.log('✅ Results state updated'); // Debug log
      console.log('✅ showFeedback set to TRUE'); // Debug log
      
      // Save to history
      if (data.data.suggestions && data.data.suggestions.length > 0) {
        const topSuggestion = data.data.suggestions[0];
        saveToHistory({
          plant_name: topSuggestion.plant_name,
          scientific_name: topSuggestion.plant_details?.scientific_name || topSuggestion.scientific_name,
          probability: topSuggestion.probability,
          description: topSuggestion.plant_details?.wiki_description?.citation,
          medicinal_uses: topSuggestion.medicinal_uses || [],
          safety_info: topSuggestion.safety_info,
          is_verified: topSuggestion.is_verified || false,
          cache_hit_count: data.data.cache_hit_count || 0,
          image_url: selectedImage?.preview || null
        });
        console.log('✅ Saved to history');
      }
      
      // Small delay to ensure state is set
      setTimeout(() => {
        console.log('✅ After timeout - results:', results);
        console.log('✅ After timeout - showFeedback:', showFeedback);
      }, 100);

      // Fetch comparison data
      if (data.data.suggestions && data.data.suggestions.length > 0) {
        console.log('✅ Fetching comparison for:', data.data.suggestions[0].plant_name);
        fetchComparisonData(data.data.suggestions[0]);
      } else {
        console.warn('⚠️ No suggestions found in data.data');
      }
    } catch (err) {
      setError('🌐 Network error. Please check your connection and try again.');
      console.error('Plant identification error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchComparisonData = async (plantSuggestion) => {
    try {
      setIsLoadingComparison(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiBaseUrl}/api/plant-data/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plant_name: plantSuggestion.plant_name,
          description: plantSuggestion.plant_details?.wiki_description?.citation || '',
          scientific_name: plantSuggestion.plant_details?.scientific_name || ''
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setComparisonData(data.data);
        console.log('Comparison data loaded:', data.data);
      }
    } catch (err) {
      console.error('Comparison fetch error:', err);
    } finally {
      setIsLoadingComparison(false);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setResults(null);
    setError(null);
    setShowFeedback(false);
    setFeedbackSubmitted(false);
    setComparisonData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    stopCamera();
  };

  const submitFeedback = async (isCorrect, correctPlantName = null) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      // Get identification ID from results
      const identificationId = results?.identification_id || 'unknown';
      
      const response = await fetch(`${apiBaseUrl}/api/ai/plant-identify-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identification_id: identificationId,
          is_correct: isCorrect,
          correct_plant_name: correctPlantName
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setFeedbackSubmitted(true);
        console.log('Feedback submitted successfully');
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions or try uploading an image instead.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Create file object
    const file = dataURLtoFile(imageDataUrl, 'camera-capture.jpg');
    
    setSelectedImage({
      file,
      preview: imageDataUrl
    });
    setResults(null);
    setError(null);
    
    // Stop camera after capture
    stopCamera();
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Debug: Track results changes
  useEffect(() => {
    console.log('🔄 Results changed:', results);
    console.log('🔄 Has suggestions:', results?.suggestions);
    console.log('🔄 Suggestions length:', results?.suggestions?.length);
  }, [results]);

  // Debug: Track showFeedback changes
  useEffect(() => {
    console.log('🔄 showFeedback changed:', showFeedback);
  }, [showFeedback]);

  // Notify parent component of state changes
  useEffect(() => {
    if (onResultsChange) onResultsChange(results);
  }, [results, onResultsChange]);

  useEffect(() => {
    if (onAnalyzingChange) onAnalyzingChange(isAnalyzing);
  }, [isAnalyzing, onAnalyzingChange]);

  useEffect(() => {
    if (onErrorChange) onErrorChange(error);
  }, [error, onErrorChange]);

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Left Column - Upload Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Upload Plant Image</h2>
          
          {!selectedImage ? (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-8 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors duration-200">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Drop your image here
                </h3>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                  or click to browse from your device
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-primary"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Choose File
                  </button>
                  <button
                    onClick={startCamera}
                    className="btn btn-outline"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Use Camera
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {/* Hidden canvas for image capture */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Tips */}
              <div className="space-y-3">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                  <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Plants Only
                  </h4>
                  <p className="text-base text-green-800 dark:text-green-200">
                    This system identifies <strong>plants only</strong>. Please ensure your image clearly shows a plant with visible leaves, flowers, stems, or other plant features.
                  </p>
                </div>
                
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Tips for Best Results</h4>
                  <ul className="text-base text-neutral-700 dark:text-neutral-300 space-y-1 list-none">
                    <li>Ensure good lighting and clear focus</li>
                    <li>Include leaves, flowers, or distinctive features</li>
                    <li>Avoid blurry or heavily filtered images</li>
                    <li>Take photos from multiple angles if possible</li>
                    <li>Avoid photos with multiple plants (focus on one)</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage.preview}
                  alt="Selected plant"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={resetScanner}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="flex-1 btn btn-primary"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Leaf className="mr-2 h-5 w-5" />
                      Identify Plant
                    </>
                  )}
                </button>
                <button
                  onClick={resetScanner}
                  className="btn btn-outline"
                >
                  Change Image
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-2xl w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Capture Plant Photo
                </h3>
                <button
                  onClick={stopCamera}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>
              
              <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 btn btn-primary"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4 text-center">
                Position the plant in the frame and click capture
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Column - Results Section */}
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
              className="bg-red-100 dark:bg-red-500/20 border-2 border-red-600 dark:border-red-500 rounded-xl p-6 shadow-xl backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(254, 202, 202, 0.95)' }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-8 w-8 text-red-700 dark:text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Error</h3>
                  <p className="text-base text-red-900 dark:text-red-100 whitespace-pre-line leading-relaxed font-medium">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyzing State */}
        {isAnalyzing && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin" />
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
              Analyzing Your Plant
            </h3>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
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
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-lg text-green-700 dark:text-green-300 font-medium">Plant identified successfully!</span>
                </div>
                <button
                  onClick={() => {
                    setShareData(results.suggestions[0]);
                    setIsShareOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="font-medium">Share</span>
                </button>
              </div>

              {results.suggestions && results.suggestions.length > 0 ? (
                <div className="space-y-4">
                  {results.suggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                            {suggestion.plant_name}
                          </h4>
                          {suggestion.plant_details?.common_names && (
                            <p className="text-neutral-600 dark:text-neutral-400 text-base">
                              Common names: {suggestion.plant_details.common_names.join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-full text-base font-medium">
                          {Math.round(suggestion.probability * 100)}% match
                        </span>
                      </div>

                      {suggestion.plant_details?.wiki_description && (
                        <div className="mb-4">
                          <h5 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Description</h5>
                          <p className="text-neutral-700 dark:text-neutral-300 text-base">
                            {suggestion.plant_details.wiki_description.citation}
                          </p>
                        </div>
                      )}

                      {suggestion.medicinal_uses && (
                        <div className="mb-4">
                          <h5 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Medicinal Uses</h5>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.medicinal_uses.map((use, useIndex) => (
                              <span
                                key={useIndex}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-base"
                              >
                                {use}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {suggestion.safety_info && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                          <h5 className="text-lg font-medium text-yellow-900 dark:text-yellow-200 mb-1">Safety Information</h5>
                          <p className="text-yellow-800 dark:text-yellow-300 text-base">{suggestion.safety_info}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
                  <h4 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    No Plant Suggestions Found
                  </h4>
                  <p className="text-base text-yellow-800 dark:text-yellow-200">
                    The AI couldn't identify this plant with confidence. Please try a clearer image.
                  </p>
                </div>
              )}

              {/* Feedback Section */}
              {showFeedback && !feedbackSubmitted && results?.suggestions?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 shadow-lg"
                >
                  <h4 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                    Was this identification correct?
                  </h4>
                  <p className="text-base text-neutral-600 dark:text-neutral-400 mb-4">
                    Your feedback helps improve our AI accuracy
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => submitFeedback(true)}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Yes, Correct
                    </button>
                    <button
                      onClick={() => {
                        const correctName = prompt('What is the correct plant name?');
                        if (correctName) {
                          submitFeedback(false, correctName);
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="h-5 w-5" />
                      No, Incorrect
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Feedback Submitted */}
              {feedbackSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6 text-center"
                >
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                  <h4 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                    Thank You!
                  </h4>
                  <p className="text-base text-green-800 dark:text-green-200">
                    Your feedback has been recorded and will help improve our plant identification system.
                  </p>
                </motion.div>
              )}

              {/* Scan Again Button */}
              <div className="text-center mt-12 mb-20 px-8">
                <button
                  onClick={resetScanner}
                  className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-110 font-bold text-lg mx-auto border-2 border-white/20"
                >
                  <Camera className="h-6 w-6" />
                  <span>Scan Again</span>
                </button>
              </div>

              {/* Extra spacing for clear view - Large bottom padding */}
              <div className="h-96 pb-32"></div>

            </motion.div>
          )}
        </AnimatePresence>


        {/* Plant Comparison Table */}
        {results && comparisonData && (
          <PlantComparisonTable 
            comparisonData={comparisonData}
            identifiedPlant={results.suggestions?.[0]}
          />
        )}

        {/* Loading Comparison */}
        {isLoadingComparison && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center mt-6">
            <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Comparing with database plants...
            </p>
          </div>
        )}

        {/* Placeholder when no image */}
        {!selectedImage && !results && !isAnalyzing && !error && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
              Ready to Identify
            </h3>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Upload a plant image to get started with identification
            </p>
          </div>
        )}
      </motion.div>

      {/* Share Modal */}
      {isShareOpen && shareData && (
        <ShareResults
          plantData={shareData}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
};

export default PlantScanner;
