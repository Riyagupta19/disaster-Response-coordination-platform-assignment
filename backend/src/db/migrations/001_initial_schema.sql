-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create disasters table
CREATE TABLE disasters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    location_name TEXT NOT NULL,
    location GEOGRAPHY(POINT),
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    owner_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    audit_trail JSONB DEFAULT '[]'::jsonb
);

-- Create reports table
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    verification_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create resources table
CREATE TABLE resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location_name TEXT NOT NULL,
    location GEOGRAPHY(POINT),
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cache table
CREATE TABLE cache (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create geospatial indexes
CREATE INDEX disasters_location_idx ON disasters USING GIST (location);
CREATE INDEX resources_location_idx ON resources USING GIST (location);

-- Create indexes for efficient filtering
CREATE INDEX disasters_tags_idx ON disasters USING GIN (tags);
CREATE INDEX disasters_owner_id_idx ON disasters (owner_id);
CREATE INDEX reports_disaster_id_idx ON reports (disaster_id);
CREATE INDEX resources_disaster_id_idx ON resources (disaster_id);
CREATE INDEX cache_expires_at_idx ON cache (expires_at);

-- Create function to get nearby resources
CREATE OR REPLACE FUNCTION get_nearby_resources(
    p_lat DOUBLE PRECISION,
    p_lon DOUBLE PRECISION,
    p_radius INTEGER
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    location_name TEXT,
    type TEXT,
    distance DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.location_name,
        r.type,
        ST_Distance(
            r.location::geography,
            ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography
        ) as distance
    FROM resources r
    WHERE ST_DWithin(
        r.location::geography,
        ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
        p_radius
    )
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_disasters_updated_at
    BEFORE UPDATE ON disasters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 