import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, History, ChevronUp, ChevronDown, ArrowUp, ArrowDown, Home, BarChart3 } from 'lucide-react';
import PlantScannerComponent from '../components/PlantScanner/PlantScanner';
import PlantHistory from '../components/PlantScanner/PlantHistory';
import AudioAssistant from '../components/PlantScanner/AudioAssistant';

const PlantScanner = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [scannerResults, setScannerResults] = useState(null);
  const [scannerAnalyzing, setScannerAnalyzing] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [historyStats, setHistoryStats] = useState({ total: 0, recent: 0, verified: 0 });
  const [currentSection, setCurrentSection] = useState('top');
  
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const scannerRef = useRef(null);
  const resultsRef = useRef(null);

  // Load history stats on component mount
  useEffect(() => {
    loadHistoryStats();
  }, []);

  // Scroll detection and section tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show scroll buttons when scrolled past header
      setShowScrollButtons(scrollY > 200);
      
      // Determine current section
      if (scrollY < 300) {
        setCurrentSection('top');
      } else if (scrollY < 600) {
        setCurrentSection('scanner');
      } else {
        setCurrentSection('results');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load history statistics
  const loadHistoryStats = () => {
    try {
      const localHistory = JSON.parse(localStorage.getItem('plantHistory') || '[]');
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const stats = {
        total: localHistory.length,
        recent: localHistory.filter(item => new Date(item.created_at) > oneDayAgo).length,
        verified: localHistory.filter(item => item.is_verified).length
      };
      
      setHistoryStats(stats);
    } catch (error) {
      console.error('Error loading history stats:', error);
    }
  };

  // Scroll navigation functions
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If no results yet, scroll to bottom of scanner
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  // Update history stats when new results come in
  const handleResultsChange = (results) => {
    setScannerResults(results);
    if (results) {
      // Refresh stats after new identification
      setTimeout(loadHistoryStats, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pt-40">
      <div className="container">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative"
        >
          {/* Top Right Buttons */}
          <div className="absolute top-0 right-0 flex items-center gap-3">
            {/* History Stats Display */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl"
            >
              <BarChart3 className="h-4 w-4" />
              <div className="text-sm">
                <div className="font-medium">{historyStats.total} plants</div>
                <div className="text-xs opacity-80">
                  {historyStats.recent} recent, {historyStats.verified} verified
                </div>
              </div>
            </motion.div>

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
        <div ref={scannerRef}>
          <PlantScannerComponent 
            onResultsChange={handleResultsChange}
            onAnalyzingChange={setScannerAnalyzing}
            onErrorChange={setScannerError}
          />
        </div>

        {/* Results Section Ref */}
        {scannerResults && (
          <div ref={resultsRef} className="mt-8">
            {/* This div serves as a scroll target for results */}
          </div>
        )}
      </div>

      {/* Scroll Navigation Buttons */}
      <AnimatePresence>
        {showScrollButtons && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed right-6 bottom-6 z-40 flex flex-col gap-3"
          >
            {/* Scroll to Top */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
                currentSection === 'top'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
              title="Scroll to top"
            >
              <ArrowUp className="h-5 w-5" />
            </motion.button>

            {/* Scroll to Scanner */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToScanner}
              className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
                currentSection === 'scanner'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
              title="Go to scanner"
            >
              <Home className="h-5 w-5" />
            </motion.button>

            {/* Scroll to Results */}
            {scannerResults && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToResults}
                className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
                  currentSection === 'results'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
                title="Go to results"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.button>
            )}

            {/* Scroll to Bottom */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToBottom}
              className="p-3 rounded-full shadow-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
              title="Scroll to bottom"
            >
              <ArrowDown className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <PlantHistory 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};

export default PlantScanner;
