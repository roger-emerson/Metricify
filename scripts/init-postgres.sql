-- PostgreSQL Initialization Script
-- This runs automatically when the PostgreSQL container is first created

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE metricify TO metricify_user;

-- Create schema (optional, but good for organization)
-- The tables will be created by the Node.js initialization script
