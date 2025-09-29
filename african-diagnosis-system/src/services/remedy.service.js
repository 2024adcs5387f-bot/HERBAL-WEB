import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve path to remedies.json in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const remediesPath = path.resolve(__dirname, '../data/remedies.json');

let remediesData = { remedies: [] };
try {
  const raw = fs.readFileSync(remediesPath, 'utf-8');
  remediesData = JSON.parse(raw);
} catch (e) {
  console.error('Failed to load remedies.json:', e.message);
}

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
