-- Brands
CREATE INDEX IF NOT EXISTS idx_brands_user_id
ON brands(user_id);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_brand_id
ON products(brand_id);

CREATE INDEX IF NOT EXISTS idx_products_updated_at
ON products(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_created_at
ON products(created_at DESC);

-- History
CREATE INDEX IF NOT EXISTS idx_history_user_id
ON history(user_id);

CREATE INDEX IF NOT EXISTS idx_history_created_at
ON history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_history_user_created
ON history(user_id, created_at DESC);