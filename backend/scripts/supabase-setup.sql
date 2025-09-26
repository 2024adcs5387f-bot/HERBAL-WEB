-- Herbal Marketplace Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) DEFAULT 'buyer' CHECK (user_type IN ('buyer', 'seller', 'herbalist')),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    avatar TEXT,
    phone VARCHAR(20),
    address JSONB DEFAULT '{}',
    
    -- Seller specific fields
    business_name VARCHAR(200),
    business_license TEXT,
    seller_verification_status VARCHAR(20) CHECK (seller_verification_status IN ('pending', 'approved', 'rejected')),
    
    -- Herbalist specific fields
    credentials JSONB DEFAULT '[]',
    specializations JSONB DEFAULT '[]',
    herbalist_verification_status VARCHAR(20) CHECK (herbalist_verification_status IN ('pending', 'approved', 'rejected')),
    
    -- Profile fields
    bio TEXT,
    experience INTEGER,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    last_login_at TIMESTAMP WITH TIME ZONE,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= 0),
    category VARCHAR(50) NOT NULL CHECK (category IN ('herbs', 'supplements', 'teas', 'oils', 'powders', 'capsules', 'tinctures', 'other')),
    subcategory VARCHAR(100),
    tags JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku VARCHAR(50) UNIQUE,
    weight DECIMAL(8,2),
    dimensions JSONB,
    is_organic BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Herbal specific fields
    botanical_name VARCHAR(200),
    origin VARCHAR(100),
    harvest_date DATE,
    expiry_date DATE,
    medicinal_uses JSONB DEFAULT '[]',
    contraindications JSONB DEFAULT '[]',
    dosage TEXT,
    preparation TEXT,
    
    -- SEO fields
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(100),
    meta_description VARCHAR(200),
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- Foreign keys
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_id VARCHAR(100),
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0.00,
    shipping DECIMAL(10,2) DEFAULT 0.00,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    tracking_number VARCHAR(100),
    notes TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    product_snapshot JSONB NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_is_organic ON products(is_organic);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_number ON orders(order_number);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_seller_id ON order_items(seller_id);

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'HM-' || EXTRACT(EPOCH FROM NOW())::text || '-' || substr(md5(random()::text), 1, 6);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and public seller/herbalist profiles
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Public can view verified sellers and herbalists" ON users FOR SELECT USING (
    (user_type = 'seller' AND seller_verification_status = 'approved' AND is_active = true) OR
    (user_type = 'herbalist' AND herbalist_verification_status = 'approved' AND is_active = true)
);

-- Products are publicly readable, but only sellers can manage their own
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (auth.uid()::text = seller_id::text);

-- Orders are only accessible by buyers and involved sellers
CREATE POLICY "Buyers can view own orders" ON orders FOR SELECT USING (auth.uid()::text = buyer_id::text);
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = buyer_id::text);

-- Order items follow order permissions
CREATE POLICY "Order items follow order permissions" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.buyer_id::text = auth.uid()::text OR order_items.seller_id::text = auth.uid()::text)
    )
);
