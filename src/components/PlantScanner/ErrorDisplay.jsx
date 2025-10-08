import { motion } from 'framer-motion';
import { AlertCircle, X, Upload } from 'lucide-react';

const ErrorDisplay = ({ error, onDismiss, onTryAgain }) => {
  if (!error) return null;

  // Parse error message sections
  const sections = error.split('\n\n');

  // Determine error type for title
  const getErrorTitle = () => {
    if (error.includes('NOT A PLANT')) return 'Not a Plant Detected';
    if (error.includes('UNCLEAR') || error.includes('TOO UNCLEAR')) return 'Image Too Unclear';
    if (error.includes('size') || error.includes('SIZE')) return 'Image Size Issue';
    if (error.includes('Network') || error.includes('network')) return 'Network Error';
    return 'Error';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-2xl mx-auto"
    >
      {/* Card Container */}
      <div className="bg-gradient-to-br from-red-50 via-red-100 to-rose-100 dark:from-red-900/30 dark:via-red-800/30 dark:to-rose-900/30 rounded-3xl shadow-2xl border-2 border-red-300 dark:border-red-700 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700 p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/30 animate-pulse">
                <AlertCircle className="h-9 w-9 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-extrabold text-white drop-shadow-lg">
                {getErrorTitle()}
              </h3>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">{/* Title */}

          {/* Error Message Sections */}
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => {
              const lines = section.split('\n').filter(line => line.trim());
              
              // Check if this section has bullet points
              const hasBullets = lines.some(line => 
                line.includes('•') || line.includes('✅') || line.includes('❌')
              );

              if (hasBullets) {
                // Find the title (first line without bullets)
                const titleLine = lines.find(line => 
                  !line.includes('•') && !line.includes('✅') && !line.includes('❌')
                );
                const bulletLines = lines.filter(line => 
                  line.includes('•') || line.includes('✅') || line.includes('❌')
                );

                return (
                  <div key={sectionIndex} className="space-y-2">
                    {titleLine && (
                      <p className="font-bold text-lg text-red-600 dark:text-red-500">
                        {titleLine}
                      </p>
                    )}
                    <ul className="space-y-2 ml-1">
                      {bulletLines.map((item, itemIndex) => {
                        const isPositive = item.includes('✅');
                        const isNegative = item.includes('❌');
                        const isBullet = item.includes('•');
                        
                        // Extract the text without the bullet
                        const text = item.replace(/^[•✅❌]\s*/, '').trim();
                        
                        return (
                          <li 
                            key={itemIndex}
                            className={`flex items-start gap-2.5 ${
                              isPositive ? 'text-green-700 dark:text-green-700' : 
                              isNegative ? 'text-red-600 dark:text-red-500' : 
                              'text-red-600 dark:text-red-500'
                            }`}
                          >
                            <span className="text-xl leading-none mt-0.5 flex-shrink-0">
                              {isPositive ? '✅' : isNegative ? '❌' : isBullet ? '•' : ''}
                            </span>
                            <span className="leading-relaxed font-medium">
                              {text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              }

              // Regular paragraph section
              return (
                <p 
                  key={sectionIndex} 
                  className="text-base leading-relaxed font-semibold text-red-600 dark:text-red-500"
                >
                  {section}
                </p>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onTryAgain || onDismiss}
              className="group px-8 py-3.5 bg-white hover:bg-gray-50 text-red-600 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 flex items-center gap-3 border-2 border-red-500 hover:border-red-600"
            >
              <Upload className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-lg">Try Another Image</span>
            </button>
            <button
              onClick={onDismiss}
              className="group px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-3 border-2 border-red-700 hover:border-red-800"
            >
              <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-lg">Dismiss</span>
            </button>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-6 pt-5 border-t-2 border-gray-400 dark:border-gray-400">
        <p className="text-base text-red-600 dark:text-red-500 flex items-center gap-3 bg-gray-300 dark:bg-gray-400 rounded-lg p-4">
          <span className="text-2xl">💡</span>
          <span className="font-semibold"><span className="font-extrabold">Tip:</span> Make sure you're uploading a clear photo of a real plant with visible leaves, flowers, or stems.</span>
        </p>
      </div>
    </motion.div>
  );
};

export default ErrorDisplay;
