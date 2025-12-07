-- Add client info columns to licenses table
ALTER TABLE licenses 
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;
