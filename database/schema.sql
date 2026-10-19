-- =================================================================================
-- SHAD SODAI — PRODUCTION SQL DATABASE SCHEMA (PostgreSQL / Supabase)
-- Tables: categories, brands, products, product_variants
-- Includes Primary Keys, Foreign Keys, Indexes, Triggers, created_at & updated_at
-- =================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =================================================================================
-- 1. CATEGORIES TABLE
-- =================================================================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  bn_name TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  image TEXT,
  description TEXT,
  parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =================================================================================
-- 2. BRANDS TABLE
-- =================================================================================
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

DROP TRIGGER IF EXISTS trg_brands_updated_at ON brands;
CREATE TRIGGER trg_brands_updated_at
BEFORE UPDATE ON brands
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =================================================================================
-- 3. PRODUCTS TABLE
-- Complete columns for Admin Panel "Add Product" -> Database -> Customer Website
-- =================================================================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  bn_name TEXT,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT,
  barcode TEXT,

  -- Foreign Key Relationships to Categories & Brands
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  subcategory TEXT,
  brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL,
  brand TEXT DEFAULT 'SHAD SODAI',

  -- Pricing & Profit / Investment Columns
  regular_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_price NUMERIC(12, 2) DEFAULT 0,
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  buying_price NUMERIC(12, 2) NOT NULL DEFAULT 0, -- Investment / Buying Price
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  original_price NUMERIC(12, 2) DEFAULT 0,
  discount_percent NUMERIC(5, 2) DEFAULT 0,

  -- Inventory & Stock Columns
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,

  -- Weight / Gram Options, Sizes, Colors & Attributes
  weight_options TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors JSONB DEFAULT '[]'::jsonb,
  gender TEXT DEFAULT 'Men',
  fabric TEXT,
  fit_type TEXT,
  sleeve_type TEXT,
  collar_type TEXT,
  pattern TEXT,
  occasion TEXT,
  season TEXT,
  size_chart JSONB DEFAULT '[]'::jsonb,
  care_instructions TEXT[] DEFAULT '{}',
  country_of_origin TEXT DEFAULT 'Bangladesh',

  -- Media / Product Images
  main_image TEXT NOT NULL,
  gallery_images TEXT[] DEFAULT '{}',
  video_url TEXT,

  -- Descriptions, Features & Keywords (SEO & Search)
  short_description TEXT,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,

  -- Shipping & Return Details
  delivery_time TEXT DEFAULT '24-48 Hours Inside Dhaka, 2-4 Days Nationwide',
  return_policy TEXT DEFAULT '7 Days Easy Size Exchange & Return',

  -- Display & Status Flags
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  reviews_count INTEGER NOT NULL DEFAULT 0,

  -- Audit Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Production Indexes for Fast Filtering & Joins
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =================================================================================
-- 4. PRODUCT VARIANTS TABLE (Weight / Gram Options & Size / Color Combinations)
-- =================================================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  weight TEXT NOT NULL DEFAULT 'Standard',
  size TEXT,
  color TEXT,
  color_hex TEXT,
  regular_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_price NUMERIC(12, 2) DEFAULT 0,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  original_price NUMERIC(12, 2) DEFAULT 0,
  buying_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  barcode TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON product_variants;
CREATE TRIGGER trg_product_variants_updated_at
BEFORE UPDATE ON product_variants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
