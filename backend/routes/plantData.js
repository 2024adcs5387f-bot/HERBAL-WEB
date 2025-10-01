import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import plantIdentificationService from '../services/plantIdentificationService.js';
import plantComparisonService from '../services/plantComparisonService.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// @route   GET /api/plant-data/history
// @desc    Get user's plant identification history
// @access  Private
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const history = await plantIdentificationService.getUserHistory(userId, limit);

    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch identification history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/plant-data/popular
// @desc    Get most identified plants
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const { data, error } = await supabase
      .from('plant_identifications')
      .select('plant_name, scientific_name, medicinal_uses, cache_hit_count')
      .order('cache_hit_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Group by plant name and aggregate
    const plantMap = new Map();
    data.forEach(plant => {
      const key = plant.plant_name;
      if (plantMap.has(key)) {
        const existing = plantMap.get(key);
        existing.total_identifications += 1;
        existing.cache_hit_count += plant.cache_hit_count;
      } else {
        plantMap.set(key, {
          plant_name: plant.plant_name,
          scientific_name: plant.scientific_name,
          medicinal_uses: plant.medicinal_uses,
          total_identifications: 1,
          cache_hit_count: plant.cache_hit_count
        });
      }
    });

    const popularPlants = Array.from(plantMap.values())
      .sort((a, b) => b.total_identifications - a.total_identifications)
      .slice(0, limit);

    res.json({
      success: true,
      data: popularPlants
    });
  } catch (error) {
    console.error('Error fetching popular plants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular plants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/plant-data/search
// @desc    Search plant identifications
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const limit = parseInt(req.query.limit) || 10;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const results = await plantIdentificationService.searchByName(searchTerm, limit);

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error searching plants:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/plant-data/medicinal-plants
// @desc    Get medicinal plants database
// @access  Public
router.get('/medicinal-plants', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const searchTerm = req.query.q;

    let query = supabase
      .from('medicinal_plants')
      .select('*', { count: 'exact' })
      .eq('verified', true)
      .order('view_count', { ascending: false });

    if (searchTerm) {
      query = query.or(`common_name.ilike.%${searchTerm}%,scientific_name.ilike.%${searchTerm}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      pagination: {
        total: count,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < count
      }
    });
  } catch (error) {
    console.error('Error fetching medicinal plants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicinal plants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/plant-data/medicinal-plants/:slug
// @desc    Get single medicinal plant by slug
// @access  Public
router.get('/medicinal-plants/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from('medicinal_plants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Plant not found'
        });
      }
      throw error;
    }

    // Increment view count
    await supabase
      .from('medicinal_plants')
      .update({ view_count: data.view_count + 1 })
      .eq('id', data.id);

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching medicinal plant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plant details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/plant-data/herbal-remedies
// @desc    Get herbal remedies
// @access  Public
router.get('/herbal-remedies', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const remedyType = req.query.type;
    const condition = req.query.condition;

    let query = supabase
      .from('herbal_remedies')
      .select('*')
      .eq('is_active', true)
      .eq('verified', true)
      .order('rating', { ascending: false });

    if (remedyType) {
      query = query.eq('remedy_type', remedyType);
    }

    if (condition) {
      query = query.contains('conditions_treated', [condition]);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching herbal remedies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch remedies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/plant-data/verify/:id
// @desc    Verify plant identification (Herbalist only)
// @access  Private (Herbalist)
router.post('/verify/:id', authenticate, async (req, res) => {
  try {
    // Check if user is herbalist
    if (req.user.user_type !== 'herbalist' && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only herbalists can verify plant identifications'
      });
    }

    const identificationId = req.params.id;
    const herbalistId = req.user.id;

    const verified = await plantIdentificationService.verifyIdentification(
      identificationId,
      herbalistId
    );

    res.json({
      success: true,
      message: 'Plant identification verified successfully',
      data: verified
    });
  } catch (error) {
    console.error('Error verifying identification:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/plant-data/compare
// @desc    Compare identified plant with database plants
// @access  Public
router.post('/compare', async (req, res) => {
  try {
    const { plant_name, description, scientific_name } = req.body;

    if (!plant_name) {
      return res.status(400).json({
        success: false,
        message: 'Plant name is required'
      });
    }

    const plantData = {
      plant_name,
      description: description || '',
      scientific_name: scientific_name || ''
    };

    const comparison = await plantComparisonService.compareWithDatabase(plantData);

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing plants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare plants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/plant-data/diseases/:plantName
// @desc    Get diseases that can affect a specific plant
// @access  Public
router.get('/diseases/:plantName', async (req, res) => {
  try {
    const { plantName } = req.params;

    const diseases = await plantComparisonService.getPlantDiseases(plantName);

    res.json({
      success: true,
      data: diseases,
      count: diseases.length
    });
  } catch (error) {
    console.error('Error fetching plant diseases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diseases',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/plant-data/diseases
// @desc    Get all plant diseases
// @access  Public
router.get('/diseases', async (req, res) => {
  try {
    const diseases = await plantComparisonService.getAllDiseases();

    res.json({
      success: true,
      data: diseases,
      count: diseases.length
    });
  } catch (error) {
    console.error('Error fetching all diseases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diseases',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/plant-data/stats
// @desc    Get plant identification statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    // Total identifications
    const { count: totalIdentifications } = await supabase
      .from('plant_identifications')
      .select('*', { count: 'exact', head: true });

    // Unique plants
    const { data: uniquePlants } = await supabase
      .from('plant_identifications')
      .select('plant_name');
    
    const uniqueCount = new Set(uniquePlants?.map(p => p.plant_name)).size;

    // Cache hit rate
    const { data: cacheData } = await supabase
      .from('plant_identifications')
      .select('cache_hit_count');
    
    const totalCacheHits = cacheData?.reduce((sum, item) => sum + (item.cache_hit_count || 0), 0) || 0;
    const cacheHitRate = totalIdentifications > 0 
      ? ((totalCacheHits / totalIdentifications) * 100).toFixed(2)
      : 0;

    // Verified count
    const { count: verifiedCount } = await supabase
      .from('plant_identifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    res.json({
      success: true,
      data: {
        total_identifications: totalIdentifications,
        unique_plants: uniqueCount,
        verified_identifications: verifiedCount,
        cache_hit_rate: `${cacheHitRate}%`,
        total_cache_hits: totalCacheHits
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
