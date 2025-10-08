import { supabase } from '../config/supabase.js';

/**
 * Plant Comparison Service
 * Compares uploaded images with database plants and calculates similarity
 */
class PlantComparisonService {
  /**
   * Extract features from image description or API response
   */
  extractImageFeatures(plantData) {
    return {
      leaf_color: this.extractLeafColor(plantData),
      leaf_shape: this.extractLeafShape(plantData),
      flower_color: this.extractFlowerColor(plantData),
      flower_shape: this.extractFlowerShape(plantData),
      growth_pattern: this.extractGrowthPattern(plantData),
      texture: this.extractTexture(plantData),
      size_category: this.extractSizeCategory(plantData)
    };
  }

  extractLeafColor(plantData) {
    const description = (plantData.description || '').toLowerCase();
    const name = (plantData.plant_name || '').toLowerCase();
    
    if (description.includes('dark green') || name.includes('dark')) return 'dark_green';
    if (description.includes('light green') || description.includes('pale')) return 'light_green';
    if (description.includes('yellow') || description.includes('golden')) return 'yellow_green';
    if (description.includes('grey') || description.includes('gray')) return 'grey_green';
    if (description.includes('blue') || description.includes('silvery')) return 'blue_green';
    return 'green';
  }

  extractLeafShape(plantData) {
    const description = (plantData.description || '').toLowerCase();
    
    if (description.includes('lance') || description.includes('narrow')) return 'lanceolate';
    if (description.includes('oval') || description.includes('elliptic')) return 'oval';
    if (description.includes('round') || description.includes('circular')) return 'round';
    if (description.includes('heart') || description.includes('cordate')) return 'heart_shaped';
    if (description.includes('needle') || description.includes('linear')) return 'needle_like';
    if (description.includes('palm') || description.includes('lobed')) return 'palmate';
    return 'unknown';
  }

  extractFlowerColor(plantData) {
    const description = (plantData.description || '').toLowerCase();
    const name = (plantData.plant_name || '').toLowerCase();
    
    if (description.includes('white') || name.includes('white')) return 'white';
    if (description.includes('yellow') || name.includes('yellow')) return 'yellow';
    if (description.includes('purple') || name.includes('purple')) return 'purple';
    if (description.includes('pink') || name.includes('pink')) return 'pink';
    if (description.includes('red') || name.includes('red')) return 'red';
    if (description.includes('blue') || name.includes('blue')) return 'blue';
    if (description.includes('orange') || name.includes('orange')) return 'orange';
    return 'none';
  }

  extractFlowerShape(plantData) {
    const description = (plantData.description || '').toLowerCase();
    
    if (description.includes('daisy') || description.includes('ray')) return 'daisy_like';
    if (description.includes('cone') || description.includes('spike')) return 'cone_shaped';
    if (description.includes('bell') || description.includes('tubular')) return 'bell_shaped';
    if (description.includes('star')) return 'star_shaped';
    if (description.includes('cluster')) return 'clustered';
    return 'unknown';
  }

  extractGrowthPattern(plantData) {
    const description = (plantData.description || '').toLowerCase();
    
    if (description.includes('rosette')) return 'rosette';
    if (description.includes('vine') || description.includes('climbing')) return 'climbing';
    if (description.includes('bush') || description.includes('shrub')) return 'bushy';
    if (description.includes('upright') || description.includes('erect')) return 'upright';
    if (description.includes('spreading') || description.includes('mat')) return 'spreading';
    return 'unknown';
  }

  extractTexture(plantData) {
    const description = (plantData.description || '').toLowerCase();
    
    if (description.includes('smooth')) return 'smooth';
    if (description.includes('hairy') || description.includes('fuzzy')) return 'hairy';
    if (description.includes('rough') || description.includes('coarse')) return 'rough';
    if (description.includes('waxy') || description.includes('glossy')) return 'waxy';
    if (description.includes('succulent') || description.includes('fleshy')) return 'succulent';
    return 'unknown';
  }

  extractSizeCategory(plantData) {
    const description = (plantData.description || '').toLowerCase();
    
    if (description.includes('tree') || description.includes('tall')) return 'large';
    if (description.includes('shrub') || description.includes('bush')) return 'medium';
    if (description.includes('small') || description.includes('herb')) return 'small';
    return 'medium';
  }

  /**
   * Calculate similarity between input features and database plant
   */
  calculateSimilarity(inputFeatures, dbPlantFeatures) {
    let matchCount = 0;
    let totalFeatures = 0;
    const featureWeights = {
      leaf_color: 1.5,
      leaf_shape: 2.0,
      flower_color: 1.5,
      flower_shape: 1.0,
      growth_pattern: 1.0,
      texture: 1.0,
      size_category: 0.5
    };

    let weightedScore = 0;
    let totalWeight = 0;

    for (const [feature, inputValue] of Object.entries(inputFeatures)) {
      if (inputValue && inputValue !== 'unknown' && dbPlantFeatures[feature]) {
        totalFeatures++;
        const weight = featureWeights[feature] || 1.0;
        totalWeight += weight;

        if (inputValue === dbPlantFeatures[feature]) {
          matchCount++;
          weightedScore += weight;
        } else if (this.isSimilarFeature(feature, inputValue, dbPlantFeatures[feature])) {
          // Partial match for similar features
          weightedScore += weight * 0.5;
        }
      }
    }

    // Calculate percentage
    const similarityPercentage = totalWeight > 0 
      ? (weightedScore / totalWeight) * 100 
      : 0;

    return {
      percentage: Math.round(similarityPercentage * 10) / 10,
      matchedFeatures: matchCount,
      totalFeatures: totalFeatures,
      confidence: this.getConfidenceLevel(similarityPercentage)
    };
  }

  /**
   * Check if two feature values are similar
   */
  isSimilarFeature(featureType, value1, value2) {
    const similarGroups = {
      leaf_color: [
        ['dark_green', 'green'],
        ['light_green', 'yellow_green'],
        ['grey_green', 'blue_green']
      ],
      leaf_shape: [
        ['oval', 'round'],
        ['lanceolate', 'needle_like']
      ],
      flower_color: [
        ['pink', 'red'],
        ['purple', 'blue'],
        ['yellow', 'orange']
      ]
    };

    const groups = similarGroups[featureType] || [];
    return groups.some(group => 
      group.includes(value1) && group.includes(value2)
    );
  }

  /**
   * Get confidence level based on similarity percentage
   */
  getConfidenceLevel(percentage) {
    if (percentage >= 90) return 'Very High';
    if (percentage >= 75) return 'High';
    if (percentage >= 60) return 'Moderate';
    if (percentage >= 40) return 'Low';
    return 'Very Low';
  }

  /**
   * Compare input plant with all database plants
   */
  async compareWithDatabase(plantData) {
    try {
      // Extract features from input
      const inputFeatures = this.extractImageFeatures(plantData);

      // Get all medicinal plants from database
      const { data: dbPlants, error } = await supabase
        .from('medicinal_plants')
        .select('*')
        .eq('verified', true);

      // Handle missing table gracefully
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          console.warn('⚠️ medicinal_plants table not found - comparison feature disabled');
          return {
            input_features: inputFeatures,
            comparisons: [],
            best_match: null,
            top_matches: [],
            message: 'Comparison feature is currently unavailable. The medicinal plants database table has not been set up yet.'
          };
        }
        throw error;
      }

      // If no plants in database
      if (!dbPlants || dbPlants.length === 0) {
        return {
          input_features: inputFeatures,
          comparisons: [],
          best_match: null,
          top_matches: [],
          message: 'No medicinal plants in database for comparison.'
        };
      }

      // Calculate similarity for each plant
      const comparisons = dbPlants.map(dbPlant => {
        const dbFeatures = dbPlant.image_features || {};
        const similarity = this.calculateSimilarity(inputFeatures, dbFeatures);

        return {
          plant_id: dbPlant.id,
          common_name: dbPlant.common_name,
          scientific_name: dbPlant.scientific_name,
          botanical_family: dbPlant.botanical_family,
          similarity_percentage: similarity.percentage,
          matched_features: similarity.matchedFeatures,
          total_features: similarity.totalFeatures,
          confidence: similarity.confidence,
          medicinal_uses: dbPlant.medicinal_uses,
          safety_rating: dbPlant.safety_rating,
          image_features: dbFeatures
        };
      });

      // Sort by similarity percentage
      comparisons.sort((a, b) => b.similarity_percentage - a.similarity_percentage);

      return {
        input_features: inputFeatures,
        comparisons: comparisons,
        best_match: comparisons[0],
        top_matches: comparisons.slice(0, 5)
      };
    } catch (error) {
      console.error('Comparison error:', error);
      throw error;
    }
  }

  /**
   * Get diseases that can affect a specific plant
   */
  async getPlantDiseases(plantName) {
    try {
      const { data, error } = await supabase
        .from('plant_diseases')
        .select('*')
        .contains('affected_plants', [plantName.toLowerCase()]);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching diseases:', error);
      return [];
    }
  }

  /**
   * Get all common plant diseases
   */
  async getAllDiseases() {
    try {
      const { data, error } = await supabase
        .from('plant_diseases')
        .select('*')
        .order('severity', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching all diseases:', error);
      return [];
    }
  }
}

export default new PlantComparisonService();
