-- Extended Research and Ratings Schema
-- Run after supabase-setup.sql

-- Ensure extension exists (harmless if already created)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Extend user_type roles to include researcher and admin
DO $$
BEGIN
  -- Drop old CHECK constraint if it exists (default name pattern)
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'users' AND c.conname = 'users_user_type_check'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_user_type_check;
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- users table may not exist, ignore here (core migration should have created it)
  NULL;
END $$;

-- Recreate relaxed CHECK constraint (do NOT change column type to avoid policy dependency issues)
ALTER TABLE users
  ADD CONSTRAINT users_user_type_check CHECK (user_type IN ('buyer','seller','herbalist','researcher','admin'));

-- Make sure legacy password column (if present) does not block inserts from auth trigger/backfill
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password'
  ) THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.users ALTER COLUMN password DROP NOT NULL';
    EXCEPTION WHEN undefined_column THEN
      NULL;
    END;
  END IF;
END $$;

-- 2) Core reference tables: tags, herbs, diseases
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS herbs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL UNIQUE,
  scientific_name VARCHAR,
  description TEXT,
  origin VARCHAR,
  medicinal_uses JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS diseases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  symptoms JSONB,
  severity VARCHAR CHECK (severity IN ('low','medium','high')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- 3) Many-to-many: herb_tags, disease_tags
CREATE TABLE IF NOT EXISTS herb_tags (
  herb_id UUID NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (tag_id, herb_id)
);

CREATE TABLE IF NOT EXISTS disease_tags (
  disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (tag_id, disease_id)
);

-- 4) Research posts and related entities
CREATE TABLE IF NOT EXISTS research_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  abstract TEXT,
  content TEXT NOT NULL,
  references_list JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  related_herb_id UUID REFERENCES herbs(id) ON DELETE SET NULL,
  related_disease_id UUID REFERENCES diseases(id) ON DELETE SET NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR DEFAULT 'published' CHECK (status IN ('draft','published','archived')),
  is_verified BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  search_tsv tsvector
);

-- tsvector update trigger for research_posts
CREATE OR REPLACE FUNCTION research_posts_tsvector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english', COALESCE(NEW.title,'')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.abstract,'')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content,'')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_research_posts_tsv_update ON research_posts;
CREATE TRIGGER trg_research_posts_tsv_update
BEFORE INSERT OR UPDATE ON research_posts
FOR EACH ROW EXECUTE FUNCTION research_posts_tsvector_update();

CREATE TABLE IF NOT EXISTS research_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES research_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating NUMERIC CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS research_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  research_post_id UUID NOT NULL REFERENCES research_posts(id) ON DELETE CASCADE,
  reference_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Structured AI/ML-friendly storage alongside raw text
CREATE TABLE IF NOT EXISTS research_structured (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES research_posts(id) ON DELETE CASCADE,
  schema_version TEXT NOT NULL DEFAULT '1.0',
  entities JSONB NOT NULL DEFAULT '{}'::jsonb,        -- normalized entities: herbs, diseases, compounds, mechanisms, dosages, outcomes
  keyphrases TEXT[] NOT NULL DEFAULT '{}',            -- keyword extraction
  annotations JSONB NOT NULL DEFAULT '{}'::jsonb,     -- any additional annotations
  embedding JSONB,                                    -- optional vector or embedding representation
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Voting (Reddit-style up/down votes)
CREATE TABLE IF NOT EXISTS research_votes (
  post_id UUID NOT NULL REFERENCES research_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value INT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Saves / bookmarks
CREATE TABLE IF NOT EXISTS research_saves (
  post_id UUID NOT NULL REFERENCES research_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  post_id UUID,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  entity_type TEXT NOT NULL DEFAULT 'research_post',
  entity_id UUID
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR NOT NULL CHECK (action IN ('create','update','delete','verify')),
  performed_by UUID REFERENCES users(id),
  performed_at TIMESTAMPTZ DEFAULT now(),
  changes JSONB
);

-- 5) Product ratings
CREATE TABLE IF NOT EXISTS product_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating NUMERIC CHECK (rating >= 0 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6) Profiles linked to Supabase auth.users (optional auxiliary profile)
-- Note: Requires auth schema in Supabase
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  avatar TEXT,
  user_type TEXT DEFAULT 'buyer' CHECK (user_type = ANY(ARRAY['buyer','seller','herbalist','researcher','admin']::text[])),
  bio TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}',
  business_name TEXT,
  business_license TEXT,
  specializations JSONB DEFAULT '[]',
  credentials JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT profiles_auth_fk FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 7) Indexes to support performance
CREATE INDEX IF NOT EXISTS idx_research_posts_author ON research_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_research_posts_herb ON research_posts(related_herb_id);
CREATE INDEX IF NOT EXISTS idx_research_posts_disease ON research_posts(related_disease_id);
CREATE INDEX IF NOT EXISTS idx_research_posts_status ON research_posts(status);
CREATE INDEX IF NOT EXISTS idx_research_posts_tsv ON research_posts USING GIN (search_tsv);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);

CREATE INDEX IF NOT EXISTS idx_research_votes_post ON research_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_research_votes_user ON research_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_research_saves_post ON research_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_research_saves_user ON research_saves(user_id);

CREATE INDEX IF NOT EXISTS idx_research_structured_post ON research_structured(post_id);
CREATE INDEX IF NOT EXISTS idx_research_structured_entities_gin ON research_structured USING GIN (entities);

CREATE INDEX IF NOT EXISTS idx_product_ratings_product ON product_ratings(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ratings_user ON product_ratings(user_id);

-- 8) Updated timestamp triggers for new tables
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_herbs_updated_at ON herbs;
CREATE TRIGGER trg_herbs_updated_at BEFORE UPDATE ON herbs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_diseases_updated_at ON diseases;
CREATE TRIGGER trg_diseases_updated_at BEFORE UPDATE ON diseases FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_research_posts_updated_at ON research_posts;
CREATE TRIGGER trg_research_posts_updated_at BEFORE UPDATE ON research_posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 9) Row Level Security (RLS) for research entities
ALTER TABLE research_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_structured ENABLE ROW LEVEL SECURITY;

-- Helper note: We rely on users table to hold roles and auth.uid() to match users.id

-- research_posts policies
DROP POLICY IF EXISTS rp_public_read ON research_posts;
CREATE POLICY rp_public_read ON research_posts
  FOR SELECT
  USING (
    status = 'published' OR author_id::text = auth.uid()::text
  );

DROP POLICY IF EXISTS rp_create_by_role ON research_posts;
CREATE POLICY rp_create_by_role ON research_posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id::text = auth.uid()::text
        AND u.user_type IN ('researcher','admin','herbalist')
    )
    AND author_id::text = auth.uid()::text
  );

DROP POLICY IF EXISTS rp_update_author_or_admin ON research_posts;
CREATE POLICY rp_update_author_or_admin ON research_posts
  FOR UPDATE
  USING (
    author_id::text = auth.uid()::text OR EXISTS (
      SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
    )
  )
  WITH CHECK (
    author_id::text = auth.uid()::text OR EXISTS (
      SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS rp_delete_author_or_admin ON research_posts;
CREATE POLICY rp_delete_author_or_admin ON research_posts
  FOR DELETE
  USING (
    author_id::text = auth.uid()::text OR EXISTS (
      SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
    )
  );

-- comments policies (read public for published posts; create/update/delete by author or admin)
DROP POLICY IF EXISTS cm_public_read ON comments;
CREATE POLICY cm_public_read ON comments
  FOR SELECT
  USING (
    entity_type = 'research_post' AND (
      EXISTS (
        SELECT 1 FROM research_posts rp
        WHERE rp.id = comments.post_id
          AND (rp.status = 'published' OR rp.author_id::text = auth.uid()::text)
      )
    )
  );

DROP POLICY IF EXISTS cm_create_auth ON comments;
CREATE POLICY cm_create_auth ON comments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND author_id::text = auth.uid()::text);

DROP POLICY IF EXISTS cm_update_owner_or_admin ON comments;
CREATE POLICY cm_update_owner_or_admin ON comments
  FOR UPDATE
  USING (
    author_id::text = auth.uid()::text OR EXISTS (
      SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
    )
  )
  WITH CHECK (
    author_id::text = auth.uid()::text OR EXISTS (
      SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
    )
  );

DROP POLICY IF EXISTS cm_delete_owner_or_admin ON comments;
CREATE POLICY cm_delete_owner_or_admin ON comments
  FOR DELETE
  USING (
    author_id::text = auth.uid()::text OR EXISTS (
      SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
    )
  );

-- research_ratings policies
DROP POLICY IF EXISTS rr_public_read ON research_ratings;
CREATE POLICY rr_public_read ON research_ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS rr_create_auth ON research_ratings;
CREATE POLICY rr_create_auth ON research_ratings
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text);

-- research_references policies (read-only public; manage by admin or author via FK)
DROP POLICY IF EXISTS rref_public_read ON research_references;
CREATE POLICY rref_public_read ON research_references FOR SELECT USING (true);

-- research_votes policies
DROP POLICY IF EXISTS rv_public_read ON research_votes;
CREATE POLICY rv_public_read ON research_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS rv_upsert_self ON research_votes;
CREATE POLICY rv_upsert_self ON research_votes
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS rv_update_self ON research_votes;
CREATE POLICY rv_update_self ON research_votes
  FOR UPDATE
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS rv_delete_self ON research_votes;
CREATE POLICY rv_delete_self ON research_votes
  FOR DELETE
  USING (user_id::text = auth.uid()::text);

-- research_saves policies
DROP POLICY IF EXISTS rs_public_read ON research_saves;
CREATE POLICY rs_public_read ON research_saves FOR SELECT USING (true);

DROP POLICY IF EXISTS rs_insert_self ON research_saves;
CREATE POLICY rs_insert_self ON research_saves
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS rs_delete_self ON research_saves;
CREATE POLICY rs_delete_self ON research_saves
  FOR DELETE
  USING (user_id::text = auth.uid()::text);

-- research_structured policies
DROP POLICY IF EXISTS rstr_public_read ON research_structured;
CREATE POLICY rstr_public_read ON research_structured FOR SELECT USING (true);

DROP POLICY IF EXISTS rstr_insert_author_or_admin ON research_structured;
CREATE POLICY rstr_insert_author_or_admin ON research_structured
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM research_posts rp
      WHERE rp.id = research_structured.post_id
        AND (
          rp.author_id::text = auth.uid()::text OR EXISTS (
            SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
          )
        )
    )
  );

DROP POLICY IF EXISTS rstr_update_author_or_admin ON research_structured;
CREATE POLICY rstr_update_author_or_admin ON research_structured
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM research_posts rp
      WHERE rp.id = research_structured.post_id
        AND (
          rp.author_id::text = auth.uid()::text OR EXISTS (
            SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM research_posts rp
      WHERE rp.id = research_structured.post_id
        AND (
          rp.author_id::text = auth.uid()::text OR EXISTS (
            SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
          )
        )
    )
  );

DROP POLICY IF EXISTS rstr_delete_author_or_admin ON research_structured;
CREATE POLICY rstr_delete_author_or_admin ON research_structured
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM research_posts rp
      WHERE rp.id = research_structured.post_id
        AND (
          rp.author_id::text = auth.uid()::text OR EXISTS (
            SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
          )
        )
    )
  );

-- 10) Users table RLS for self-registration and profile management
-- Enable RLS if not already
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow a newly authenticated user to create their own users row as a buyer only
DROP POLICY IF EXISTS users_insert_self_buyer ON users;
CREATE POLICY users_insert_self_buyer ON users
  FOR INSERT
  WITH CHECK (
    id::text = auth.uid()::text AND user_type IN ('buyer')
  );

-- Allow users to read their own row
DROP POLICY IF EXISTS users_select_self ON users;
CREATE POLICY users_select_self ON users
  FOR SELECT
  USING (id::text = auth.uid()::text);

-- Allow users to update their own row (non-restrictive; consider column-specific restrictions later)
DROP POLICY IF EXISTS users_update_self ON users;
CREATE POLICY users_update_self ON users
  FOR UPDATE
  USING (id::text = auth.uid()::text)
  WITH CHECK (id::text = auth.uid()::text);

-- Allow admins to update any user
DROP POLICY IF EXISTS users_update_admin ON users;
CREATE POLICY users_update_admin ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
    )
  );

-- Allow admins to SELECT all users (for admin dashboard)
DROP POLICY IF EXISTS users_select_admin_all ON users;
CREATE POLICY users_select_admin_all ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id::text = auth.uid()::text AND u.user_type = 'admin'
    )
  );

-- 11) Auto-provision user rows on signup via trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into public.users if not exists
  INSERT INTO public.users (id, name, email, user_type)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email, 'buyer')
  ON CONFLICT (id) DO NOTHING;

  -- Insert into public.profiles if table exists
  BEGIN
    INSERT INTO public.profiles (id, name, avatar, user_type)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.raw_user_meta_data->>'avatar_url', 'buyer')
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN undefined_table THEN
    -- profiles table might not exist yet; ignore
    NULL;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
