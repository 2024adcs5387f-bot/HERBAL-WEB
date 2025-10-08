import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Calendar, Leaf, TrendingUp, Search, Filter, Trash2, Eye, ArrowLeft, Home, ChevronRight, Download, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';

const PlantHistory = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, verified, recent
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list or detail
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  // Check if content is scrollable
  useEffect(() => {
    const checkScroll = () => {
      if (contentRef.current) {
        const hasScroll = contentRef.current.scrollHeight > contentRef.current.clientHeight;
        console.log('History scroll check:', {
          scrollHeight: contentRef.current.scrollHeight,
          clientHeight: contentRef.current.clientHeight,
          hasScroll
        });
        setShowScrollButtons(hasScroll);
      }
    };

    checkScroll();
    const timer = setTimeout(checkScroll, 100); // Check after content loads
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [history, searchTerm, filterBy, selectedItem]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        if (selectedItem) {
          setSelectedItem(null);
        } else {
          onClose();
        }
      }
      
      // Ctrl/Cmd + F for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('history-search')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, selectedItem, onClose]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      // Try to get user history (requires auth)
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await fetch(`${apiBaseUrl}/api/plant-data/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHistory(data.data || []);
        } else {
          // Fallback to local storage if not authenticated
          loadLocalHistory();
        }
      } else {
        loadLocalHistory();
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      loadLocalHistory();
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced history loading with better error handling
  const loadLocalHistory = () => {
    try {
      const localHistory = JSON.parse(localStorage.getItem('plantHistory') || '[]');
      // Sort by creation date (newest first)
      const sortedHistory = localHistory.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setHistory(sortedHistory);
    } catch (error) {
      console.error('Error loading local history:', error);
      setHistory([]);
    }
  };


  const saveToLocalHistory = (identification) => {
    const localHistory = JSON.parse(localStorage.getItem('plantHistory') || '[]');
    localHistory.unshift({
      ...identification,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    });
    // Keep only last 50 items
    const trimmedHistory = localHistory.slice(0, 50);
    localStorage.setItem('plantHistory', JSON.stringify(trimmedHistory));
  };

  const deleteHistoryItem = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('plantHistory', JSON.stringify(updatedHistory));
  };

  const clearAllHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      localStorage.setItem('plantHistory', JSON.stringify([]));
    }
  };

  const filteredHistory = history.filter(item => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      item.plant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    let matchesFilter = true;
    if (filterBy === 'verified') {
      matchesFilter = item.is_verified === true;
    } else if (filterBy === 'recent') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      matchesFilter = new Date(item.created_at) > oneDayAgo;
    }

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-32"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col mt-8 relative"
        >
          {/* Header with Breadcrumb Navigation */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              <button
                onClick={onClose}
                className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Plant Scanner</span>
              </button>
              <ChevronRight className="h-4 w-4" />
              <span className="text-neutral-900 dark:text-white font-medium">History</span>
              {selectedItem && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-neutral-900 dark:text-white font-medium">{selectedItem.plant_name}</span>
                </>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {selectedItem ? (
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-white/50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    title="Back to list"
                  >
                    <ArrowLeft className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                  </button>
                ) : (
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                    <History className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {selectedItem ? selectedItem.plant_name : 'Identification History'}
                  </h2>
                  <p className="text-base text-neutral-600 dark:text-neutral-400">
                    {selectedItem 
                      ? selectedItem.scientific_name || 'View details'
                      : `${history.length} plant${history.length !== 1 ? 's' : ''} identified`
                    }
                    {!selectedItem && history.length > 0 && (
                      <span className="ml-2 text-sm">
                        ({filteredHistory.length} shown)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchHistory}
                  className="p-2 hover:bg-white/50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  title="Refresh (F5)"
                >
                  <RefreshCw className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  title="Close (Esc)"
                >
                  <X className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            {!selectedItem && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    id="history-search"
                    type="text"
                    placeholder="Search plants... (Ctrl+F)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              <div className="flex gap-2">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All</option>
                  <option value="recent">Recent (24h)</option>
                  <option value="verified">Verified</option>
                </select>
                {history.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </button>
                )}
                </div>
              </div>
            )}
          </div>

          {/* History List or Detail View */}
          <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
            {selectedItem ? (
              /* Detail View */
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-3xl mx-auto"
              >
                {/* Image */}
                {selectedItem.image_url && (
                  <div className="mb-6">
                    <img 
                      src={selectedItem.image_url} 
                      alt={selectedItem.plant_name}
                      className="w-full h-64 object-cover rounded-xl border-2 border-primary-200 dark:border-primary-700"
                    />
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedItem.created_at)}
                  </div>
                  {selectedItem.probability && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {Math.round(selectedItem.probability * 100)}% confidence
                    </div>
                  )}
                  {selectedItem.is_verified && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {/* Description */}
                {selectedItem.description && (
                  <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 text-lg">Description</h4>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{selectedItem.description}</p>
                  </div>
                )}

                {/* Medicinal Uses */}
                {selectedItem.medicinal_uses && selectedItem.medicinal_uses.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 text-lg flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      Medicinal Uses
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.medicinal_uses.map((use, i) => (
                        <span
                          key={i}
                          className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium"
                        >
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Information */}
                {selectedItem.safety_info && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl mb-6">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2 text-lg">⚠️ Safety Information</h4>
                    <p className="text-yellow-800 dark:text-yellow-300 leading-relaxed">{selectedItem.safety_info}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Back to List
                  </button>
                  <button
                    onClick={() => deleteHistoryItem(selectedItem.id)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  {searchTerm || filterBy !== 'all' ? 'No matches found' : 'No history yet'}
                </h3>
                <p className="text-base text-neutral-600 dark:text-neutral-400">
                  {searchTerm || filterBy !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Start identifying plants to build your history'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 hover:shadow-md transition-shadow border border-neutral-200 dark:border-neutral-600"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Plant Image Thumbnail */}
                      {item.image_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={item.image_url} 
                            alt={item.plant_name}
                            style={{ width: '90px', height: '90px', minWidth: '90px', minHeight: '90px', maxWidth: '90px', maxHeight: '90px' }}
                            className="object-cover rounded-lg border-2 border-primary-200 dark:border-primary-700"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Leaf className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            {item.plant_name || 'Unknown Plant'}
                          </h3>
                          {item.is_verified && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                        
                        {item.scientific_name && (
                          <p className="text-base text-neutral-600 dark:text-neutral-400 italic mb-2">
                            {item.scientific_name}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(item.created_at)}
                          </div>
                          {item.probability && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              {Math.round(item.probability * 100)}% confidence
                            </div>
                          )}
                          {item.cache_hit_count > 0 && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                              Cached ({item.cache_hit_count} hits)
                            </span>
                          )}
                        </div>

                        {item.medicinal_uses && item.medicinal_uses.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.medicinal_uses.slice(0, 3).map((use, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                              >
                                {use}
                              </span>
                            ))}
                            {item.medicinal_uses.length > 3 && (
                              <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 text-xs rounded-full">
                                +{item.medicinal_uses.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            </>
            )}
          </div>

          {/* Footer */}
          {!selectedItem && (
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  Showing {filteredHistory.length} of {history.length} identifications
                </p>
                <p className="text-xs">
                  Press <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded">Esc</kbd> to close
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons - Always visible for now */}
          <div className="fixed right-8 bottom-20 flex flex-col gap-3 z-[100]">
            <button
              onClick={scrollToTop}
              className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-2 border-white"
              title="Scroll to top"
            >
              <ArrowUp className="h-6 w-6" />
            </button>
            <button
              onClick={scrollToBottom}
              className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-2 border-white"
              title="Scroll to bottom"
            >
              <ArrowDown className="h-6 w-6" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Export function to save to history
export const saveToHistory = (identification) => {
  const localHistory = JSON.parse(localStorage.getItem('plantHistory') || '[]');
  localHistory.unshift({
    ...identification,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  });
  const trimmedHistory = localHistory.slice(0, 50);
  localStorage.setItem('plantHistory', JSON.stringify(trimmedHistory));
};

export default PlantHistory;
