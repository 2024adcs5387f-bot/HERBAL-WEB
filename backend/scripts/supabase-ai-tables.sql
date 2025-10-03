-- AI Data Storage Schema for Supabase
-- Run this in your Supabase SQL Editor to create tables for AI features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- PLANT IDENTIFICATION CACHE
-- ============================================

-- Plant identification results cache
CREATE TABLE IF NOT EXISTS plant_identifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Image data
    image_url TEXT,
    image_hash VARCHAR(64) UNIQUE, -- MD5/SHA256 hash for deduplication
    
    -- Identification results
    plant_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    common_names JSONB DEFAULT '[]',
    family VARCHAR(100),
    probability DECIMAL(5,4), -- 0.0000 to 1.0000
    
    -- Plant details
    description TEXT,
    wiki_url TEXT,
    taxonomy JSONB DEFAULT '{}',
    
    -- Medicinal information
    medicinal_uses JSONB DEFAULT '[]',
    active_compounds JSONB DEFAULT '[]',
    contraindications JSONB DEFAULT '[]',
    safety_info TEXT,
    
    -- Growing information
    growing_conditions TEXT,
    origin VARCHAR(100),
    habitat TEXT,
    
    -- API response cache
    raw_api_response JSONB, -- Full API response for reference
    api_provider VARCHAR(50) DEFAULT 'plant.id',
    
    -- Alternative suggestions
    alternative_plants JSONB DEFAULT '[]',
    
    -- Usage tracking
    cache_hit_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    is_verified BOOLEAN DEFAULT false, -- Verified by herbalist
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SYMPTOM CHECKER DATA
-- ============================================

-- Symptom check history and cache
CREATE TABLE IF NOT EXISTS symptom_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Symptoms input
    symptoms JSONB NOT NULL, -- Array of symptom objects
    symptom_hash VARCHAR(64), -- Hash for caching similar symptom combinations
    
    -- Patient info (optional, anonymized)
    age_range VARCHAR(20),
    gender VARCHAR(20),
    
    -- Analysis results
    conditions JSONB DEFAULT '[]', -- Possible conditions with probabilities
    recommended_herbs JSONB DEFAULT '[]',
    severity VARCHAR(20), -- mild, moderate, severe, emergency
    
    -- Recommendations
    ai_recommendations TEXT,
    herbal_remedies JSONB DEFAULT '[]',
    lifestyle_suggestions JSONB DEFAULT '[]',
    
    -- Warnings
    requires_medical_attention BOOLEAN DEFAULT false,
    contraindications JSONB DEFAULT '[]',
    
    -- API data
    raw_api_response JSONB,
    api_provider VARCHAR(50) DEFAULT 'infermedica',
    
    -- Follow-up
    follow_up_date DATE,
    resolved BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AI RECOMMENDATIONS
-- ============================================

-- AI-generated herbal recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Input context
    query TEXT NOT NULL,
    context_type VARCHAR(50), -- symptom, condition, wellness, prevention
    user_preferences JSONB DEFAULT '{}',
    
    -- Recommendations
    recommended_products JSONB DEFAULT '[]', -- Product IDs with relevance scores
    herbal_remedies JSONB DEFAULT '[]',
    dosage_suggestions JSONB DEFAULT '[]',
    
    -- AI response
    ai_explanation TEXT,
    confidence_score DECIMAL(5,4),
    
    -- Sources
    sources JSONB DEFAULT '[]',
    research_references JSONB DEFAULT '[]',
    
    -- API data
    raw_api_response JSONB,
    api_provider VARCHAR(50) DEFAULT 'openai',
    model_version VARCHAR(50),
    
    -- Feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    was_helpful BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MEDICINAL PLANTS DATABASE
-- ============================================

-- Comprehensive medicinal plants knowledge base
CREATE TABLE IF NOT EXISTS medicinal_plants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic identification
    common_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255) UNIQUE NOT NULL,
    botanical_family VARCHAR(100),
    common_names JSONB DEFAULT '[]',
    
    -- Description
    description TEXT,
    appearance TEXT,
    habitat TEXT,
    origin VARCHAR(100),
    
    -- Medicinal properties
    medicinal_uses JSONB DEFAULT '[]',
    active_compounds JSONB DEFAULT '[]',
    therapeutic_actions JSONB DEFAULT '[]',
    
    -- Usage information
    parts_used JSONB DEFAULT '[]', -- roots, leaves, flowers, etc.
    preparation_methods JSONB DEFAULT '[]',
    dosage_info TEXT,
    
    -- Safety
    contraindications JSONB DEFAULT '[]',
    side_effects JSONB DEFAULT '[]',
    drug_interactions JSONB DEFAULT '[]',
    safety_rating VARCHAR(20), -- safe, caution, restricted
    
    -- Growing information
    growing_conditions TEXT,
    hardiness_zones VARCHAR(50),
    cultivation_difficulty VARCHAR(20),
    
    -- Research & validation
    research_studies JSONB DEFAULT '[]',
    evidence_level VARCHAR(20), -- traditional, clinical, scientific
    
    -- Media
    images JSONB DEFAULT '[]',
    
    -- SEO & search
    slug VARCHAR(255) UNIQUE,
    search_keywords JSONB DEFAULT '[]',
    
    -- Metadata
    contributed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HERBAL REMEDIES DATABASE
-- ============================================

-- Specific herbal remedy formulations
CREATE TABLE IF NOT EXISTS herbal_remedies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    remedy_type VARCHAR(50), -- tea, tincture, salve, capsule, etc.
    
    -- Purpose
    conditions_treated JSONB DEFAULT '[]',
    symptoms_addressed JSONB DEFAULT '[]',
    
    -- Formulation
    ingredients JSONB NOT NULL, -- Array of {plant_id, quantity, unit}
    preparation_instructions TEXT,
    dosage TEXT,
    frequency VARCHAR(100),
    duration VARCHAR(100),
    
    -- Effectiveness
    traditional_use TEXT,
    scientific_evidence TEXT,
    success_rate DECIMAL(5,2),
    
    -- Safety
    contraindications JSONB DEFAULT '[]',
    warnings TEXT,
    
    -- Source
    source VARCHAR(100), -- traditional, clinical, herbalist
    contributed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Engagement
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    
    verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER HEALTH PROFILES (Optional, Privacy-Sensitive)
-- ============================================

-- User health preferences and history
CREATE TABLE IF NOT EXISTS user_health_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Preferences
    health_goals JSONB DEFAULT '[]',
    preferred_remedy_types JSONB DEFAULT '[]',
    
    -- Restrictions
    allergies JSONB DEFAULT '[]',
    contraindicated_plants JSONB DEFAULT '[]',
    current_medications JSONB DEFAULT '[]',
    
    -- History
    past_conditions JSONB DEFAULT '[]',
    successful_remedies JSONB DEFAULT '[]',
    
    -- Privacy
    data_sharing_consent BOOLEAN DEFAULT false,
    anonymize_data BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Plant identifications indexes
CREATE INDEX idx_plant_identifications_user_id ON plant_identifications(user_id);
CREATE INDEX idx_plant_identifications_image_hash ON plant_identifications(image_hash);
CREATE INDEX idx_plant_identifications_plant_name ON plant_identifications(plant_name);
CREATE INDEX idx_plant_identifications_scientific_name ON plant_identifications(scientific_name);
CREATE INDEX idx_plant_identifications_created_at ON plant_identifications(created_at DESC);
CREATE INDEX idx_plant_identifications_cache_hit ON plant_identifications(cache_hit_count DESC);

-- Symptom checks indexes
CREATE INDEX idx_symptom_checks_user_id ON symptom_checks(user_id);
CREATE INDEX idx_symptom_checks_symptom_hash ON symptom_checks(symptom_hash);
CREATE INDEX idx_symptom_checks_created_at ON symptom_checks(created_at DESC);
CREATE INDEX idx_symptom_checks_severity ON symptom_checks(severity);

-- AI recommendations indexes
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_context_type ON ai_recommendations(context_type);
CREATE INDEX idx_ai_recommendations_created_at ON ai_recommendations(created_at DESC);
CREATE INDEX idx_ai_recommendations_rating ON ai_recommendations(user_rating);

-- Medicinal plants indexes
CREATE INDEX idx_medicinal_plants_common_name ON medicinal_plants(common_name);
CREATE INDEX idx_medicinal_plants_scientific_name ON medicinal_plants(scientific_name);
CREATE INDEX idx_medicinal_plants_slug ON medicinal_plants(slug);
CREATE INDEX idx_medicinal_plants_verified ON medicinal_plants(verified);
CREATE INDEX idx_medicinal_plants_view_count ON medicinal_plants(view_count DESC);

-- Full-text search indexes
CREATE INDEX idx_medicinal_plants_search ON medicinal_plants USING gin(to_tsvector('english', common_name || ' ' || scientific_name || ' ' || COALESCE(description, '')));

-- Herbal remedies indexes
CREATE INDEX idx_herbal_remedies_remedy_type ON herbal_remedies(remedy_type);
CREATE INDEX idx_herbal_remedies_rating ON herbal_remedies(rating DESC);
CREATE INDEX idx_herbal_remedies_verified ON herbal_remedies(verified);
CREATE INDEX idx_herbal_remedies_is_active ON herbal_remedies(is_active);

-- User health profiles indexes
CREATE INDEX idx_user_health_profiles_user_id ON user_health_profiles(user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER trigger_plant_identifications_updated_at 
    BEFORE UPDATE ON plant_identifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_symptom_checks_updated_at 
    BEFORE UPDATE ON symptom_checks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ai_recommendations_updated_at 
    BEFORE UPDATE ON ai_recommendations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_medicinal_plants_updated_at 
    BEFORE UPDATE ON medicinal_plants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_herbal_remedies_updated_at 
    BEFORE UPDATE ON herbal_remedies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_health_profiles_updated_at 
    BEFORE UPDATE ON user_health_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment cache hit count
CREATE OR REPLACE FUNCTION increment_cache_hit()
RETURNS TRIGGER AS $$
BEGIN
    NEW.cache_hit_count = OLD.cache_hit_count + 1;
    NEW.last_accessed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug for medicinal plants
CREATE OR REPLACE FUNCTION auto_generate_plant_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = generate_slug(NEW.common_name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_medicinal_plants_slug 
    BEFORE INSERT OR UPDATE ON medicinal_plants 
    FOR EACH ROW EXECUTE FUNCTION auto_generate_plant_slug();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE plant_identifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicinal_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE herbal_remedies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_profiles ENABLE ROW LEVEL SECURITY;

-- Plant identifications policies
CREATE POLICY "Users can view own plant identifications" 
    ON plant_identifications FOR SELECT 
    USING (user_id IS NULL OR auth.uid()::text = user_id::text);

CREATE POLICY "Users can create plant identifications" 
    ON plant_identifications FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can update own plant identifications" 
    ON plant_identifications FOR UPDATE 
    USING (auth.uid()::text = user_id::text);

-- Symptom checks policies (private)
CREATE POLICY "Users can view own symptom checks" 
    ON symptom_checks FOR SELECT 
    USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can create symptom checks" 
    ON symptom_checks FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

-- AI recommendations policies
CREATE POLICY "Users can view own recommendations" 
    ON ai_recommendations FOR SELECT 
    USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can create recommendations" 
    ON ai_recommendations FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can update own recommendations" 
    ON ai_recommendations FOR UPDATE 
    USING (auth.uid()::text = user_id::text);

-- Medicinal plants policies (public read, restricted write)
CREATE POLICY "Medicinal plants are publicly readable" 
    ON medicinal_plants FOR SELECT 
    USING (verified = true OR contributed_by::text = auth.uid()::text);

CREATE POLICY "Herbalists can create medicinal plants" 
    ON medicinal_plants FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND user_type IN ('herbalist', 'admin')
        )
    );

CREATE POLICY "Contributors can update own medicinal plants" 
    ON medicinal_plants FOR UPDATE 
    USING (contributed_by::text = auth.uid()::text);

-- Herbal remedies policies
CREATE POLICY "Herbal remedies are publicly readable" 
    ON herbal_remedies FOR SELECT 
    USING (is_active = true AND (verified = true OR contributed_by::text = auth.uid()::text));

CREATE POLICY "Herbalists can create remedies" 
    ON herbal_remedies FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND user_type IN ('herbalist', 'admin')
        )
    );

CREATE POLICY "Contributors can update own remedies" 
    ON herbal_remedies FOR UPDATE 
    USING (contributed_by::text = auth.uid()::text);

-- User health profiles policies (strictly private)
CREATE POLICY "Users can view own health profile" 
    ON user_health_profiles FOR SELECT 
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own health profile" 
    ON user_health_profiles FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own health profile" 
    ON user_health_profiles FOR UPDATE 
    USING (auth.uid()::text = user_id::text);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for popular plants
CREATE OR REPLACE VIEW popular_plants AS
SELECT 
    mp.*,
    COUNT(pi.id) as identification_count
FROM medicinal_plants mp
LEFT JOIN plant_identifications pi ON pi.plant_name = mp.common_name OR pi.scientific_name = mp.scientific_name
WHERE mp.verified = true
GROUP BY mp.id
ORDER BY identification_count DESC, mp.view_count DESC;

-- View for trending remedies
CREATE OR REPLACE VIEW trending_remedies AS
SELECT 
    hr.*,
    COUNT(ar.id) as recommendation_count
FROM herbal_remedies hr
LEFT JOIN ai_recommendations ar ON ar.herbal_remedies::text LIKE '%' || hr.id::text || '%'
WHERE hr.is_active = true AND hr.verified = true
GROUP BY hr.id
ORDER BY recommendation_count DESC, hr.rating DESC
LIMIT 50;

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert some common medicinal plants
INSERT INTO medicinal_plants (common_name, scientific_name, botanical_family, description, medicinal_uses, safety_rating, verified) VALUES
('Chamomile', 'Matricaria chamomilla', 'Asteraceae', 'A gentle herb known for its calming properties', '["anxiety relief", "digestive aid", "sleep support", "anti-inflammatory"]', 'safe', true),
('Peppermint', 'Mentha × piperita', 'Lamiaceae', 'Refreshing herb with digestive and respiratory benefits', '["digestive support", "headache relief", "respiratory health", "nausea relief"]', 'safe', true),
('Ginger', 'Zingiber officinale', 'Zingiberaceae', 'Warming root with powerful anti-inflammatory properties', '["nausea relief", "anti-inflammatory", "digestive aid", "immune support"]', 'safe', true),
('Turmeric', 'Curcuma longa', 'Zingiberaceae', 'Golden spice with potent anti-inflammatory compounds', '["anti-inflammatory", "antioxidant", "joint health", "liver support"]', 'safe', true),
('Echinacea', 'Echinacea purpurea', 'Asteraceae', 'Immune-boosting herb traditionally used for colds', '["immune support", "cold prevention", "wound healing", "anti-inflammatory"]', 'caution', true)
ON CONFLICT (scientific_name) DO NOTHING;

-- Grant necessary permissions (adjust as needed)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
