-- Initialize Echo Tuition Marketplace Database with pgvector

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_courses_search ON courses USING gin(to_tsvector('english', title || ' ' || description || ' ' || subject));
CREATE INDEX IF NOT EXISTS idx_teachers_search ON teachers USING gin(to_tsvector('english', subjects::text));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE echo TO echo;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO echo;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO echo;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Echo Tuition Marketplace database initialized successfully with pgvector support';
END $$;
