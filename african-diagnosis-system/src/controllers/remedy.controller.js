import { matchRemedies } from '../services/remedy.service.js';

/**
 * @desc    Get natural remedies for a specific disease
 * @route   GET /api/remedies/:disease
 * @access  Public
 */
export const getRemedies = async (req, res, next) => {
  try {
    const { disease } = req.params;
    
    if (!disease || typeof disease !== 'string' || disease.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Disease name is required and must be a non-empty string'
      });
    }
    
    const remedies = await matchRemedies(disease);
    
    if (!remedies || remedies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No remedies found for the specified disease',
        data: []
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        disease,
        remedies
      }
    });
    
  } catch (error) {
    console.error('Error fetching remedies:', error);
    next(error);
  }
};
