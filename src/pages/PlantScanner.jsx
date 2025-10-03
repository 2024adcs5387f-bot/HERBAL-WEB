import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, History } from 'lucide-react';
import PlantScannerComponent from '../components/PlantScanner/PlantScanner';
import PlantHistory from '../components/PlantScanner/PlantHistory';
import AudioAssistant from '../components/PlantScanner/AudioAssistant';

const PlantScanner = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [scannerResults, setScannerResults] = useState(null);
  const [scannerAnalyzing, setScannerAnalyzing] = useState(false);
  const [scannerError, setScannerError] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pt-40">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative"
        >
          {/* Top Right Buttons */}
          <div className="absolute top-0 right-0 flex items-center gap-3">
            {/* History Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <History className="h-5 w-5" />
              <span className="font-medium">View History</span>
            </motion.button>
            
            {/* Audio Assistant Button */}
            <div className="relative">
              <AudioAssistant 
                results={scannerResults}
                isAnalyzing={scannerAnalyzing}
                error={scannerError}
              />
            </div>
          </div>

          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Leaf className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Plant Scanner
          </h1>
          <p className="text-2xl text-white max-w-3xl mx-auto">
            Identify plants instantly with AI-powered image recognition. Upload a photo or capture one with your camera to discover the plant's identity, medicinal properties, and care requirements.
          </p>
        </motion.div>

        {/* Plant Scanner Component */}
        <PlantScannerComponent 
          onResultsChange={setScannerResults}
          onAnalyzingChange={setScannerAnalyzing}
          onErrorChange={setScannerError}
        />
      </div>

      {/* History Modal */}
      <PlantHistory 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};

export default PlantScanner;
