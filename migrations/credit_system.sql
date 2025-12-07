-- 1. Add credit columns to resellers table
ALTER TABLE resellers 
ADD COLUMN IF NOT EXISTS balance NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS max_keys INT DEFAULT 50;

-- 2. Create Credit Transactions Table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('add', 'deduct', 'reset', 'bonus')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY DEFAULT 1,
    theme_config JSONB DEFAULT '{"primary": "#00ff41", "secondary": "#bc13fe", "bg": "#050505"}',
    credit_costs JSONB DEFAULT '{"daily": 1.0, "weekly": 5.0, "monthly": 15.0}',
    key_config JSONB DEFAULT '{"prefix": "LKL", "length": 8}',
    CONSTRAINT single_row CHECK (id = 1)
);

-- 4. Insert default settings if not exists
INSERT INTO system_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
