import express from 'express';
import axios from 'axios';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import plantIdentificationService from '../services/plantIdentificationService.js';
import imageComparisonService from '../services/imageComparisonService.js';

const router = express.Router();

// @route   GET /api/ai/check-config
// @desc    Check if API keys are configured (for debugging)
// @access  Public
router.get('/check-config', (req, res) => {
  const config = {
    plantIdApiKey: process.env.PLANT_ID_API_KEY ? '✅ Set' : '❌ Missing',
    supabaseUrl: process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    environment: process.env.NODE_ENV || 'development'
  };

  console.log('🔍 Configuration Check:', config);

  res.json({
    success: true,
    config: config,
    message: config.plantIdApiKey === '✅ Set' 
      ? 'All required keys are configured!' 
      : 'Some keys are missing. Check your .env file.'
  });
});

// @route   POST /api/ai/plant-identify
// @desc    Identify plant using AI with image comparison and Supabase caching
// @access  Public
router.post('/plant-identify', optionalAuth, async (req, res) => {
  try {
    const { images, modifiers, plant_details } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }

    // Check API key before processing
    if (!process.env.PLANT_ID_API_KEY) {
      console.error('❌ PLANT_ID_API_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        message: '⚙️ Plant.id API key not configured. Please add PLANT_ID_API_KEY to your backend/.env file. Get your free API key at https://web.plant.id/'
      });
    }

    const userId = req.user?.id || null;

    // Use the new AI image comparison service
    const result = await imageComparisonService.identifyPlantFromImage(
      images[0],
      userId
    );

    // Enhance with medicinal information from database
    if (result.success && result.data.suggestions) {
      result.data.suggestions = result.data.suggestions.map(suggestion => ({
        ...suggestion,
        medicinal_uses: suggestion.medicinal_uses || getMedicinalUses(suggestion.plant_name),
        safety_info: suggestion.safety_info || getSafetyInfo(suggestion.plant_name)
      }));
    }

    res.json(result);

  } catch (error) {
    console.error('Plant identification error:', error.message);
    console.error('Error details:', error.response?.data || error);
    
    // Handle specific error types
    let errorMessage = error.message || 'Plant identification failed';
    let statusCode = 500;
    
    if (error.response?.status === 401) {
      errorMessage = '🔑 Invalid Plant.id API key. Please check your API key in the .env file.';
      statusCode = 500;
    } else if (error.response?.status === 429) {
      errorMessage = '⏱️ API rate limit exceeded. Please try again in a few minutes.';
      statusCode = 429;
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = '⏰ Request timeout. Please try again with a smaller image.';
      statusCode = 408;
    } else if (error.message.includes('socket hang up')) {
      errorMessage = '🔌 Connection lost. Please check your internet connection and try again.';
      statusCode = 503;
    } else if (!process.env.PLANT_ID_API_KEY) {
      errorMessage = '⚙️ Plant.id API key not configured. Please add PLANT_ID_API_KEY to your .env file.';
      statusCode = 500;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
});

// @route   POST /api/ai/plant-identify-batch
// @desc    Identify multiple plants from multiple images
// @access  Public
router.post('/plant-identify-batch', optionalAuth, async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }

    if (images.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 images allowed per batch'
      });
    }

    const userId = req.user?.id || null;

    // Process all images
    const results = await imageComparisonService.identifyMultipleImages(images, userId);

    res.json({
      success: true,
      data: {
        total: images.length,
        results: results,
        cache_hits: results.filter(r => r.source === 'cache').length,
        api_calls: results.filter(r => r.source === 'api').length
      }
    });

  } catch (error) {
    console.error('Batch identification error:', error);
    res.status(500).json({
      success: false,
      message: 'Batch identification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/plant-identify-feedback
// @desc    Submit feedback on plant identification accuracy
// @access  Public (allows anonymous feedback)
router.post('/plant-identify-feedback', optionalAuth, async (req, res) => {
  try {
    const { identification_id, is_correct, correct_plant_name } = req.body;

    if (!identification_id) {
      return res.status(400).json({
        success: false,
        message: 'Identification ID is required'
      });
    }

    const userId = req.user?.id || null;

    const result = await imageComparisonService.recordUserFeedback(
      identification_id,
      is_correct,
      correct_plant_name,
      userId
    );

    res.json({
      success: result,
      message: result ? 'Feedback recorded successfully' : 'Failed to record feedback'
    });

  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback'
    });
  }
});

// @route   POST /api/ai/symptom-check
// @desc    Check symptoms using Infermedica API
// @access  Private
router.post('/symptom-check', authenticate, async (req, res) => {
  try {
    const { symptoms, age, sex } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms are required'
      });
    }

    // First, get symptom analysis
    const diagnosisResponse = await axios.post(
      'https://api.infermedica.com/v3/diagnosis',
      {
        sex: sex || 'male',
        age: { value: age || 30 },
        evidence: symptoms.map(symptom => ({
          id: symptom.id,
          choice_id: symptom.choice_id || 'present'
        }))
      },
      {
        headers: {
          'App-Id': process.env.INFERMEDICA_APP_ID,
          'App-Key': process.env.INFERMEDICA_APP_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const diagnosis = diagnosisResponse.data;

    // Get herbal recommendations based on conditions
    const herbalRecommendations = diagnosis.conditions?.map(condition => ({
      ...condition,
      herbal_remedies: getHerbalRemedies(condition.name),
      recommended_products: [] // This would be populated from your product database
    }));

    res.json({
      success: true,
      data: {
        ...diagnosis,
        conditions: herbalRecommendations,
        disclaimer: "This is for informational purposes only and should not replace professional medical advice."
      }
    });

  } catch (error) {
    console.error('Symptom check error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Symptom analysis failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/recommend
// @desc    Get AI-powered herbal recommendations
// @access  Private
router.post('/recommend', authenticate, async (req, res) => {
  try {
    const { conditions, preferences, allergies } = req.body;

    if (!conditions || conditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one condition is required'
      });
    }

    // Use OpenAI to generate personalized recommendations
    const openAIResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a knowledgeable herbalist AI assistant. Provide safe, evidence-based herbal recommendations for health conditions. Always include safety warnings and advise consulting healthcare providers.`
          },
          {
            role: 'user',
            content: `Please recommend herbal remedies for these conditions: ${conditions.join(', ')}. 
            User preferences: ${preferences || 'None specified'}. 
            Allergies: ${allergies || 'None specified'}.
            Format the response as a JSON object with recommendations, safety_notes, and interactions.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let recommendations;
    try {
      recommendations = JSON.parse(openAIResponse.data.choices[0].message.content);
    } catch (parseError) {
      recommendations = {
        recommendations: openAIResponse.data.choices[0].message.content,
        safety_notes: "Always consult with a healthcare provider before starting any herbal treatment.",
        interactions: "Check for drug interactions with your current medications."
      };
    }

    res.json({
      success: true,
      data: {
        ...recommendations,
        generated_at: new Date().toISOString(),
        disclaimer: "This AI-generated advice is for informational purposes only and should not replace professional medical consultation."
      }
    });

  } catch (error) {
    console.error('AI recommendation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions (you can expand these with your own database)
function getMedicinalUses(plantName) {
  const medicinalDatabase = {
    'Turmeric': ['Anti-inflammatory', 'Antioxidant', 'Digestive aid'],
    'Ginger': ['Nausea relief', 'Anti-inflammatory', 'Digestive aid'],
    'Echinacea': ['Immune support', 'Cold prevention', 'Wound healing'],
    'Aloe Vera': ['Skin healing', 'Burns treatment', 'Digestive aid']
  };
  
  return medicinalDatabase[plantName] || ['Consult an herbalist for specific uses'];
}

function getSafetyInfo(plantName) {
  const safetyDatabase = {
    'Turmeric': 'Generally safe, may interact with blood thinners',
    'Ginger': 'Generally safe, avoid high doses during pregnancy',
    'Echinacea': 'Generally safe, may cause allergic reactions in some people',
    'Aloe Vera': 'Safe for topical use, internal use requires caution'
  };
  
  return safetyDatabase[plantName] || 'Consult healthcare provider before use';
}

function getHerbalRemedies(conditionName) {
  const remedyDatabase = {
    'Common cold': ['Echinacea', 'Elderberry', 'Ginger tea'],
    'Headache': ['Willow bark', 'Peppermint', 'Feverfew'],
    'Digestive issues': ['Ginger', 'Peppermint', 'Chamomile'],
    'Anxiety': ['Chamomile', 'Lavender', 'Passionflower']
  };
  
  return remedyDatabase[conditionName] || ['Consult an herbalist for specific remedies'];
}

export default router;
