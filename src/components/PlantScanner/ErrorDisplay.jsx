import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;

  // Parse error message sections
  const sections = error.split('\n\n');

  // Determine error type for title
  const getErrorTitle = () => {
    if (error.includes('NOT A PLANT')) return '🚫 Not a Plant Detected';
    if (error.includes('UNCLEAR') || error.includes('TOO UNCLEAR')) return '🔍 Image Too Unclear';
    if (error.includes('size') || error.includes('SIZE')) return '📏 Image Size Issue';
    if (error.includes('Network') || error.includes('network')) return '🌐 Network Error';
    return '⚠️ Error';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-600 rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center shadow-lg">
            <AlertCircle className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-4">
            {getErrorTitle()}
          </h3>

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
                      <p className="font-bold text-lg text-red-900 dark:text-red-100">
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
                              isPositive ? 'text-green-800 dark:text-green-200' : 
                              isNegative ? 'text-red-800 dark:text-red-200' : 
                              'text-red-900 dark:text-red-100'
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
                  className="text-base leading-relaxed font-medium text-red-900 dark:text-red-100"
                >
                  {section}
                </p>
              );
            })}
          </div>

          {/* Dismiss Button */}
          <div className="mt-5 flex gap-3">
            <button
              onClick={onDismiss}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Dismiss
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-4 pt-4 border-t border-red-300 dark:border-red-700">
        <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
          <span className="font-semibold">💡 Tip:</span>
          <span>Make sure you're uploading a clear photo of a real plant with visible leaves, flowers, or stems.</span>
        </p>
      </div>
    </motion.div>
  );
};

export default ErrorDisplay;
