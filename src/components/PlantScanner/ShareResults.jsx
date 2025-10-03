import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Facebook, Twitter, Link2, Mail, MessageCircle, Download, Check, ArrowLeft, Home, ChevronRight } from 'lucide-react';

const ShareResults = ({ plantData, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [shareMethod, setShareMethod] = useState(null); // Track which share method was used

  const shareUrl = window.location.href;
  const shareTitle = `I identified ${plantData.plant_name}!`;
  const shareText = `Check out this plant I identified: ${plantData.plant_name} (${plantData.scientific_name}) - ${Math.round(plantData.probability * 100)}% confidence. Identified using Plant Scanner.`;

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareTitle}\n\n${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setShareMethod('clipboard');
      setTimeout(() => {
        setCopied(false);
        setShareMethod(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareViaFacebook = () => {
    setShareMethod('facebook');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setTimeout(() => setShareMethod(null), 2000);
  };

  const shareViaTwitter = () => {
    setShareMethod('twitter');
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setTimeout(() => setShareMethod(null), 2000);
  };

  const shareViaWhatsApp = () => {
    setShareMethod('whatsapp');
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
    window.open(url, '_blank');
    setTimeout(() => setShareMethod(null), 2000);
  };

  const shareViaEmail = () => {
    setShareMethod('email');
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(`${shareText}\n\nView more: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setTimeout(() => setShareMethod(null), 2000);
  };

  const shareViaNativeAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  const downloadAsImage = () => {
    setShareMethod('download');
    // Create a simple text-based image
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(0, 0, 800, 600);

    // Border
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 780, 580);

    // Title
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 Plant Identified!', 400, 100);

    // Plant name
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(plantData.plant_name, 400, 200);

    // Scientific name
    ctx.fillStyle = '#16a34a';
    ctx.font = 'italic 28px Arial';
    ctx.fillText(plantData.scientific_name || '', 400, 250);

    // Confidence
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`${Math.round(plantData.probability * 100)}% Confidence`, 400, 320);

    // Medicinal uses
    if (plantData.medicinal_uses && plantData.medicinal_uses.length > 0) {
      ctx.fillStyle = '#166534';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Medicinal Uses:', 400, 380);

      ctx.font = '20px Arial';
      const uses = plantData.medicinal_uses.slice(0, 3).join(', ');
      ctx.fillText(uses, 400, 420);
    }

    // Footer
    ctx.fillStyle = '#86efac';
    ctx.font = '18px Arial';
    ctx.fillText('Identified with Plant Scanner', 400, 550);

    // Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plantData.plant_name.replace(/\s+/g, '_')}_identification.png`;
      a.click();
      URL.revokeObjectURL(url);
      setTimeout(() => setShareMethod(null), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header with Breadcrumb */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              <button
                onClick={handleClose}
                className="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Results</span>
              </button>
              <ChevronRight className="h-4 w-4" />
              <span className="text-neutral-900 dark:text-white font-medium">Share</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Share Results
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {plantData.plant_name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                title="Close (Esc)"
              >
                <X className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Success Message */}
          {shareMethod && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-2"
            >
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                {shareMethod === 'clipboard' && 'Link copied to clipboard!'}
                {shareMethod === 'facebook' && 'Opening Facebook...'}
                {shareMethod === 'twitter' && 'Opening Twitter...'}
                {shareMethod === 'whatsapp' && 'Opening WhatsApp...'}
                {shareMethod === 'email' && 'Opening email client...'}
                {shareMethod === 'download' && 'Image downloaded!'}
              </span>
            </motion.div>
          )}

          {/* Share Options */}
          <div className="p-6 space-y-4">
            {/* Native Share (Mobile) */}
            {navigator.share && (
              <button
                onClick={shareViaNativeAPI}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Share2 className="h-6 w-6" />
                <div className="text-left flex-1">
                  <p className="font-semibold">Share</p>
                  <p className="text-sm opacity-90">Share via your apps</p>
                </div>
              </button>
            )}

            {/* Social Media */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareViaFacebook}
                className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Facebook className="h-5 w-5" />
                <span className="font-medium">Facebook</span>
              </button>

              <button
                onClick={shareViaTwitter}
                className="flex items-center gap-3 p-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Twitter className="h-5 w-5" />
                <span className="font-medium">Twitter</span>
              </button>

              <button
                onClick={shareViaWhatsApp}
                className="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 hover:scale-105"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">WhatsApp</span>
              </button>

              <button
                onClick={shareViaEmail}
                className="flex items-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Mail className="h-5 w-5" />
                <span className="font-medium">Email</span>
              </button>
            </div>

            {/* Copy Link */}
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-4 p-4 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-all duration-200"
            >
              {copied ? (
                <>
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-green-600 dark:text-green-400">Copied!</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Link copied to clipboard</p>
                  </div>
                </>
              ) : (
                <>
                  <Link2 className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-white">Copy Link</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Share anywhere</p>
                  </div>
                </>
              )}
            </button>

            {/* Download as Image */}
            <button
              onClick={downloadAsImage}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 hover:scale-105"
            >
              <Download className="h-6 w-6" />
              <div className="text-left flex-1">
                <p className="font-semibold">Download Image</p>
                <p className="text-sm opacity-90">Save as PNG</p>
              </div>
            </button>
          </div>

          {/* Preview & Footer */}
          <div className="p-6 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Preview:</p>
            <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 mb-3">
              <p className="text-sm text-neutral-900 dark:text-white font-medium mb-1">
                {shareTitle}
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {shareText.substring(0, 100)}...
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <p>Choose a sharing method above</p>
              <p>
                Press <kbd className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded">Esc</kbd> to close
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareResults;
