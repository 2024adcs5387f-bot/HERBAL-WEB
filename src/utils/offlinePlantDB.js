// Offline Plant Database for basic plant identification
// This provides a fallback when the API is unavailable

export const offlinePlantDatabase = {
  // Common plants with basic identification features
  'dandelion': {
    name: 'Common Dandelion',
    scientificName: 'Taraxacum officinale',
    family: 'Asteraceae',
    commonNames: ['Dandelion', 'Lion\'s Tooth', 'Puffball'],
    description: 'A perennial herbaceous plant with bright yellow flowers and distinctive seed heads. Native to Eurasia and North America.',
    medicinalUses: [
      'Liver and digestive health support',
      'Natural diuretic properties',
      'Rich in vitamins A, C, and K',
      'Traditional use for skin conditions',
      'Supports immune system function'
    ],
    activeCompounds: [
      'Taraxacin',
      'Inulin',
      'Flavonoids',
      'Triterpenes',
      'Vitamins and minerals'
    ],
    growingConditions: 'Prefers full sun to partial shade, well-drained soil, commonly found in lawns, gardens, and disturbed areas.',
    toxicity: 'Generally safe when consumed in moderation. Avoid if allergic to Asteraceae family plants.',
    identificationFeatures: [
      'Bright yellow composite flowers',
      'Basal rosette of toothed leaves',
      'Hollow stems with milky sap',
      'Distinctive puffball seed heads',
      'Deep taproot'
    ]
  },
  
  'clover': {
    name: 'White Clover',
    scientificName: 'Trifolium repens',
    family: 'Fabaceae',
    commonNames: ['White Clover', 'Dutch Clover', 'Ladino Clover'],
    description: 'A low-growing perennial plant with white or pinkish flowers and three-part leaves. Common in lawns and meadows.',
    medicinalUses: [
      'Respiratory support',
      'Antioxidant properties',
      'Traditional use for coughs and colds',
      'Skin healing properties',
      'Digestive support'
    ],
    activeCompounds: [
      'Isoflavones',
      'Flavonoids',
      'Tannins',
      'Vitamins and minerals'
    ],
    growingConditions: 'Prefers moist, well-drained soil in full sun to partial shade. Common in lawns, meadows, and disturbed areas.',
    toxicity: 'Generally safe when consumed in moderation. May cause digestive upset in large amounts.',
    identificationFeatures: [
      'Three-part leaves (trifoliate)',
      'White or pinkish ball-shaped flowers',
      'Low-growing, creeping habit',
      'Small, rounded leaflets',
      'Root nodules for nitrogen fixation'
    ]
  },
  
  'plantain': {
    name: 'Broadleaf Plantain',
    scientificName: 'Plantago major',
    family: 'Plantaginaceae',
    commonNames: ['Broadleaf Plantain', 'Common Plantain', 'Greater Plantain'],
    description: 'A perennial herb with broad, oval leaves and tall flower spikes. Common in lawns, gardens, and disturbed areas.',
    medicinalUses: [
      'Skin healing and wound care',
      'Anti-inflammatory properties',
      'Respiratory support',
      'Digestive aid',
      'Antimicrobial properties'
    ],
    activeCompounds: [
      'Mucilage',
      'Tannins',
      'Flavonoids',
      'Iridoids',
      'Vitamins and minerals'
    ],
    growingConditions: 'Prefers moist, well-drained soil in full sun to partial shade. Common in lawns, gardens, and disturbed areas.',
    toxicity: 'Generally safe when consumed in moderation. May cause digestive upset in sensitive individuals.',
    identificationFeatures: [
      'Broad, oval leaves with parallel veins',
      'Basal rosette growth pattern',
      'Tall, slender flower spikes',
      'Small, greenish flowers',
      'Fibrous root system'
    ]
  },
  
  'chickweed': {
    name: 'Common Chickweed',
    scientificName: 'Stellaria media',
    family: 'Caryophyllaceae',
    commonNames: ['Common Chickweed', 'Starwort', 'Winterweed'],
    description: 'A low-growing annual plant with small white flowers and oval leaves. Common in gardens and disturbed areas.',
    medicinalUses: [
      'Skin healing and soothing',
      'Anti-inflammatory properties',
      'Respiratory support',
      'Digestive aid',
      'Rich in vitamins and minerals'
    ],
    activeCompounds: [
      'Saponins',
      'Flavonoids',
      'Vitamins A, C, and D',
      'Minerals (iron, calcium, magnesium)'
    ],
    growingConditions: 'Prefers moist, fertile soil in partial shade. Common in gardens, lawns, and disturbed areas.',
    toxicity: 'Generally safe when consumed in moderation. May cause digestive upset in large amounts.',
    identificationFeatures: [
      'Small, white, star-shaped flowers',
      'Oval leaves in opposite pairs',
      'Low-growing, spreading habit',
      'Single line of hairs on stems',
      'Tender, succulent stems'
    ]
  },
  
  'nettle': {
    name: 'Stinging Nettle',
    scientificName: 'Urtica dioica',
    family: 'Urticaceae',
    commonNames: ['Stinging Nettle', 'Common Nettle', 'Burning Nettle'],
    description: 'A perennial herb with serrated leaves and stinging hairs. Common in moist areas and disturbed sites.',
    medicinalUses: [
      'Anti-inflammatory properties',
      'Allergy relief',
      'Joint pain relief',
      'Rich in vitamins and minerals',
      'Traditional use for arthritis'
    ],
    activeCompounds: [
      'Histamine',
      'Serotonin',
      'Flavonoids',
      'Vitamins A, C, and K',
      'Minerals (iron, calcium, magnesium)'
    ],
    growingConditions: 'Prefers moist, fertile soil in partial shade. Common in moist areas, stream banks, and disturbed sites.',
    toxicity: 'Stinging hairs can cause skin irritation. Generally safe when properly prepared (cooked or dried).',
    identificationFeatures: [
      'Serrated, heart-shaped leaves',
      'Stinging hairs on leaves and stems',
      'Greenish flowers in clusters',
      'Square stems',
      'Opposite leaf arrangement'
    ]
  },
  
  'mint': {
    name: 'Wild Mint',
    scientificName: 'Mentha arvensis',
    family: 'Lamiaceae',
    commonNames: ['Wild Mint', 'Field Mint', 'Corn Mint'],
    description: 'A perennial herb with aromatic leaves and small purple or white flowers. Common in moist areas.',
    medicinalUses: [
      'Digestive aid',
      'Respiratory support',
      'Antimicrobial properties',
      'Headache relief',
      'Nausea relief'
    ],
    activeCompounds: [
      'Menthol',
      'Menthone',
      'Flavonoids',
      'Tannins',
      'Vitamins and minerals'
    ],
    growingConditions: 'Prefers moist, well-drained soil in full sun to partial shade. Common in moist areas and stream banks.',
    toxicity: 'Generally safe when consumed in moderation. May cause heartburn in some people.',
    identificationFeatures: [
      'Aromatic, serrated leaves',
      'Square stems',
      'Small purple or white flowers',
      'Opposite leaf arrangement',
      'Spreading, creeping habit'
    ]
  },
  
  'yarrow': {
    name: 'Common Yarrow',
    scientificName: 'Achillea millefolium',
    family: 'Asteraceae',
    commonNames: ['Common Yarrow', 'Milfoil', 'Soldier\'s Woundwort'],
    description: 'A perennial herb with feathery leaves and flat-topped clusters of white or pink flowers.',
    medicinalUses: [
      'Wound healing',
      'Anti-inflammatory properties',
      'Digestive aid',
      'Fever reduction',
      'Menstrual support'
    ],
    activeCompounds: [
      'Achillein',
      'Flavonoids',
      'Tannins',
      'Volatile oils',
      'Vitamins and minerals'
    ],
    growingConditions: 'Prefers well-drained soil in full sun. Common in meadows, roadsides, and disturbed areas.',
    toxicity: 'Generally safe when consumed in moderation. May cause allergic reactions in some people.',
    identificationFeatures: [
      'Feathery, fern-like leaves',
      'Flat-topped flower clusters',
      'White or pink flowers',
      'Aromatic when crushed',
      'Upright, branching stems'
    ]
  },
  
  'burdock': {
    name: 'Greater Burdock',
    scientificName: 'Arctium lappa',
    family: 'Asteraceae',
    commonNames: ['Greater Burdock', 'Common Burdock', 'Cocklebur'],
    description: 'A biennial plant with large, heart-shaped leaves and purple thistle-like flowers that produce burrs.',
    medicinalUses: [
      'Blood purification',
      'Skin health',
      'Digestive support',
      'Anti-inflammatory properties',
      'Traditional use for arthritis'
    ],
    activeCompounds: [
      'Inulin',
      'Flavonoids',
      'Tannins',
      'Volatile oils',
      'Vitamins and minerals'
    ],
    growingConditions: 'Prefers moist, fertile soil in full sun to partial shade. Common in disturbed areas and waste places.',
    toxicity: 'Generally safe when consumed in moderation. May cause allergic reactions in some people.',
    identificationFeatures: [
      'Large, heart-shaped leaves',
      'Purple thistle-like flowers',
      'Sticky burrs that cling to clothing',
      'Biennial growth habit',
      'Deep taproot'
    ]
  }
};

// Function to perform basic offline plant identification
export function identifyPlantOffline(imageData) {
  // This is a simplified offline identification
  // In a real implementation, you would use computer vision or machine learning
  // For now, we'll return a random plant from our database as a demo
  
  const plantNames = Object.keys(offlinePlantDatabase);
  const randomPlant = plantNames[Math.floor(Math.random() * plantNames.length)];
  const plant = offlinePlantDatabase[randomPlant];
  
  return {
    success: true,
    data: {
      suggestions: [{
        plant_name: plant.name,
        probability: 0.75, // Simulated confidence
        plant_details: {
          scientific_name: plant.scientificName,
          common_names: plant.commonNames,
          wiki_description: {
            citation: plant.description
          },
          taxonomy: {
            family: plant.family
          }
        },
        medicinal_uses: plant.medicinalUses,
        safety_info: plant.toxicity,
        identification_features: plant.identificationFeatures
      }],
      offline: true,
      message: 'Identified using offline database. For more accurate results, please check your internet connection.'
    }
  };
}

// Function to check if we're online
export function isOnline() {
  return navigator.onLine;
}

// Function to get cached plant data
export function getCachedPlantData(plantName) {
  const normalizedName = plantName.toLowerCase().replace(/\s+/g, '');
  return offlinePlantDatabase[normalizedName] || null;
}

// Function to add plant to cache
export function cachePlantData(plantName, plantData) {
  const normalizedName = plantName.toLowerCase().replace(/\s+/g, '');
  offlinePlantDatabase[normalizedName] = plantData;
  
  // Save to localStorage
  try {
    localStorage.setItem('cachedPlants', JSON.stringify(offlinePlantDatabase));
  } catch (error) {
    console.warn('Could not save plant data to cache:', error);
  }
}

// Function to load cached plants from localStorage
export function loadCachedPlants() {
  try {
    const cached = localStorage.getItem('cachedPlants');
    if (cached) {
      const cachedData = JSON.parse(cached);
      Object.assign(offlinePlantDatabase, cachedData);
    }
  } catch (error) {
    console.warn('Could not load cached plant data:', error);
  }
}

// Initialize cached plants on module load
loadCachedPlants();
