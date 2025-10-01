-- Comprehensive Plant Database Population Script
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. MEDICINAL PLANTS WITH DETAILED INFORMATION
-- ============================================

INSERT INTO medicinal_plants (
    common_name,
    scientific_name,
    slug,
    botanical_family,
    description,
    plant_parts_used,
    active_compounds,
    medicinal_uses,
    traditional_uses,
    preparation_methods,
    dosage_info,
    contraindications,
    side_effects,
    drug_interactions,
    safety_rating,
    growing_conditions,
    harvest_time,
    storage_methods,
    verified,
    image_features
) VALUES
-- ALOE VERA
(
    'Aloe Vera',
    'Aloe barbadensis miller',
    'aloe-vera',
    'Asphodelaceae',
    'Succulent plant with thick, fleshy leaves containing clear gel. Known for its healing and soothing properties.',
    ARRAY['leaves', 'gel'],
    JSONB_BUILD_OBJECT(
        'polysaccharides', 'acemannan',
        'vitamins', ARRAY['A', 'C', 'E', 'B12'],
        'minerals', ARRAY['calcium', 'magnesium', 'zinc'],
        'enzymes', ARRAY['bradykinase', 'lipase'],
        'anthraquinones', ARRAY['aloin', 'emodin']
    ),
    ARRAY['burns', 'wound healing', 'skin conditions', 'digestive issues', 'immune support'],
    'Used for over 6000 years in Egyptian, Greek, and Chinese medicine',
    ARRAY['topical gel', 'juice', 'capsules', 'powder'],
    '50-200mg aloe extract daily, or apply gel topically as needed',
    ARRAY['pregnancy', 'breastfeeding', 'intestinal obstruction', 'kidney disease'],
    ARRAY['diarrhea', 'abdominal cramps', 'electrolyte imbalance'],
    ARRAY['blood thinners', 'diabetes medications', 'diuretics'],
    'Generally Safe',
    'Full sun to partial shade, well-draining soil, drought tolerant, USDA zones 9-11',
    'Year-round, mature leaves 3-4 years old',
    'Fresh gel lasts 1 week refrigerated, dried powder 2 years',
    true,
    JSONB_BUILD_OBJECT(
        'leaf_shape', 'thick, fleshy, lance-shaped',
        'leaf_color', 'green to grey-green',
        'leaf_edges', 'serrated with small teeth',
        'growth_pattern', 'rosette formation',
        'distinctive_features', ARRAY['gel-filled leaves', 'succulent appearance', 'upright growth']
    )
),

-- CHAMOMILE
(
    'Chamomile',
    'Matricaria chamomilla',
    'chamomile',
    'Asteraceae',
    'Daisy-like flowers with white petals and yellow centers. One of the most popular medicinal herbs.',
    ARRAY['flowers', 'leaves'],
    JSONB_BUILD_OBJECT(
        'flavonoids', ARRAY['apigenin', 'quercetin', 'luteolin'],
        'terpenoids', ARRAY['bisabolol', 'chamazulene'],
        'coumarins', 'herniarin',
        'essential_oils', '0.24-1.9%'
    ),
    ARRAY['anxiety', 'insomnia', 'digestive problems', 'inflammation', 'skin irritation'],
    'Used in European folk medicine for centuries, especially for calming and digestive support',
    ARRAY['tea', 'tincture', 'essential oil', 'compress', 'bath'],
    '1-4 cups of tea daily, or 1-4ml tincture 3x daily',
    ARRAY['ragweed allergy', 'pregnancy (large amounts)', 'bleeding disorders'],
    ARRAY['allergic reactions', 'drowsiness', 'vomiting (large doses)'],
    ARRAY['blood thinners', 'sedatives', 'cyclosporine'],
    'Generally Safe',
    'Full sun, well-drained soil, cool weather, USDA zones 2-8',
    'Summer when flowers fully open',
    'Dried flowers in airtight container, 1 year',
    true,
    JSONB_BUILD_OBJECT(
        'flower_shape', 'daisy-like with white petals',
        'flower_center', 'yellow, dome-shaped',
        'petal_count', '10-20 white ray florets',
        'stem', 'branching, smooth',
        'distinctive_features', ARRAY['apple-like scent', 'hollow receptacle', 'feathery leaves']
    )
),

-- GINGER
(
    'Ginger',
    'Zingiber officinale',
    'ginger',
    'Zingiberaceae',
    'Tropical plant with aromatic rhizome used as spice and medicine. Pungent and warming.',
    ARRAY['rhizome', 'root'],
    JSONB_BUILD_OBJECT(
        'gingerols', 'main active compounds',
        'shogaols', 'formed when dried',
        'zingerone', 'gives aroma',
        'essential_oils', '1-3%',
        'oleoresins', 'pungent principles'
    ),
    ARRAY['nausea', 'motion sickness', 'inflammation', 'pain relief', 'digestive support'],
    'Used in Ayurvedic and Chinese medicine for over 5000 years',
    ARRAY['fresh root', 'dried powder', 'tea', 'capsules', 'tincture', 'essential oil'],
    '1-4g daily of fresh ginger, or 250mg capsules 4x daily',
    ARRAY['gallstones', 'bleeding disorders', 'heart conditions'],
    ARRAY['heartburn', 'diarrhea', 'mouth irritation'],
    ARRAY['blood thinners', 'diabetes medications', 'blood pressure drugs'],
    'Generally Safe',
    'Partial shade, rich moist soil, warm climate, USDA zones 9-12',
    '8-10 months after planting when leaves yellow',
    'Fresh refrigerated 3 weeks, dried powder 1 year',
    true,
    JSONB_BUILD_OBJECT(
        'rhizome_shape', 'knobby, branching',
        'rhizome_color', 'tan to light brown exterior, yellow interior',
        'texture', 'fibrous, juicy',
        'leaves', 'long, narrow, grass-like',
        'distinctive_features', ARRAY['pungent aroma', 'spicy taste', 'knobby appearance']
    )
),

-- TURMERIC
(
    'Turmeric',
    'Curcuma longa',
    'turmeric',
    'Zingiberaceae',
    'Bright orange-yellow rhizome related to ginger. Powerful anti-inflammatory and antioxidant.',
    ARRAY['rhizome', 'root'],
    JSONB_BUILD_OBJECT(
        'curcuminoids', ARRAY['curcumin', 'demethoxycurcumin', 'bisdemethoxycurcumin'],
        'curcumin_content', '2-5%',
        'essential_oils', 'turmerone, atlantone, zingiberene',
        'polysaccharides', 'ukonan A, B, C, D'
    ),
    ARRAY['inflammation', 'arthritis', 'digestive issues', 'liver support', 'antioxidant'],
    'Sacred spice in Ayurvedic medicine, used for 4000+ years',
    ARRAY['powder', 'capsules', 'golden milk', 'paste', 'tincture'],
    '500-2000mg curcumin daily with black pepper for absorption',
    ARRAY['gallbladder problems', 'bleeding disorders', 'iron deficiency', 'pregnancy (large amounts)'],
    ARRAY['stomach upset', 'nausea', 'diarrhea', 'dizziness'],
    ARRAY['blood thinners', 'diabetes medications', 'stomach acid reducers'],
    'Generally Safe',
    'Partial shade, rich moist soil, tropical climate, USDA zones 8-11',
    '7-10 months when leaves turn yellow',
    'Dried powder in airtight container, 2 years',
    true,
    JSONB_BUILD_OBJECT(
        'rhizome_shape', 'cylindrical, branching',
        'rhizome_color', 'deep orange interior, brown exterior',
        'texture', 'hard, dense',
        'leaves', 'large, oblong, green',
        'distinctive_features', ARRAY['bright orange color', 'earthy aroma', 'staining properties']
    )
),

-- ECHINACEA
(
    'Echinacea',
    'Echinacea purpurea',
    'echinacea',
    'Asteraceae',
    'Purple coneflower with prominent spiky center. Popular immune-boosting herb.',
    ARRAY['roots', 'flowers', 'leaves'],
    JSONB_BUILD_OBJECT(
        'alkamides', 'immune-modulating',
        'polysaccharides', 'immune-stimulating',
        'caffeic_acid_derivatives', 'echinacoside, chicoric acid',
        'essential_oils', 'humulene, caryophyllene'
    ),
    ARRAY['immune support', 'cold prevention', 'wound healing', 'anti-inflammatory'],
    'Used by Native Americans for infections, wounds, and snake bites',
    ARRAY['tincture', 'capsules', 'tea', 'topical cream'],
    '300mg 3x daily at first sign of cold, max 8 weeks continuous use',
    ARRAY['autoimmune diseases', 'tuberculosis', 'HIV/AIDS', 'ragweed allergy'],
    ARRAY['rash', 'stomach upset', 'dizziness'],
    ARRAY['immunosuppressants', 'caffeine'],
    'Generally Safe',
    'Full sun, well-drained soil, drought tolerant, USDA zones 3-9',
    'Summer to fall when flowers bloom',
    'Dried roots 2 years, tincture 5 years',
    true,
    JSONB_BUILD_OBJECT(
        'flower_shape', 'cone-shaped center with drooping petals',
        'flower_color', 'purple-pink petals, orange-brown center',
        'center_texture', 'spiky, prominent',
        'stem', 'rough, hairy',
        'distinctive_features', ARRAY['cone-shaped center', 'drooping petals', 'rough texture']
    )
),

-- PEPPERMINT
(
    'Peppermint',
    'Mentha × piperita',
    'peppermint',
    'Lamiaceae',
    'Aromatic herb with cooling properties. Hybrid of watermint and spearmint.',
    ARRAY['leaves', 'stems', 'flowers'],
    JSONB_BUILD_OBJECT(
        'menthol', '30-55% of essential oil',
        'menthone', '14-32%',
        'menthyl_acetate', '2.8-10%',
        'flavonoids', ARRAY['eriocitrin', 'luteolin'],
        'rosmarinic_acid', 'antioxidant'
    ),
    ARRAY['digestive issues', 'IBS', 'headaches', 'congestion', 'nausea'],
    'Used in ancient Egyptian, Greek, and Roman medicine',
    ARRAY['tea', 'essential oil', 'capsules', 'tincture', 'topical'],
    '1-2 cups tea daily, or 0.2-0.4ml essential oil in capsules',
    ARRAY['GERD', 'hiatal hernia', 'gallstones', 'pregnancy (large amounts)'],
    ARRAY['heartburn', 'allergic reactions', 'mouth sores'],
    ARRAY['cyclosporine', 'medications metabolized by liver'],
    'Generally Safe',
    'Partial shade, moist soil, spreads aggressively, USDA zones 3-11',
    'Summer before flowering',
    'Dried leaves 1 year, essential oil 3 years',
    true,
    JSONB_BUILD_OBJECT(
        'leaf_shape', 'oval, pointed, serrated edges',
        'leaf_color', 'dark green',
        'stem', 'square, purple-tinged',
        'aroma', 'strong menthol scent',
        'distinctive_features', ARRAY['cooling sensation', 'square stems', 'strong mint aroma']
    )
);

-- ============================================
-- 2. PLANT DISEASES DATABASE
-- ============================================

CREATE TABLE IF NOT EXISTS plant_diseases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    disease_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    disease_type VARCHAR(50), -- fungal, bacterial, viral, pest, nutrient
    affected_plants TEXT[], -- Array of plant names
    symptoms JSONB,
    causes TEXT[],
    prevention_methods TEXT[],
    treatment_options TEXT[],
    severity VARCHAR(20), -- mild, moderate, severe
    spread_rate VARCHAR(20), -- slow, moderate, fast
    environmental_conditions JSONB,
    visual_identification JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common plant diseases
INSERT INTO plant_diseases (
    disease_name,
    scientific_name,
    disease_type,
    affected_plants,
    symptoms,
    causes,
    prevention_methods,
    treatment_options,
    severity,
    spread_rate,
    environmental_conditions,
    visual_identification
) VALUES
(
    'Powdery Mildew',
    'Various fungi species',
    'fungal',
    ARRAY['roses', 'cucumbers', 'squash', 'pumpkins', 'grapes'],
    JSONB_BUILD_OBJECT(
        'leaf_symptoms', ARRAY['white powdery coating', 'yellowing', 'curling'],
        'stem_symptoms', ARRAY['white patches'],
        'flower_symptoms', ARRAY['distorted blooms'],
        'progression', 'starts on lower leaves, spreads upward'
    ),
    ARRAY['high humidity', 'poor air circulation', 'shade', 'overcrowding'],
    ARRAY['proper spacing', 'good air flow', 'avoid overhead watering', 'resistant varieties'],
    ARRAY['neem oil', 'sulfur spray', 'baking soda solution', 'remove affected parts'],
    'moderate',
    'fast',
    JSONB_BUILD_OBJECT(
        'temperature', '60-80°F optimal',
        'humidity', 'high humidity favors',
        'light', 'shade increases risk'
    ),
    JSONB_BUILD_OBJECT(
        'appearance', 'white powdery coating on leaves',
        'texture', 'dusty, easily rubbed off',
        'location', 'upper leaf surfaces initially'
    )
),
(
    'Root Rot',
    'Phytophthora, Pythium species',
    'fungal',
    ARRAY['aloe vera', 'succulents', 'houseplants', 'vegetables'],
    JSONB_BUILD_OBJECT(
        'root_symptoms', ARRAY['brown, mushy roots', 'foul odor', 'root decay'],
        'leaf_symptoms', ARRAY['yellowing', 'wilting', 'dropping'],
        'stem_symptoms', ARRAY['soft, dark base'],
        'overall', 'plant decline despite watering'
    ),
    ARRAY['overwatering', 'poor drainage', 'contaminated soil', 'fungal infection'],
    ARRAY['well-draining soil', 'proper watering', 'good drainage', 'sterile pots'],
    ARRAY['remove affected roots', 'repot in fresh soil', 'reduce watering', 'fungicide'],
    'severe',
    'moderate',
    JSONB_BUILD_OBJECT(
        'moisture', 'excess water',
        'temperature', 'warm, wet conditions',
        'soil', 'poor drainage'
    ),
    JSONB_BUILD_OBJECT(
        'roots', 'brown, mushy, foul-smelling',
        'leaves', 'yellow, wilted',
        'soil', 'waterlogged, smells bad'
    )
);

-- ============================================
-- 3. PLANT COMPARISON FEATURES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS plant_comparison_features (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plant_id UUID REFERENCES medicinal_plants(id) ON DELETE CASCADE,
    feature_type VARCHAR(50), -- leaf, flower, stem, root, overall
    feature_vector FLOAT[], -- For similarity calculations
    color_histogram JSONB,
    shape_descriptors JSONB,
    texture_features JSONB,
    size_measurements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_plant_diseases_name ON plant_diseases(disease_name);
CREATE INDEX idx_plant_diseases_type ON plant_diseases(disease_type);
CREATE INDEX idx_comparison_plant_id ON plant_comparison_features(plant_id);
CREATE INDEX idx_comparison_feature_type ON plant_comparison_features(feature_type);

-- ============================================
-- 4. PLANT SIMILARITY FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_plant_similarity(
    input_features JSONB,
    comparison_plant_id UUID
)
RETURNS FLOAT AS $$
DECLARE
    similarity_score FLOAT := 0;
    feature_match_count INT := 0;
    total_features INT := 0;
BEGIN
    -- Compare image features from medicinal_plants table
    SELECT 
        CASE 
            WHEN input_features->>'leaf_color' = mp.image_features->>'leaf_color' THEN 1 ELSE 0 
        END +
        CASE 
            WHEN input_features->>'leaf_shape' = mp.image_features->>'leaf_shape' THEN 1 ELSE 0 
        END +
        CASE 
            WHEN input_features->>'flower_color' = mp.image_features->>'flower_color' THEN 1 ELSE 0 
        END +
        CASE 
            WHEN input_features->>'growth_pattern' = mp.image_features->>'growth_pattern' THEN 1 ELSE 0 
        END
    INTO feature_match_count
    FROM medicinal_plants mp
    WHERE mp.id = comparison_plant_id;
    
    total_features := 4; -- Number of features compared
    similarity_score := (feature_match_count::FLOAT / total_features::FLOAT) * 100;
    
    RETURN similarity_score;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON plant_diseases TO authenticated;
GRANT ALL ON plant_diseases TO anon;
GRANT ALL ON plant_comparison_features TO authenticated;
GRANT ALL ON plant_comparison_features TO anon;
