import express from 'express';
import multer from 'multer';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { BUCKETS, putObject, deleteObject, getPublicUrl } from '../services/r2.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Upload single product image (to R2 products bucket)
router.post('/products/single', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Only allow images for product uploads
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!imageTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only image uploads are allowed for products' });
    }

    const key = buildProductKey(req.user?.id, req.file.originalname);
    await putObject(BUCKETS.products, key, req.file.buffer, req.file.mimetype);
    const publicUrl = getPublicUrl(BUCKETS.products, key);

    res.json({
      success: true,
      data: {
        url: publicUrl,
        key,
        bucket: BUCKETS.products,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Product image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Product image upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper to build a consistent R2 key path
function buildKey(userId, originalname) {
  const safeName = (originalname || 'file').replace(/[^a-zA-Z0-9_.-]/g, '_');
  const ts = Date.now();
  const uid = userId || 'public';
  return `research/attachments/${uid}/${ts}_${safeName}`;
}

// Helper to build product image key in the products bucket
function buildProductKey(userId, originalname) {
  const safeName = (originalname || 'image').replace(/[^a-zA-Z0-9_.-]/g, '_');
  const ts = Date.now();
  const uid = userId || 'public';
  return `products/images/${uid}/${ts}_${safeName}`;
}

// Upload single file (to R2)
router.post('/single', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to R2
    const key = buildKey(req.user?.id, req.file.originalname);
    await putObject(BUCKETS.research, key, req.file.buffer, req.file.mimetype);
    const publicUrl = getPublicUrl(BUCKETS.research, key);

    res.json({
      success: true,
      data: {
        url: publicUrl,
        key,
        bucket: BUCKETS.research,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upload multiple files (to R2)
router.post('/multiple', optionalAuth, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const results = await Promise.all(req.files.map(async (file) => {
      const key = buildKey(req.user?.id, file.originalname);
      await putObject(BUCKETS.research, key, file.buffer, file.mimetype);
      const publicUrl = getPublicUrl(BUCKETS.research, key);
      return {
        url: publicUrl,
        key,
        bucket: BUCKETS.research,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
      };
    }));

    res.json({
      success: true,
      data: {
        files: results,
        totalFiles: results.length
      }
    });

  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete file from R2 by key
router.delete('/', optionalAuth, async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ success: false, message: 'Missing key' });
    await deleteObject(BUCKETS.research, key);
    res.json({ success: true, message: 'File deleted successfully' });

  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get upload limits and allowed types
router.get('/info', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      maxFileSize: '10MB',
      maxFiles: 5,
      allowedTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png', 
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv'
      ],
      maxTotalSize: '50MB'
    }
  });
});

export default router;
