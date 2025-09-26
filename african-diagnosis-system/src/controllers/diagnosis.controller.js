import { matchRemedies } from '../services/remedy.service.js';
import { aiService } from '../services/ai.service.js';

/**
 * @desc    Get disease diagnosis based on symptoms
 * @route   POST /api/diagnose
 * @access  Public
 */
export const diagnose = async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    
    // Get AI-based disease predictions
    const diseasePredictions = await aiService.predictDisease(symptoms);
    
    // Match remedies for each predicted disease
    const predictions = await Promise.all(
      diseasePredictions.map(async (prediction) => {
        const remedies = await matchRemedies(prediction.disease);
        return {
          disease: prediction.disease,
          confidence: prediction.confidence,
          remedies: remedies
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: {
        symptoms,
        predictions
      }
    });
    
  } catch (error) {
    console.error('Diagnosis error:', error);
    next(error);
  }
};
