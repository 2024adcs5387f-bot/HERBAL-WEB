import { supabase, supabaseAdmin } from '../config/supabase.js';
import crypto from 'crypto';

/**
 * Service for managing plant identification data with caching
 */
class PlantIdentificationService {
  /**
   * Generate hash from image data for deduplication
   */
  generateImageHash(imageBase64) {
    return crypto.createHash('md5').update(imageBase64).digest('hex');
  }

  /**
   * Check if plant identification exists in cache
   */
  async checkCache(imageHash) {
    try {
      const { data, error } = await supabase
        .from('plant_identifications')
        .select('*')
        .eq('image_hash', imageHash)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        // Increment cache hit count
        await this.incrementCacheHit(data.id);
        return data;
      }

      return null;
    } catch (error) {
      console.error('Cache check error:', error);
      return null;
    }
  }

  /**
   * Increment cache hit count
   */
  async incrementCacheHit(identificationId) {
    try {
      await supabase
        .from('plant_identifications')
        .update({ 
          cache_hit_count: supabase.raw('cache_hit_count + 1'),
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', identificationId);
    } catch (error) {
      console.error('Error incrementing cache hit:', error);
    }
  }

  /**
   * Save plant identification to database
   */
  async saveIdentification(data) {
    try {
      const {
        userId = null,
        imageUrl = null,
        imageHash,
        plantName,
        scientificName = null,
        commonNames = [],
        family = null,
        probability = null,
        description = null,
        wikiUrl = null,
        taxonomy = {},
        medicinalUses = [],
        activeCompounds = [],
        contraindications = [],
        safetyInfo = null,
        growingConditions = null,
        origin = null,
        habitat = null,
        rawApiResponse = {},
        apiProvider = 'plant.id',
        alternativePlants = []
      } = data;

      const { data: savedData, error } = await supabaseAdmin
        .from('plant_identifications')
        .insert({
          user_id: userId,
          image_url: imageUrl,
          image_hash: imageHash,
          plant_name: plantName,
          scientific_name: scientificName,
          common_names: commonNames,
          family: family,
          probability: probability,
          description: description,
          wiki_url: wikiUrl,
          taxonomy: taxonomy,
          medicinal_uses: medicinalUses,
          active_compounds: activeCompounds,
          contraindications: contraindications,
          safety_info: safetyInfo,
          growing_conditions: growingConditions,
          origin: origin,
          habitat: habitat,
          raw_api_response: rawApiResponse,
          api_provider: apiProvider,
          alternative_plants: alternativePlants
        })
        .select()
        .single();

      if (error) throw error;

      return savedData;
    } catch (error) {
      console.error('Error saving plant identification:', error);
      throw error;
    }
  }

  /**
   * Get user's plant identification history
   */
  async getUserHistory(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('plant_identifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }
  }

  /**
   * Search plant identifications by name
   */
  async searchByName(searchTerm, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('plant_identifications')
        .select('*')
        .or(`plant_name.ilike.%${searchTerm}%,scientific_name.ilike.%${searchTerm}%`)
        .order('cache_hit_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error searching plants:', error);
      throw error;
    }
  }

  /**
   * Get most identified plants (popular)
   */
  async getPopularPlants(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('plant_identifications')
        .select('plant_name, scientific_name, count')
        .order('cache_hit_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching popular plants:', error);
      throw error;
    }
  }

  /**
   * Verify plant identification (herbalist only)
   */
  async verifyIdentification(identificationId, herbalistId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('plant_identifications')
        .update({
          is_verified: true,
          verified_by: herbalistId,
          verified_at: new Date().toISOString()
        })
        .eq('id', identificationId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error verifying identification:', error);
      throw error;
    }
  }

  /**
   * Delete old unverified cache entries (cleanup)
   */
  async cleanupOldCache(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await supabaseAdmin
        .from('plant_identifications')
        .delete()
        .eq('is_verified', false)
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error cleaning up cache:', error);
      throw error;
    }
  }
}

export default new PlantIdentificationService();
