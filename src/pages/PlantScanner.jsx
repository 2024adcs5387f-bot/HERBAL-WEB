import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Search, 
  Leaf, 
  Info, 
  Download,
  Share2,
  BookOpen,
  Star,
  AlertCircle
} from 'lucide-react';

const PlantScanner = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target.result);
          setError(null);
          setScanResult(null);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select a valid image file.');
      }
    }
  };

  const handleCameraCapture = () => {
    // Implement camera capture functionality
    console.log('Camera capture not implemented yet');
  };

  const analyzePlant = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate API call to Plant.id or similar service
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock result - replace with actual API response
      const mockResult = {
        plant: {
          name: 'Common Dandelion',
          scientificName: 'Taraxacum officinale',
          family: 'Asteraceae',
          commonNames: ['Dandelion', 'Lion\'s Tooth', 'Puffball'],
          description: 'A perennial herbaceous plant native to Eurasia and North America. Known for its bright yellow flowers and distinctive seed heads.',
          medicinalUses: [
            'Liver and digestive health support',
            'Natural diuretic properties',
            'Rich in vitamins A, C, and K',
            'Traditional use for skin conditions',
            'Supports immune system function'
          ],
          activeCompounds: [
            'Taraxacin',
            'Inulin',
            'Flavonoids',
            'Triterpenes',
            'Vitamins and minerals'
          ],
          growingConditions: 'Prefers full sun to partial shade, well-drained soil, commonly found in lawns, gardens, and disturbed areas.',
          toxicity: 'Generally safe when consumed in moderation. Avoid if allergic to Asteraceae family plants.',
          image: selectedImage
        },
        confidence: 0.94,
        alternatives: [
          'Cat\'s Ear (Hypochaeris radicata)',
          'Hawkweed (Hieracium spp.)',
          'Sow Thistle (Sonchus spp.)'
        ]
      };

      setScanResult(mockResult);
    } catch (err) {
      setError('Failed to analyze the plant. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = () => {
    // Implement PDF report download
    console.log('Downloading report...');
  };

  const shareResult = () => {
    // Implement sharing functionality
    if (navigator.share) {
      navigator.share({
        title: 'Plant Scan Result',
        text: `I just identified a ${scanResult.plant.name} using HerbalMarket's Plant Scanner!`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Plant: ${scanResult.plant.name}\nScientific Name: ${scanResult.plant.scientificName}\nConfidence: ${(scanResult.confidence * 100).toFixed(1)}%`);
      alert('Result copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pt-40">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Leaf className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Plant Scanner
          </h1>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Identify plants instantly with AI-powered image recognition. Upload a photo or capture one with your camera to discover the plant's identity, medicinal properties, and care requirements.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Image Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Upload Area */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Upload Plant Image</h2>
              
              {!selectedImage ? (
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-8 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors duration-200">
                  <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Drop your image here
                  </h3>
                  <p className="text-primary-200 mb-6">
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
                      onClick={handleCameraCapture}
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
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Selected plant"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={analyzePlant}
                      disabled={isAnalyzing}
                      className="flex-1 btn btn-primary"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-5 w-5" />
                          Identify Plant
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="btn btn-outline"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  Tips for Best Results
                </h4>
                <ul className="text-sm text-white space-y-1">
                  <li>• Ensure good lighting and clear focus</li>
                  <li>• Include leaves, flowers, and stems if possible</li>
                  <li>• Avoid shadows and reflections</li>
                  <li>• Use high-resolution images for better accuracy</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-200">Error</h3>
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Analyzing Your Plant
                </h3>
                <p className="text-primary-200">
                  Our AI is examining the image to identify the plant species...
                </p>
              </div>
            )}

            {scanResult && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{scanResult.plant.name}</h2>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-300" />
                      <span className="font-semibold">{(scanResult.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <p className="text-primary-100 italic">{scanResult.plant.scientificName}</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      Plant Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-primary-200">Family:</span>
                        <span className="ml-2 text-white">{scanResult.plant.family}</span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-200">Common Names:</span>
                        <span className="ml-2 text-white">{scanResult.plant.commonNames.join(', ')}</span>
                      </div>
                    </div>
                    <p className="text-white mt-3 leading-relaxed">
                      {scanResult.plant.description}
                    </p>
                  </div>

                  {/* Medicinal Uses */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      Medicinal Uses
                    </h3>
                    <ul className="space-y-2">
                      {scanResult.plant.medicinalUses.map((use, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-white">{use}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Active Compounds */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      Active Compounds
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.plant.activeCompounds.map((compound, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 text-sm rounded-full"
                        >
                          {compound}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Growing Conditions */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Growing Conditions
                    </h3>
                    <p className="text-white leading-relaxed">
                      {scanResult.plant.growingConditions}
                    </p>
                  </div>

                  {/* Toxicity Warning */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Important Note</h4>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      {scanResult.plant.toxicity}
                    </p>
                  </div>

                  {/* Alternative Plants */}
                  {scanResult.alternatives.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Similar Plants
                      </h3>
                      <ul className="space-y-1">
                        {scanResult.alternatives.map((alt, index) => (
                          <li key={index} className="text-primary-200 text-sm">
                            • {alt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <button
                      onClick={downloadReport}
                      className="btn btn-outline flex-1"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Report
                    </button>
                    <button
                      onClick={shareResult}
                      className="btn btn-primary flex-1"
                    >
                      <Share2 className="mr-2 h-5 w-5" />
                      Share Result
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder when no image */}
            {!selectedImage && !scanResult && !isAnalyzing && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Ready to Identify
                </h3>
                <p className="text-primary-200">
                  Upload a plant image to get started with identification
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PlantScanner;
