-- Add feedback table for plant identifications
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS plant_identification_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    identification_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_correct BOOLEAN NOT NULL,
    correct_plant_name VARCHAR(255),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_feedback_identification_id ON plant_identification_feedback(identification_id);
CREATE INDEX idx_feedback_user_id ON plant_identification_feedback(user_id);
CREATE INDEX idx_feedback_created_at ON plant_identification_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE plant_identification_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can submit feedback" 
    ON plant_identification_feedback FOR INSERT 
    WITH CHECK (true); -- Allow anonymous feedback

CREATE POLICY "Users can view own feedback" 
    ON plant_identification_feedback FOR SELECT 
    USING (user_id IS NULL OR auth.uid()::text = user_id::text);

-- Grant permissions
GRANT ALL ON plant_identification_feedback TO authenticated;
GRANT ALL ON plant_identification_feedback TO anon;
