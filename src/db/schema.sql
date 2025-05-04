
-- PostgreSQL Schema for VIANG Application

-- Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  type VARCHAR(20) NOT NULL CHECK (type IN ('person', 'business')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Methods Table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank VARCHAR(255) NOT NULL,
  account_holder VARCHAR(255) NOT NULL,
  account_number VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  is_yappy BOOLEAN DEFAULT FALSE,
  yappy_logo VARCHAR(255),
  yappy_phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number VARCHAR(50) NOT NULL UNIQUE,
  date DATE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  subtotal DECIMAL(12, 2) NOT NULL,
  tax DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('quote', 'invoice')),
  valid_days INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Line Items Table (for document items)
CREATE TABLE line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(12, 2) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Document Payment Methods Junction Table
CREATE TABLE document_payment_methods (
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, payment_method_id)
);

-- Document Terms And Conditions
CREATE TABLE document_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  term_text TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Company Info Table (singleton - only one row expected)
CREATE TABLE company_info (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensures only one row
  name VARCHAR(255) NOT NULL,
  ruc VARCHAR(50) NOT NULL,
  dv VARCHAR(10) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  logo VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Template Preferences Table (singleton - only one row expected)
CREATE TABLE template_preferences (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensures only one row
  primary_color VARCHAR(50) NOT NULL,
  font_family VARCHAR(100) NOT NULL,
  logo_position VARCHAR(50) NOT NULL,
  show_logo BOOLEAN NOT NULL DEFAULT TRUE,
  date_format VARCHAR(50) NOT NULL,
  color_theme VARCHAR(50) NOT NULL,
  header_layout VARCHAR(50) NOT NULL,
  use_triangle_design BOOLEAN NOT NULL DEFAULT FALSE,
  show_watermark BOOLEAN NOT NULL DEFAULT TRUE,
  show_signature BOOLEAN NOT NULL DEFAULT TRUE,
  show_company_name BOOLEAN NOT NULL DEFAULT TRUE,
  show_full_document_number BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords only
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_documents_customer_id ON documents(customer_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_line_items_document_id ON line_items(document_id);
CREATE INDEX idx_document_terms_document_id ON document_terms(document_id);

-- Insert default company information
INSERT INTO company_info (name, ruc, dv, contact_name, phone, email, address, logo)
VALUES ('Mi Empresa', '12345-12-12345', 'DV-1', 'Juan Pérez', '+507 6123-4567', 'info@miempresa.com', 'Panamá, Ciudad de Panamá', 'logo.png')
ON CONFLICT (id) DO NOTHING;

-- Insert default template preferences
INSERT INTO template_preferences (
  primary_color, font_family, logo_position, show_logo, 
  date_format, color_theme, header_layout, use_triangle_design, 
  show_watermark, show_signature, show_company_name, show_full_document_number
)
VALUES (
  '#3b82f6', 'Inter', 'left', TRUE, 
  'DD/MM/YYYY', 'blue', 'default', FALSE, 
  TRUE, TRUE, TRUE, TRUE
)
ON CONFLICT (id) DO NOTHING;
