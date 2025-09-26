import remediesData from '../data/remedies.json' assert { type: 'json' };

/**
 * Matches a disease with traditional African remedies
 * @param {string} disease - The name of the disease to find remedies for
 * @returns {Array} Array of matching remedies
 */
export const matchRemedies = (disease) => {
  if (!disease || typeof disease !== 'string') {
    return [];
  }
  
  const normalizedDisease = disease.toLowerCase().trim();
  
  // Find remedies that match the disease
  const matchingRemedies = remediesData.remedies.filter(remedy => 
    remedy.forDiseases.some(d => d.toLowerCase() === normalizedDisease)
  );
  
  return matchingRemedies.map(remedy => ({
    name: remedy.name,
    description: remedy.description,
    preparation: remedy.preparation,
    usage: remedy.usage,
    warnings: remedy.warnings || 'Consult a healthcare professional before use',
    origin: remedy.origin || 'Traditional African medicine'
  }));
};

/**
 * Gets all available remedies
 * @returns {Array} All available remedies
 */
export const getAllRemedies = () => {
  return remediesData.remedies;
};
