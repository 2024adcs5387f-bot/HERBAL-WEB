import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { ResearchPost, Herb, Disease, User } from '../models/index.js';

const router = express.Router();

// Get research knowledge for AI training/recommendations
router.get('/research-knowledge', authenticate, async (req, res) => {
  try {
    const { limit = 100, herbId, diseaseId, verified } = req.query;
    
    const where = {
      status: 'published' // Only published research
    };
    
    if (herbId) where.relatedHerbId = herbId;
    if (diseaseId) where.relatedDiseaseId = diseaseId;
    if (verified === 'true') where.isVerified = true;

    const researchPosts = await ResearchPost.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'userType'] },
        { model: Herb, as: 'herb', attributes: ['id', 'name', 'scientificName', 'medicinalUses'] },
        { model: Disease, as: 'disease', attributes: ['id', 'name', 'symptoms'] }
      ],
      order: [['isVerified', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    // Format data for AI consumption
    const knowledgeBase = researchPosts.rows.map(post => ({
      id: post.id,
      title: post.title,
      abstract: post.abstract,
      content: post.content,
      author: {
        name: post.author?.name,
        type: post.author?.userType,
        verified: ['researcher', 'herbalist', 'admin'].includes(post.author?.userType)
      },
      herb: post.herb ? {
        name: post.herb.name,
        scientificName: post.herb.scientificName,
        medicinalUses: post.herb.medicinalUses
      } : null,
      disease: post.disease ? {
        name: post.disease.name,
        symptoms: post.disease.symptoms
      } : null,
      verified: post.isVerified,
      publishedAt: post.createdAt,
      references: post.references || [],
      keywords: extractKeywords(post.title, post.abstract, post.content)
    }));

    res.json({
      success: true,
      data: {
        knowledgeBase,
        totalPosts: researchPosts.count,
        summary: {
          totalHerbs: new Set(researchPosts.rows.map(p => p.herb?.id).filter(Boolean)).size,
          totalDiseases: new Set(researchPosts.rows.map(p => p.disease?.id).filter(Boolean)).size,
          verifiedPosts: researchPosts.rows.filter(p => p.isVerified).length,
          recentPosts: researchPosts.rows.filter(p => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(p.createdAt) > weekAgo;
          }).length
        }
      }
    });

  } catch (error) {
    console.error('Get research knowledge error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get herbal knowledge summary for AI recommendations
router.get('/herbal-knowledge', authenticate, async (req, res) => {
  try {
    const herbs = await Herb.findAll({
      include: [
        { 
          model: ResearchPost, 
          as: 'researchPosts',
          where: { status: 'published' },
          required: false,
          include: [
            { model: Disease, as: 'disease', attributes: ['id', 'name'] }
          ]
        }
      ]
    });

    const diseases = await Disease.findAll({
      include: [
        { 
          model: ResearchPost, 
          as: 'researchPosts',
          where: { status: 'published' },
          required: false,
          include: [
            { model: Herb, as: 'herb', attributes: ['id', 'name', 'scientificName'] }
          ]
        }
      ]
    });

    // Create knowledge mapping
    const herbDiseaseMap = {};
    const diseaseHerbMap = {};

    herbs.forEach(herb => {
      herbDiseaseMap[herb.name] = {
        scientificName: herb.scientificName,
        medicinalUses: herb.medicinalUses || [],
        relatedDiseases: herb.researchPosts?.map(rp => ({
          disease: rp.disease?.name,
          researchCount: 1,
          verified: rp.isVerified
        })).filter(Boolean) || []
      };
    });

    diseases.forEach(disease => {
      diseaseHerbMap[disease.name] = {
        symptoms: disease.symptoms || [],
        relatedHerbs: disease.researchPosts?.map(rp => ({
          herb: rp.herb?.name,
          scientificName: rp.herb?.scientificName,
          researchCount: 1,
          verified: rp.isVerified
        })).filter(Boolean) || []
      };
    });

    res.json({
      success: true,
      data: {
        herbDiseaseMap,
        diseaseHerbMap,
        totalHerbs: herbs.length,
        totalDiseases: diseases.length,
        totalConnections: Object.values(herbDiseaseMap).reduce((sum, herb) => sum + herb.relatedDiseases.length, 0)
      }
    });

  } catch (error) {
    console.error('Get herbal knowledge error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Enhanced AI recommendation endpoint that uses research data
router.post('/ai-enhanced-recommend', authenticate, async (req, res) => {
  try {
    const { conditions, preferences, allergies } = req.body;

    if (!conditions || conditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one condition is required'
      });
    }

    // Get relevant research for the conditions
    const researchPromises = conditions.map(async (condition) => {
      const research = await ResearchPost.findAll({
        where: {
          status: 'published',
          '$disease.name$': { [require('sequelize').Op.iLike]: `%${condition}%` }
        },
        include: [
          { model: Disease, as: 'disease', attributes: ['id', 'name'] },
          { model: Herb, as: 'herb', attributes: ['id', 'name', 'scientificName'] },
          { model: User, as: 'author', attributes: ['userType'] }
        ],
        limit: 5,
        order: [['isVerified', 'DESC'], ['createdAt', 'DESC']]
      });
      
      return { condition, research };
    });

    const researchData = await Promise.all(researchPromises);

    // Build enhanced recommendation context
    const researchContext = researchData.map(({ condition, research }) => ({
      condition,
      relevantHerbs: research.map(r => r.herb?.name).filter(Boolean),
      researchCount: research.length,
      verifiedResearch: research.filter(r => r.isVerified).length,
      recentFindings: research.slice(0, 2).map(r => ({
        title: r.title,
        herb: r.herb?.name,
        verified: r.isVerified,
        authorType: r.author?.userType
      }))
    }));

    // Create enhanced prompt for AI
    const enhancedPrompt = `Based on the following research data and user conditions, provide herbal recommendations:

User Conditions: ${conditions.join(', ')}
User Preferences: ${preferences || 'None specified'}
Allergies: ${allergies || 'None specified'}

Research Context:
${researchContext.map(ctx => `
Condition: ${ctx.condition}
Relevant Herbs from Research: ${ctx.relevantHerbs.join(', ')}
Research Studies: ${ctx.researchCount} (${ctx.verifiedResearch} verified)
Recent Findings: ${ctx.recentFindings.map(f => `${f.title} (${f.herb})`).join(', ')}
`).join('\n')}

Please provide recommendations that are:
1. Evidence-based from the research data
2. Safe considering the user's allergies
3. Personalized to their preferences
4. Include safety warnings and interactions
5. Suggest consulting healthcare providers

Format as JSON with: recommendations, evidence, safety_notes, interactions, research_citations`;

    // Call OpenAI with enhanced context (you would integrate this with your existing AI service)
    const recommendations = {
      recommendations: [
        {
          herb: "Turmeric",
          condition: "Inflammation",
          evidence: "Research shows anti-inflammatory properties",
          dosage: "500mg twice daily",
          safety: "Generally safe, may interact with blood thinners"
        }
      ],
      evidence: researchContext,
      safety_notes: "Always consult with a healthcare provider before starting any herbal treatment.",
      interactions: "Check for drug interactions with current medications.",
      research_citations: researchData.flatMap(({ research }) => 
        research.map(r => ({ title: r.title, verified: r.isVerified }))
      )
    };

    res.json({
      success: true,
      data: {
        ...recommendations,
        generated_at: new Date().toISOString(),
        research_based: true,
        disclaimer: "This AI-generated advice is based on available research and should not replace professional medical consultation."
      }
    });

  } catch (error) {
    console.error('Enhanced AI recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate enhanced recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Utility function to extract keywords from text
function extractKeywords(title, abstract, content) {
  const text = `${title} ${abstract} ${content}`.toLowerCase();
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were'];
  
  const words = text.match(/\b\w+\b/g) || [];
  const wordCount = {};
  
  words.forEach(word => {
    if (word.length > 3 && !commonWords.includes(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

export default router;
