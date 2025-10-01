import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AudioAssistant = ({ results, isAnalyzing, error }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Check if browser supports speech synthesis
  const speechSupported = 'speechSynthesis' in window;

  useEffect(() => {
    if (!speechSupported || !isEnabled) return;

    // Auto-read results when they appear
    if (results && results.suggestions && results.suggestions.length > 0) {
      speakResults(results.suggestions[0]);
    }

    // Read error messages
    if (error) {
      speakError(error);
    }

    // Read analyzing status
    if (isAnalyzing) {
      speak('Analyzing your plant image. Please wait.');
    }

    // Cleanup on unmount
    return () => {
      stopSpeaking();
    };
  }, [results, error, isAnalyzing, isEnabled]);

  const speak = (text, options = {}) => {
    if (!speechSupported || !isEnabled) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakResults = (suggestion) => {
    const plantName = suggestion.plant_name || 'Unknown plant';
    const confidence = Math.round(suggestion.probability * 100);
    const scientificName = suggestion.plant_details?.scientific_name || suggestion.scientific_name;
    
    let text = `Plant identified! ${plantName}. `;
    
    if (scientificName) {
      text += `Scientific name: ${scientificName}. `;
    }
    
    text += `Confidence level: ${confidence} percent. `;

    if (suggestion.medicinal_uses && suggestion.medicinal_uses.length > 0) {
      text += `Medicinal uses include: ${suggestion.medicinal_uses.slice(0, 3).join(', ')}. `;
    }

    if (suggestion.safety_info) {
      text += `Safety information: ${suggestion.safety_info}`;
    }

    speak(text);
  };

  const speakError = (errorText) => {
    // Clean up error text for speech
    const cleanText = errorText
      .replace(/🚫|🔍|📏|✅|❌|•/g, '')
      .replace(/\n/g, '. ')
      .trim();
    
    speak(`Error: ${cleanText}`);
  };

  const toggleAssistant = () => {
    if (isEnabled) {
      stopSpeaking();
    }
    setIsEnabled(!isEnabled);
  };

  const stopSpeaking = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const pauseResume = () => {
    if (!speechSupported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const repeatLastMessage = () => {
    if (results && results.suggestions && results.suggestions.length > 0) {
      speakResults(results.suggestions[0]);
    } else if (error) {
      speakError(error);
    }
  };

  if (!speechSupported) {
    return null; // Don't show if browser doesn't support speech
  }

  return (
    <>
      {/* Main Toggle Button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        onClick={toggleAssistant}
        className={`flex items-center gap-2 px-6 py-3 backdrop-blur-sm border border-white/20 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg ${
          isEnabled
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title={isEnabled ? 'Disable Audio Assistant' : 'Enable Audio Assistant'}
      >
        {isEnabled ? (
          <>
            <Volume2 className="h-5 w-5" />
            <span className="font-medium">Audio On</span>
          </>
        ) : (
          <>
            <VolumeX className="h-5 w-5" />
            <span className="font-medium">Audio Off</span>
          </>
        )}
      </motion.button>

      {/* Control Panel */}
      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-4 min-w-[300px] border border-neutral-200 dark:border-neutral-700 z-[60]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                Audio Assistant
              </span>
              {isSpeaking && (
                <span className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                  <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
                  Speaking
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {/* Pause/Resume */}
              {isSpeaking && (
                <button
                  onClick={pauseResume}
                  className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  )}
                </button>
              )}

              {/* Stop */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  title="Stop"
                >
                  Stop
                </button>
              )}

              {/* Repeat */}
              {!isSpeaking && (results || error) && (
                <button
                  onClick={repeatLastMessage}
                  className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                  title="Repeat"
                >
                  Repeat
                </button>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {isEnabled
                  ? 'Assistant will read results automatically'
                  : 'Click to enable voice assistance'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AudioAssistant;
