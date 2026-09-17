-- PostgreSQL initialization script for INDEX0 AI
-- Enables core extensions for UUID generation and cryptographic functions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant privileges to index0 role
GRANT ALL PRIVILEGES ON DATABASE index0_dev TO index0;
