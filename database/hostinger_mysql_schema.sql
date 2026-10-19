-- ============================================================================
-- SHAD SODAI — HOSTINGER MYSQL DATABASE SCHEMA (MySQL 8.0+ / MariaDB)
-- Import this file directly in Hostinger hPanel -> phpMyAdmin -> Import / SQL
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `bn_name` VARCHAR(255) DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `image` LONGTEXT DEFAULT NULL,
  `banner_image` LONGTEXT DEFAULT NULL,
  `cover_photo` LONGTEXT DEFAULT NULL,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `show_on_homepage` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Brands Table
CREATE TABLE IF NOT EXISTS `brands` (
  `id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `logo_url` LONGTEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_brands_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `bn_name` VARCHAR(255) DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) DEFAULT NULL,
  `category_id` VARCHAR(100) DEFAULT NULL,
  `category_name` VARCHAR(255) DEFAULT NULL,
  `brand_id` VARCHAR(100) DEFAULT NULL,
  `brand` VARCHAR(255) DEFAULT 'SHAD SODAI',
  `main_image` LONGTEXT NOT NULL,
  `gallery_images` JSON DEFAULT NULL,
  `short_description` TEXT DEFAULT NULL,
  `long_description` LONGTEXT DEFAULT NULL,
  `buying_price` DECIMAL(12,2) DEFAULT 0.00,
  `selling_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount_price` DECIMAL(12,2) DEFAULT NULL,
  `original_price` DECIMAL(12,2) DEFAULT NULL,
  `stock` INT DEFAULT 0,
  `rating` DECIMAL(3,2) DEFAULT 5.00,
  `review_count` INT DEFAULT 0,
  `sizes` JSON DEFAULT NULL,
  `colors` JSON DEFAULT NULL,
  `fabric` VARCHAR(255) DEFAULT NULL,
  `material` VARCHAR(255) DEFAULT NULL,
  `fit` VARCHAR(255) DEFAULT NULL,
  `pattern` VARCHAR(255) DEFAULT NULL,
  `sleeve` VARCHAR(255) DEFAULT NULL,
  `neck_collar` VARCHAR(255) DEFAULT NULL,
  `gender` VARCHAR(100) DEFAULT NULL,
  `season` VARCHAR(100) DEFAULT NULL,
  `origin` VARCHAR(255) DEFAULT NULL,
  `care_instructions` TEXT DEFAULT NULL,
  `exchange_policy` TEXT DEFAULT NULL,
  `size_chart` JSON DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `size_variants` JSON DEFAULT NULL,
  `ingredients` TEXT DEFAULT NULL,
  `nutrition` JSON DEFAULT NULL,
  `benefits` JSON DEFAULT NULL,
  `how_to_use` TEXT DEFAULT NULL,
  `storage_instructions` TEXT DEFAULT NULL,
  `delivery_info` TEXT DEFAULT NULL,
  `seo_title` VARCHAR(255) DEFAULT NULL,
  `seo_description` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'active',
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_popular` TINYINT(1) DEFAULT 0,
  `is_bestseller` TINYINT(1) DEFAULT 0,
  `is_combo` TINYINT(1) DEFAULT 0,
  `sale_count` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Product Variants Table
CREATE TABLE IF NOT EXISTS `product_variants` (
  `id` VARCHAR(120) NOT NULL,
  `product_id` VARCHAR(100) NOT NULL,
  `weight` VARCHAR(100) DEFAULT 'Standard',
  `size` VARCHAR(100) DEFAULT NULL,
  `color` VARCHAR(100) DEFAULT NULL,
  `color_code` VARCHAR(50) DEFAULT NULL,
  `image` LONGTEXT DEFAULT NULL,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `original_price` DECIMAL(12,2) DEFAULT NULL,
  `stock` INT DEFAULT 10,
  `sku` VARCHAR(120) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_variants_product` (`product_id`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Banners Table
CREATE TABLE IF NOT EXISTS `banners` (
  `id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `subtitle` TEXT DEFAULT NULL,
  `button_text` VARCHAR(100) DEFAULT 'SHOP NOW',
  `button_link` VARCHAR(500) DEFAULT '#shop',
  `image_url` LONGTEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'hero',
  `is_active` TINYINT(1) DEFAULT 1,
  `homepage_enabled` TINYINT(1) DEFAULT 1,
  `product_id` VARCHAR(100) DEFAULT NULL,
  `display_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Customers / Users Table
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT 'Dhaka',
  `role` VARCHAR(50) DEFAULT 'customer',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customers_email` (`email`),
  KEY `idx_customers_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(100) NOT NULL,
  `order_number` VARCHAR(100) NOT NULL,
  `user_id` VARCHAR(100) DEFAULT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(255) DEFAULT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `customer_address` TEXT NOT NULL,
  `customer_city` VARCHAR(100) NOT NULL DEFAULT 'Dhaka',
  `order_notes` TEXT DEFAULT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `delivery_charge` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(12,2) DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) DEFAULT 0.00,
  `payment_method` VARCHAR(100) NOT NULL DEFAULT 'cod',
  `payment_status` VARCHAR(50) DEFAULT 'pending',
  `order_status` VARCHAR(50) DEFAULT 'pending',
  `courier_name` VARCHAR(100) DEFAULT NULL,
  `tracking_id` VARCHAR(100) DEFAULT NULL,
  `shipment_status` VARCHAR(100) DEFAULT NULL,
  `shipment_date` VARCHAR(100) DEFAULT NULL,
  `transaction_id` VARCHAR(150) DEFAULT NULL,
  `sender_phone` VARCHAR(50) DEFAULT NULL,
  `payment_proof` LONGTEXT DEFAULT NULL,
  `is_incomplete` TINYINT(1) DEFAULT 0,
  `bill_id` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_orders_number` (`order_number`),
  KEY `idx_orders_status` (`order_status`),
  KEY `idx_orders_phone` (`customer_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `order_id` VARCHAR(100) NOT NULL,
  `product_id` VARCHAR(100) DEFAULT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `variant_weight` VARCHAR(100) DEFAULT NULL,
  `variant_size` VARCHAR(100) DEFAULT NULL,
  `variant_color` VARCHAR(100) DEFAULT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `image` LONGTEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Payment Methods Table
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` VARCHAR(100) NOT NULL,
  `method` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `account_type` VARCHAR(100) DEFAULT NULL,
  `account_number` VARCHAR(255) DEFAULT NULL,
  `account_name` VARCHAR(255) DEFAULT NULL,
  `bank_name` VARCHAR(255) DEFAULT NULL,
  `branch_name` VARCHAR(255) DEFAULT NULL,
  `routing_number` VARCHAR(100) DEFAULT NULL,
  `instructions` TEXT DEFAULT NULL,
  `logo_url` LONGTEXT DEFAULT NULL,
  `is_enabled` TINYINT(1) DEFAULT 0,
  `display_order` INT DEFAULT 1,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_payment_method_key` (`method`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Payment Records Table
CREATE TABLE IF NOT EXISTS `payment_records` (
  `id` VARCHAR(100) NOT NULL,
  `order_id` VARCHAR(100) DEFAULT NULL,
  `order_number` VARCHAR(100) DEFAULT NULL,
  `customer_id` VARCHAR(100) DEFAULT NULL,
  `customer_name` VARCHAR(255) DEFAULT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `payment_method` VARCHAR(100) DEFAULT NULL,
  `account_type` VARCHAR(100) DEFAULT NULL,
  `account_number` VARCHAR(255) DEFAULT NULL,
  `amount` DECIMAL(12,2) DEFAULT 0.00,
  `transaction_id` VARCHAR(150) DEFAULT NULL,
  `sender_phone` VARCHAR(50) DEFAULT NULL,
  `payment_proof` LONGTEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'PENDING',
  `admin_note` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `verified_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payment_records_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(100) NOT NULL,
  `product_id` VARCHAR(100) DEFAULT NULL,
  `product_name` VARCHAR(255) DEFAULT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `comment` TEXT NOT NULL,
  `verified_purchase` TINYINT(1) DEFAULT 1,
  `status` VARCHAR(50) DEFAULT 'approved',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Process Steps Table
CREATE TABLE IF NOT EXISTS `process_steps` (
  `id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `short_description` TEXT NOT NULL,
  `image_url` LONGTEXT NOT NULL,
  `video_url` TEXT DEFAULT NULL,
  `video_thumbnail` LONGTEXT DEFAULT NULL,
  `display_order` INT DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Support Messages Table
CREATE TABLE IF NOT EXISTS `support_messages` (
  `id` VARCHAR(100) NOT NULL,
  `user_id` VARCHAR(100) DEFAULT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'new',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Quick Links Table
CREATE TABLE IF NOT EXISTS `quick_links` (
  `id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `page_title` VARCHAR(255) DEFAULT NULL,
  `short_description` TEXT DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'quick',
  `url` VARCHAR(500) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_quick_links_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Quick Link Sections Table
CREATE TABLE IF NOT EXISTS `quick_link_sections` (
  `id` VARCHAR(120) NOT NULL,
  `quick_link_id` VARCHAR(100) NOT NULL,
  `section_number` INT DEFAULT 1,
  `heading` VARCHAR(500) NOT NULL,
  `content` LONGTEXT DEFAULT NULL,
  `bullet_points` JSON DEFAULT NULL,
  `display_order` INT DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ql_sections_link` (`quick_link_id`),
  CONSTRAINT `fk_ql_sections_link` FOREIGN KEY (`quick_link_id`) REFERENCES `quick_links` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Stock History Table
CREATE TABLE IF NOT EXISTS `stock_history` (
  `id` VARCHAR(100) NOT NULL,
  `product_id` VARCHAR(100) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) DEFAULT NULL,
  `type` VARCHAR(50) DEFAULT 'manual_adjustment',
  `quantity_changed` INT NOT NULL DEFAULT 0,
  `previous_stock` INT NOT NULL DEFAULT 0,
  `new_stock` INT NOT NULL DEFAULT 0,
  `reason` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Business Calculations Table
CREATE TABLE IF NOT EXISTS `calculations` (
  `id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `payload` JSON NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Site Settings Key-Value Table (Store Settings, SEO Settings, Admin Profile)
CREATE TABLE IF NOT EXISTS `site_settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` JSON NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
