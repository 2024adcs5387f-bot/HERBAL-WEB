import express from 'express';
import axios from 'axios';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/ai/plant-identify
// @desc    Identify plant using Plant.id API
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

    const plantIdResponse = await axios.post(
      'https://api.plant.id/v2/identify',
      {
        images,
        modifiers: modifiers || ["crops_fast", "similar_images", "health_only", "disease_similar_images"],
        plant_details: plant_details || ["common_names", "url", "name_authority", "wiki_description", "taxonomy"]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': process.env.PLANT_ID_API_KEY
        }
      }
    );

    const result = plantIdResponse.data;

    // Extract medicinal information (you can enhance this with your own database)
    const suggestions = result.suggestions?.map(suggestion => ({
      ...suggestion,
      medicinal_uses: getMedicinalUses(suggestion.plant_name),
      safety_info: getSafetyInfo(suggestion.plant_name)
    }));

    res.json({
      success: true,
      data: {
        ...result,
        suggestions,
        identification_id: result.id
      }
    });

  } catch (error) {
    console.error('Plant identification error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Plant identification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// Enhanced medicinal database with comprehensive plant information
function getMedicinalUses(plantName) {
  const medicinalDatabase = {
    // Common herbs and their medicinal uses
    'Turmeric': ['Anti-inflammatory', 'Antioxidant', 'Digestive aid', 'Joint pain relief', 'Liver support', 'Heart health'],
    'Ginger': ['Nausea relief', 'Anti-inflammatory', 'Digestive aid', 'Motion sickness', 'Cold and flu relief', 'Menstrual cramps'],
    'Echinacea': ['Immune support', 'Cold prevention', 'Wound healing', 'Upper respiratory infections', 'Antibacterial properties'],
    'Aloe Vera': ['Skin healing', 'Burns treatment', 'Digestive aid', 'Anti-inflammatory', 'Moisturizing', 'Sunburn relief'],
    'Chamomile': ['Sleep aid', 'Anxiety relief', 'Digestive support', 'Anti-inflammatory', 'Skin soothing', 'Menstrual cramps'],
    'Peppermint': ['Digestive aid', 'Headache relief', 'Nausea relief', 'Respiratory support', 'Muscle pain relief', 'Mental clarity'],
    'Lavender': ['Stress relief', 'Sleep aid', 'Anxiety reduction', 'Pain relief', 'Antiseptic', 'Skin healing'],
    'Garlic': ['Immune support', 'Antibacterial', 'Heart health', 'Blood pressure regulation', 'Antioxidant', 'Cold prevention'],
    'Ginseng': ['Energy boost', 'Stress adaptation', 'Cognitive function', 'Immune support', 'Blood sugar regulation', 'Libido support'],
    'Green Tea': ['Antioxidant', 'Weight management', 'Heart health', 'Cancer prevention', 'Mental alertness', 'Anti-aging'],
    'Dandelion': ['Liver detoxification', 'Digestive aid', 'Diuretic', 'Blood sugar support', 'Skin health', 'Immune support'],
    'Milk Thistle': ['Liver protection', 'Detoxification', 'Antioxidant', 'Digestive support', 'Gallbladder health', 'Skin health'],
    'St. John\'s Wort': ['Mood support', 'Depression relief', 'Anxiety reduction', 'Nerve pain relief', 'Sleep improvement', 'Seasonal affective disorder'],
    'Valerian': ['Sleep aid', 'Anxiety relief', 'Muscle relaxation', 'Stress reduction', 'Insomnia treatment', 'Nervous system support'],
    'Elderberry': ['Immune support', 'Cold and flu relief', 'Antiviral properties', 'Antioxidant', 'Respiratory health', 'Inflammation reduction'],
    'Ginkgo': ['Memory enhancement', 'Circulation improvement', 'Cognitive function', 'Antioxidant', 'Tinnitus relief', 'Eye health'],
    'Hawthorn': ['Heart health', 'Blood pressure regulation', 'Circulation improvement', 'Antioxidant', 'Cholesterol management', 'Anxiety relief'],
    'Saw Palmetto': ['Prostate health', 'Hair loss prevention', 'Hormonal balance', 'Urinary tract health', 'Libido support', 'Anti-inflammatory'],
    'Bilberry': ['Eye health', 'Vision improvement', 'Antioxidant', 'Circulation support', 'Blood sugar regulation', 'Anti-inflammatory'],
    'Cranberry': ['Urinary tract health', 'Antibacterial', 'Antioxidant', 'Digestive health', 'Immune support', 'Heart health'],
    'Rosemary': ['Memory enhancement', 'Circulation improvement', 'Antioxidant', 'Digestive aid', 'Hair growth', 'Mental clarity'],
    'Sage': ['Memory enhancement', 'Antioxidant', 'Digestive aid', 'Throat health', 'Menopausal symptoms', 'Anti-inflammatory'],
    'Thyme': ['Respiratory support', 'Antibacterial', 'Antioxidant', 'Digestive aid', 'Immune support', 'Cough relief'],
    'Oregano': ['Antibacterial', 'Antioxidant', 'Digestive aid', 'Immune support', 'Respiratory health', 'Anti-inflammatory'],
    'Basil': ['Stress relief', 'Antioxidant', 'Digestive aid', 'Anti-inflammatory', 'Respiratory support', 'Mental clarity'],
    'Cilantro': ['Detoxification', 'Antioxidant', 'Digestive aid', 'Heavy metal chelation', 'Anti-inflammatory', 'Blood sugar regulation'],
    'Parsley': ['Kidney support', 'Antioxidant', 'Digestive aid', 'Diuretic', 'Bone health', 'Immune support'],
    'Cinnamon': ['Blood sugar regulation', 'Antioxidant', 'Anti-inflammatory', 'Heart health', 'Digestive aid', 'Immune support'],
    'Clove': ['Dental health', 'Antioxidant', 'Pain relief', 'Digestive aid', 'Antibacterial', 'Respiratory support'],
    'Cardamom': ['Digestive aid', 'Antioxidant', 'Respiratory support', 'Heart health', 'Anti-inflammatory', 'Mental clarity'],
    'Fennel': ['Digestive aid', 'Antioxidant', 'Respiratory support', 'Menstrual cramps', 'Anti-inflammatory', 'Breast milk production'],
    'Cumin': ['Digestive aid', 'Antioxidant', 'Iron absorption', 'Immune support', 'Respiratory health', 'Anti-inflammatory'],
    'Coriander': ['Digestive aid', 'Antioxidant', 'Blood sugar regulation', 'Heart health', 'Anti-inflammatory', 'Detoxification'],
    'Bay Leaf': ['Digestive aid', 'Antioxidant', 'Respiratory support', 'Anti-inflammatory', 'Heart health', 'Wound healing'],
    'Star Anise': ['Digestive aid', 'Antioxidant', 'Respiratory support', 'Antibacterial', 'Anti-inflammatory', 'Immune support'],
    'Nutmeg': ['Digestive aid', 'Pain relief', 'Sleep aid', 'Antioxidant', 'Anti-inflammatory', 'Mental clarity'],
    'Allspice': ['Digestive aid', 'Antioxidant', 'Pain relief', 'Anti-inflammatory', 'Respiratory support', 'Immune support'],
    'Vanilla': ['Antioxidant', 'Mood enhancement', 'Stress relief', 'Anti-inflammatory', 'Digestive aid', 'Mental clarity'],
    'Lemongrass': ['Digestive aid', 'Antioxidant', 'Anti-inflammatory', 'Stress relief', 'Respiratory support', 'Pain relief'],
    'Citronella': ['Insect repellent', 'Antioxidant', 'Anti-inflammatory', 'Digestive aid', 'Respiratory support', 'Antibacterial'],
    'Bergamot': ['Mood enhancement', 'Antioxidant', 'Digestive aid', 'Stress relief', 'Anti-inflammatory', 'Skin health'],
    'Jasmine': ['Mood enhancement', 'Stress relief', 'Antioxidant', 'Anti-inflammatory', 'Sleep aid', 'Mental clarity'],
    'Rose': ['Mood enhancement', 'Antioxidant', 'Anti-inflammatory', 'Skin health', 'Digestive aid', 'Stress relief'],
    'Ylang-Ylang': ['Mood enhancement', 'Stress relief', 'Blood pressure regulation', 'Antioxidant', 'Anti-inflammatory', 'Libido support'],
    'Patchouli': ['Mood enhancement', 'Antioxidant', 'Anti-inflammatory', 'Skin health', 'Digestive aid', 'Stress relief'],
    'Sandalwood': ['Mood enhancement', 'Antioxidant', 'Anti-inflammatory', 'Skin health', 'Digestive aid', 'Mental clarity'],
    'Frankincense': ['Anti-inflammatory', 'Antioxidant', 'Pain relief', 'Respiratory support', 'Immune support', 'Mental clarity'],
    'Myrrh': ['Anti-inflammatory', 'Antioxidant', 'Wound healing', 'Digestive aid', 'Respiratory support', 'Immune support'],
    'Tea Tree': ['Antibacterial', 'Antifungal', 'Antiseptic', 'Skin health', 'Respiratory support', 'Immune support'],
    'Eucalyptus': ['Respiratory support', 'Antibacterial', 'Anti-inflammatory', 'Pain relief', 'Mental clarity', 'Immune support'],
    'Spearmint': ['Digestive aid', 'Antioxidant', 'Anti-inflammatory', 'Respiratory support', 'Mental clarity', 'Hormonal balance'],
    'Wintergreen': ['Pain relief', 'Anti-inflammatory', 'Antiseptic', 'Respiratory support', 'Muscle relaxation', 'Headache relief'],
    'Clary Sage': ['Hormonal balance', 'Stress relief', 'Antioxidant', 'Anti-inflammatory', 'Digestive aid', 'Menstrual cramps'],
    'Geranium': ['Hormonal balance', 'Skin health', 'Antioxidant', 'Anti-inflammatory', 'Stress relief', 'Mood enhancement'],
    'Neroli': ['Mood enhancement', 'Stress relief', 'Antioxidant', 'Anti-inflammatory', 'Skin health', 'Sleep aid'],
    'Petitgrain': ['Stress relief', 'Antioxidant', 'Anti-inflammatory', 'Digestive aid', 'Mental clarity', 'Mood enhancement'],
    'Orange': ['Mood enhancement', 'Antioxidant', 'Digestive aid', 'Immune support', 'Stress relief', 'Anti-inflammatory'],
    'Lemon': ['Immune support', 'Antioxidant', 'Digestive aid', 'Detoxification', 'Skin health', 'Mental clarity'],
    'Lime': ['Immune support', 'Antioxidant', 'Digestive aid', 'Detoxification', 'Skin health', 'Anti-inflammatory'],
    'Grapefruit': ['Weight management', 'Antioxidant', 'Digestive aid', 'Immune support', 'Detoxification', 'Heart health'],
    'Mandarin': ['Mood enhancement', 'Antioxidant', 'Digestive aid', 'Stress relief', 'Anti-inflammatory', 'Sleep aid'],
    'Tangerine': ['Mood enhancement', 'Antioxidant', 'Digestive aid', 'Immune support', 'Stress relief', 'Anti-inflammatory'],
    'Cedarwood': ['Stress relief', 'Antioxidant', 'Anti-inflammatory', 'Respiratory support', 'Skin health', 'Mental clarity'],
    'Cypress': ['Circulation improvement', 'Antioxidant', 'Anti-inflammatory', 'Respiratory support', 'Stress relief', 'Hormonal balance'],
    'Juniper': ['Detoxification', 'Antioxidant', 'Anti-inflammatory', 'Digestive aid', 'Respiratory support', 'Urinary tract health'],
    'Pine': ['Respiratory support', 'Antioxidant', 'Anti-inflammatory', 'Immune support', 'Mental clarity', 'Pain relief'],
    'Spruce': ['Respiratory support', 'Antioxidant', 'Anti-inflammatory', 'Immune support', 'Mental clarity', 'Stress relief'],
    'Fir': ['Respiratory support', 'Antioxidant', 'Anti-inflammatory', 'Immune support', 'Mental clarity', 'Pain relief'],
    'Hemlock': ['Respiratory support', 'Antioxidant', 'Anti-inflammatory', 'Immune support', 'Mental clarity', 'Stress relief']
  };
  
  // Try to find a match (case insensitive)
  const normalizedName = plantName.toLowerCase();
  for (const [key, value] of Object.entries(medicinalDatabase)) {
    if (key.toLowerCase().includes(normalizedName) || normalizedName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return ['Consult an herbalist for specific uses', 'Research traditional medicinal applications', 'Verify safety with healthcare provider'];
}

function getSafetyInfo(plantName) {
  const safetyDatabase = {
    'Turmeric': 'Generally safe, may interact with blood thinners and diabetes medications. Avoid high doses during pregnancy.',
    'Ginger': 'Generally safe, avoid high doses during pregnancy. May interact with blood thinners and diabetes medications.',
    'Echinacea': 'Generally safe, may cause allergic reactions in some people. Avoid if allergic to Asteraceae family plants.',
    'Aloe Vera': 'Safe for topical use, internal use requires caution. May cause digestive upset in some individuals.',
    'Chamomile': 'Generally safe, may cause allergic reactions in people allergic to ragweed. Avoid during pregnancy in large amounts.',
    'Peppermint': 'Generally safe, may cause heartburn in some people. Avoid during pregnancy in large amounts.',
    'Lavender': 'Generally safe for most people. May cause skin irritation in sensitive individuals.',
    'Garlic': 'Generally safe, may cause digestive upset. May interact with blood thinners and diabetes medications.',
    'Ginseng': 'Generally safe, may interact with blood thinners and diabetes medications. Avoid during pregnancy.',
    'Green Tea': 'Generally safe, contains caffeine. May interact with blood thinners and iron absorption.',
    'Dandelion': 'Generally safe, may cause allergic reactions in some people. Avoid if allergic to Asteraceae family plants.',
    'Milk Thistle': 'Generally safe, may cause digestive upset in some people. May interact with certain medications.',
    'St. John\'s Wort': 'May interact with many medications including antidepressants, birth control, and blood thinners. Consult healthcare provider.',
    'Valerian': 'Generally safe, may cause drowsiness. Avoid with alcohol or sedatives.',
    'Elderberry': 'Generally safe when cooked, raw berries may be toxic. Avoid during pregnancy.',
    'Ginkgo': 'Generally safe, may interact with blood thinners. May cause digestive upset in some people.',
    'Hawthorn': 'Generally safe, may interact with heart medications. Consult healthcare provider if taking heart medications.',
    'Saw Palmetto': 'Generally safe, may interact with blood thinners. May cause digestive upset in some people.',
    'Bilberry': 'Generally safe, may interact with blood thinners. May cause digestive upset in some people.',
    'Cranberry': 'Generally safe, may interact with blood thinners. May cause digestive upset in some people.',
    'Rosemary': 'Generally safe, may cause digestive upset in large amounts. Avoid during pregnancy in large amounts.',
    'Sage': 'Generally safe, avoid during pregnancy and breastfeeding. May cause digestive upset in large amounts.',
    'Thyme': 'Generally safe, may cause digestive upset in large amounts. Avoid during pregnancy in large amounts.',
    'Oregano': 'Generally safe, may cause digestive upset in large amounts. Avoid during pregnancy in large amounts.',
    'Basil': 'Generally safe, may cause digestive upset in large amounts. Avoid during pregnancy in large amounts.',
    'Cilantro': 'Generally safe, may cause digestive upset in some people. May cause allergic reactions in some individuals.',
    'Parsley': 'Generally safe, may cause digestive upset in large amounts. Avoid during pregnancy in large amounts.',
    'Cinnamon': 'Generally safe, may cause digestive upset in large amounts. May interact with diabetes medications.',
    'Clove': 'Generally safe, may cause digestive upset in large amounts. May interact with blood thinners.',
    'Cardamom': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Fennel': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Cumin': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Coriander': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Bay Leaf': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Star Anise': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Nutmeg': 'Generally safe in small amounts, toxic in large doses. May cause hallucinations and other serious side effects.',
    'Allspice': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Vanilla': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Lemongrass': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Citronella': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Bergamot': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Jasmine': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Rose': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Ylang-Ylang': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Patchouli': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Sandalwood': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Frankincense': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Myrrh': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Tea Tree': 'Generally safe for topical use, toxic if ingested. May cause skin irritation in sensitive individuals.',
    'Eucalyptus': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Spearmint': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Wintergreen': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Clary Sage': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Geranium': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Neroli': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Petitgrain': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Orange': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Lemon': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Lime': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Grapefruit': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Mandarin': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Tangerine': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Cedarwood': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Cypress': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Juniper': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Pine': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Spruce': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Fir': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.',
    'Hemlock': 'Generally safe, may cause digestive upset in large amounts. May cause allergic reactions in some people.'
  };
  
  // Try to find a match (case insensitive)
  const normalizedName = plantName.toLowerCase();
  for (const [key, value] of Object.entries(safetyDatabase)) {
    if (key.toLowerCase().includes(normalizedName) || normalizedName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return 'Consult healthcare provider before use. Verify plant identification and safety information.';
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
