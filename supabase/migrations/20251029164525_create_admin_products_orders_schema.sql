/*
  # Create Admin, Products, and Orders Schema

  ## Summary
  This migration sets up the complete database schema for an admin panel with product and order management.

  ## 1. New Tables
  
  ### `admin_users`
  - `id` (uuid, primary key) - Unique identifier for admin user
  - `email` (text, unique) - Admin email address
  - `full_name` (text) - Admin's full name
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (numeric) - Product price
  - `category` (text) - Product category
  - `image_url` (text) - URL to product image
  - `stock_quantity` (integer) - Available stock
  - `is_active` (boolean) - Whether product is active/visible
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `orders`
  - `id` (uuid, primary key) - Unique order identifier
  - `customer_name` (text) - Customer's name
  - `customer_email` (text) - Customer's email
  - `customer_phone` (text) - Customer's phone number
  - `customer_address` (text) - Delivery address
  - `total_amount` (numeric) - Total order amount
  - `status` (text) - Order status (pending, approved, rejected, completed)
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last status update timestamp
  
  ### `order_items`
  - `id` (uuid, primary key) - Unique order item identifier
  - `order_id` (uuid, foreign key) - Reference to orders table
  - `product_id` (uuid, foreign key) - Reference to products table
  - `quantity` (integer) - Quantity ordered
  - `price_at_time` (numeric) - Product price at time of order
  - `created_at` (timestamptz) - Creation timestamp

  ## 2. Storage Bucket
  - Creates `product-images` bucket for storing product photos
  - Public access enabled for product images

  ## 3. Security
  - Enable RLS on all tables
  - Admin users can manage all products and orders
  - Public users can view active products only
  - Order creation allowed for anyone (customers)
  - Product images are publicly accessible
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  category text DEFAULT 'General',
  image_url text,
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_at_time numeric(10, 2) NOT NULL CHECK (price_at_time >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
CREATE POLICY "Admin users can view their own profile"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admin users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admin users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for orders
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin users can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admin users can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admin users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
