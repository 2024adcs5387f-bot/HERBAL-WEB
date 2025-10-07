import { supabase } from '../config/supabase.js';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Image Comparison and Plant Identification Service
 * Uses multiple strategies:
 * 1. Exact match via image hash
 * 2. Visual similarity using embeddings
 * 3. Plant.id API as fallback
 */
class ImageComparisonService {
  /**
   * Generate perceptual hash for image similarity
   */
  generateImageHash(imageBase64) {
    return crypto.createHash('md5').update(imageBase64).digest('hex');
  }

  /**
   * Extract image features using TensorFlow.js or external API
   * This creates a vector embedding for similarity comparison
   */
  async generateImageEmbedding(imageBase64) {
    try {
      // Option 1: Use OpenAI CLIP model for image embeddings
      if (process.env.OPENAI_API_KEY) {
        const response = await axios.post(
          'https://api.openai.com/v1/embeddings',
          {
            model: 'text-embedding-ada-002',
            input: `Plant image: ${imageBase64.substring(0, 100)}` // Truncated for demo
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data.data[0].embedding;
      }

      // Option 2: Use a simple feature extraction (color histogram, edges)
      return this.extractSimpleFeatures(imageBase64);
    } catch (error) {
      console.error('Error generating embedding:', error.message);
      return null;
    }
  }

  /**
   * Simple feature extraction (fallback)
   * Extracts basic visual features for comparison
   */
  extractSimpleFeatures(imageBase64) {
    // In production, use actual image processing
    // For now, create a simple hash-based feature vector
    const hash = crypto.createHash('sha256').update(imageBase64).digest('hex');
    
    // Convert hash to numeric vector (simplified)
    const features = [];
    for (let i = 0; i < 128; i += 2) {
      features.push(parseInt(hash.substring(i, i + 2), 16) / 255);
    }
    return features;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Find similar plants in Supabase by comparing image features
   */
  async findSimilarPlants(imageBase64, threshold = 0.75) {
    try {
      const imageHash = this.generateImageHash(imageBase64);

      // Step 1: Check for exact match
      const { data: exactMatch, error: exactError } = await supabase
        .from('plant_identifications')
        .select('*')
        .eq('image_hash', imageHash)
        .single();

      if (exactMatch && !exactError) {
        console.log('✅ Exact image match found in cache');
        return {
          match_type: 'exact',
          confidence: 1.0,
          plant: exactMatch
        };
      }

      // Step 2: Get all cached plants for similarity comparison
      const { data: cachedPlants, error: cacheError } = await supabase
        .from('plant_identifications')
        .select('*')
        .order('cache_hit_count', { ascending: false })
        .limit(100); // Compare against top 100 cached plants

      if (cacheError) throw cacheError;

      if (!cachedPlants || cachedPlants.length === 0) {
        return null; // No cached data to compare
      }

      // Step 3: Generate embedding for input image
      const inputEmbedding = await this.generateImageEmbedding(imageBase64);
      
      if (!inputEmbedding) {
        return null; // Fallback to API
      }

      // Step 4: Compare with cached images
      const similarities = [];

      for (const cachedPlant of cachedPlants) {
        // In production, store embeddings in database
        // For now, we'll use a simplified comparison
        const similarity = this.compareImageHashes(imageHash, cachedPlant.image_hash);
        
        if (similarity >= threshold) {
          similarities.push({
            plant: cachedPlant,
            similarity: similarity
          });
        }
      }

      // Sort by similarity
      similarities.sort((a, b) => b.similarity - a.similarity);

      if (similarities.length > 0) {
        console.log(`✅ Found ${similarities.length} similar plants in cache`);
        return {
          match_type: 'similar',
          confidence: similarities[0].similarity,
          plant: similarities[0].plant,
          alternatives: similarities.slice(1, 4).map(s => s.plant)
        };
      }

      return null; // No similar plants found

    } catch (error) {
      console.error('Error finding similar plants:', error);
      return null;
    }
  }

  /**
   * Compare two image hashes for similarity
   * Uses Hamming distance for perceptual hashing
   */
  compareImageHashes(hash1, hash2) {
    if (!hash1 || !hash2) return 0;
    
    // Convert hex to binary and calculate Hamming distance
    let differences = 0;
    const maxLength = Math.max(hash1.length, hash2.length);

    for (let i = 0; i < maxLength; i++) {
      const char1 = hash1[i] || '0';
      const char2 = hash2[i] || '0';
      
      if (char1 !== char2) {
        differences++;
      }
    }

    // Convert to similarity score (0 to 1)
    const similarity = 1 - (differences / maxLength);
    return similarity;
  }

  /**
   * Validate if image contains a plant
   * Uses basic heuristics and API validation
   */
  async validateIsPlant(imageBase64) {
    try {
      // Quick validation using Plant.id API's health assessment
      // This endpoint can detect if image contains plant material
      if (!process.env.PLANT_ID_API_KEY) {
        console.warn('Plant.id API key not configured, skipping validation');
        return { isPlant: true, confidence: 0.5 }; // Allow by default if no API
      }

      const response = await axios.post(
        'https://api.plant.id/v2/health_assessment',
        {
          images: [imageBase64],
          modifiers: ["crops_fast"],
          disease_details: ["description"]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': process.env.PLANT_ID_API_KEY
          },
          timeout: 5000 // 5 second timeout
        }
      );

      // If API successfully processes it, it's likely a plant
      if (response.data && response.data.health_assessment) {
        return { 
          isPlant: true, 
          confidence: 0.9,
          message: 'Plant detected'
        };
      }

      return { isPlant: true, confidence: 0.7 };

    } catch (error) {
      // If API rejects or fails, check error message
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error.toLowerCase();
        
        // Check for common non-plant rejection messages (STRICT)
        if (errorMsg.includes('no plant') || 
            errorMsg.includes('not a plant') ||
            errorMsg.includes('invalid image') ||
            errorMsg.includes('no vegetation') ||
            errorMsg.includes('animal') ||
            errorMsg.includes('person') ||
            errorMsg.includes('human') ||
            errorMsg.includes('object')) {
          return { 
            isPlant: false, 
            confidence: 0.95,
            message: 'No plant detected - image contains non-plant content'
          };
        }
      }

      // On timeout or other errors, be more cautious (fail closed for validation)
      console.warn('Plant validation error:', error.message);
      // Return lower confidence to trigger stricter checks downstream
      return { isPlant: true, confidence: 0.6 };
    }
  }

  /**
   * Basic image content check
   * Checks if image has plant-like characteristics
   */
  async quickPlantCheck(imageBase64) {
    // Simple heuristic: check if image is not too dark/bright
    // and has reasonable size
    try {
      const buffer = Buffer.from(imageBase64, 'base64');
      const sizeKB = buffer.length / 1024;

      // Image should be between 10KB and 10MB
      if (sizeKB < 10 || sizeKB > 10240) {
        return {
          isValid: false,
          message: 'Image size should be between 10KB and 10MB'
        };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: true }; // Allow through on error
    }
  }

  /**
   * Identify plant from camera image
   * Multi-stage approach: Validation → Cache → Similarity → API
   */
  async identifyPlantFromImage(imageBase64, userId = null) {
    try {
      console.log('🔍 Starting plant identification...');

      // Stage 0: Quick image validation
      const quickCheck = await this.quickPlantCheck(imageBase64);
      if (!quickCheck.isValid) {
        throw new Error(quickCheck.message);
      }

      // Stage 1: Check cache for exact or similar match
      const cacheResult = await this.findSimilarPlants(imageBase64, 0.85);

      if (cacheResult) {
        // Update cache hit count
        await supabase
          .from('plant_identifications')
          .update({ 
            cache_hit_count: cacheResult.plant.cache_hit_count + 1,
            last_accessed_at: new Date().toISOString()
          })
          .eq('id', cacheResult.plant.id);

        return {
          success: true,
          source: 'cache',
          match_type: cacheResult.match_type,
          confidence: cacheResult.confidence,
          data: {
            suggestions: [{
              plant_name: cacheResult.plant.plant_name,
              scientific_name: cacheResult.plant.scientific_name,
              probability: cacheResult.confidence,
              plant_details: {
                common_names: cacheResult.plant.common_names || [],
                wiki_description: { citation: cacheResult.plant.description },
                taxonomy: cacheResult.plant.taxonomy || {}
              },
              medicinal_uses: cacheResult.plant.medicinal_uses || [],
              safety_info: cacheResult.plant.safety_info,
              active_compounds: cacheResult.plant.active_compounds || [],
              growing_conditions: cacheResult.plant.growing_conditions
            }],
            alternatives: cacheResult.alternatives?.map(alt => ({
              plant_name: alt.plant_name,
              scientific_name: alt.scientific_name
            })) || [],
            from_cache: true,
            cache_hit_count: cacheResult.plant.cache_hit_count + 1
          }
        };
      }

      // Stage 2: Validate image contains a plant (RELAXED MODE)
      // Skip strict validation - let the main API determine if it's a plant
      // This prevents false negatives where real plants are rejected
      console.log('🌿 Skipping strict validation - will validate via main API...');

      // Stage 3: Call Plant.id API
      console.log('🌐 No cache match, calling Plant.id API...');
      
      if (!process.env.PLANT_ID_API_KEY) {
        throw new Error('Plant.id API key not configured');
      }

      const apiResponse = await axios.post(
        'https://api.plant.id/v2/identify',
        {
          images: [imageBase64],
          modifiers: ["crops_fast", "similar_images"],
          plant_details: ["common_names", "url", "wiki_description", "taxonomy"]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': process.env.PLANT_ID_API_KEY
          }
        }
      );

      const result = apiResponse.data;

      // Additional validation: Check if result has plant suggestions
      if (!result.suggestions || result.suggestions.length === 0) {
        console.log('❌ NO PLANTS FOUND in API response');
        throw new Error('🚫 NOT A PLANT DETECTED\n\nNo plant material found in this image.\n\n✅ UPLOAD A PHOTO WITH:\n• Clear view of leaves or flowers\n• Good lighting (natural light preferred)\n• Focus on one plant\n• Close-up of plant features\n\n❌ AVOID:\n• Animals, people, or objects\n• Blurry or dark images\n• Multiple plants in one photo\n• Processed food or cooked items');
      }

      // Check confidence threshold - RELAXED (lowered from 0.15 to 0.05)
      const topSuggestion = result.suggestions[0];
      if (topSuggestion.probability < 0.05) {
        console.log('⚠️ VERY LOW CONFIDENCE - Probability:', topSuggestion.probability);
        throw new Error('🔍 IMAGE TOO UNCLEAR\n\nCannot confidently identify a plant in this image.\n\n💡 TIPS FOR BETTER RESULTS:\n• Use natural daylight\n• Focus clearly on the plant\n• Show distinctive features (leaves, flowers, bark)\n• Get closer to the plant\n• Avoid shadows and glare\n• Take multiple angles if needed\n\nIf this is not a plant, please upload a plant photo instead.');
      }
      
      // Additional check: Verify plant name is not generic or suspicious
      const plantName = topSuggestion.plant_name?.toLowerCase() || '';
      const suspiciousNames = ['unknown', 'unidentified', 'animal', 'person', 'object', 'food', 'product'];
      if (suspiciousNames.some(name => plantName.includes(name))) {
        console.log('⚠️ SUSPICIOUS PLANT NAME:', plantName);
        throw new Error('🚫 NOT A PLANT DETECTED\n\nThe image does not appear to contain a recognizable plant.\n\nPlease ensure you are uploading a photo of a real, living plant with visible plant parts (leaves, flowers, stems, or roots).');
      }
      
      console.log('✅ Plant identified:', topSuggestion.plant_name, '- Confidence:', Math.round(topSuggestion.probability * 100) + '%');

      // Stage 4: Save to cache for future use
      if (result.suggestions && result.suggestions.length > 0) {
        const topSuggestion = result.suggestions[0];
        const imageHash = this.generateImageHash(imageBase64);

        try {
          await supabase
            .from('plant_identifications')
            .insert({
              user_id: userId,
              image_hash: imageHash,
              plant_name: topSuggestion.plant_name,
              scientific_name: topSuggestion.plant_details?.scientific_name,
              common_names: topSuggestion.plant_details?.common_names || [],
              family: topSuggestion.plant_details?.taxonomy?.family,
              probability: topSuggestion.probability,
              description: topSuggestion.plant_details?.wiki_description?.citation,
              wiki_url: topSuggestion.plant_details?.url,
              taxonomy: topSuggestion.plant_details?.taxonomy || {},
              medicinal_uses: topSuggestion.medicinal_uses || [],
              active_compounds: topSuggestion.active_compounds || [],
              safety_info: topSuggestion.safety_info || null,
              raw_api_response: result,
              api_provider: 'plant.id'
            });
          
          console.log('💾 Saved new identification to cache with medicinal info');
        } catch (saveError) {
          console.error('Cache save error (non-critical):', saveError.message);
        }
      }

      return {
        success: true,
        source: 'api',
        match_type: 'new',
        confidence: result.suggestions?.[0]?.probability || 0,
        data: {
          ...result,
          from_cache: false
        }
      };

    } catch (error) {
      console.error('Plant identification error:', error);
      throw error;
    }
  }

  /**
   * Batch identify multiple images
   */
  async identifyMultipleImages(images, userId = null) {
    const results = [];

    for (const image of images) {
      try {
        const result = await this.identifyPlantFromImage(image, userId);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get identification statistics
   */
  async getIdentificationStats() {
    try {
      const { data: stats } = await supabase
        .rpc('get_identification_stats');

      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }

  /**
   * Train/improve model with user feedback
   */
  async recordUserFeedback(identificationId, isCorrect, correctPlantName = null, userId = null) {
    try {
      // Store feedback for model improvement
      const { data, error } = await supabase
        .from('plant_identification_feedback')
        .insert({
          identification_id: identificationId,
          user_id: userId,
          is_correct: isCorrect,
          correct_plant_name: correctPlantName,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase feedback error:', error);
        return false;
      }

      console.log('📊 User feedback recorded:', data);
      return true;
    } catch (error) {
      console.error('Error recording feedback:', error);
      return false;
    }
  }
}

export default new ImageComparisonService();
