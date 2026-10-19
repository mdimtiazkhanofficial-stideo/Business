export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductColor {
  name: string; // e.g. 'Jet Black', 'Navy Blue', 'Olive Green'
  hex?: string; // e.g. '#111111', '#1B365D', '#556B2F'
  image?: string; // variant color-specific image URL
}

export interface ProductVariant {
  id: string;
  product_id?: string;
  size?: string; // e.g. 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34'
  weight?: string; // e.g. '100g', '250g', '500g', '1kg'
  color?: string; // e.g. 'Black', 'Navy Blue', 'White'
  color_code?: string; // e.g. '#000000'
  image?: string; // variant-specific image URL
  regular_price?: number; // Regular price in BDT (৳)
  discount_price?: number; // Discount price in BDT (৳)
  selling_price?: number; // Effective selling price in BDT (৳)
  buying_price?: number; // Buying/Investment price in BDT (৳)
  extra_price?: number; // Extra price added for this variant
  price: number; // Current selling price in BDT (৳)
  original_price: number; // Regular/previous price in BDT (৳)
  stock: number;
  sku?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SizeVariant {
  size: string;
  extraPrice: number;
  extra_price?: number;
}

export interface SizeChartRow {
  size: string;
  chest?: string;
  length?: string;
  sleeve?: string;
  shoulder?: string;
  waist?: string;
}

export interface Product {
  id: string;
  name: string;
  bn_name?: string;
  slug: string;
  sku: string;
  category_id: string;
  category_name?: string;
  brand_id?: string;
  brand?: string; // e.g. 'SHAD SODAI'
  main_image: string;
  gallery_images: string[];
  short_description: string;
  description?: string;
  long_description: string;
  regular_price?: number; // Regular price in BDT (৳)
  discount_price?: number; // Discount price in BDT (৳)
  selling_price: number; // Effective customer selling price in BDT (৳)
  buying_price: number; // Investment / Buying price in BDT (৳)
  stock: number;
  weight_options?: string[]; // Dynamic Weight/Gram options (e.g. ['100g', '250g', '500g', '1kg'])
  sizes?: string[]; // Dynamic sizes configured in admin (e.g. ['S', 'M', 'L', 'XL'])
  colors?: ProductColor[]; // Dynamic colors configured in admin
  keywords?: string[]; // Search & SEO keywords
  tags?: string[]; // Product tags / keywords
  features?: string[]; // Key product features / highlights
  fabric?: string; // e.g. '100% Combed Compact Cotton, 240 GSM'
  material?: string; // e.g. 'Organic Cotton Twill'
  fit?: string; // e.g. 'Regular Fit'
  pattern?: string; // e.g. 'Solid'
  sleeve?: string; // e.g. 'Short Sleeve'
  neck_collar?: string; // e.g. 'Crew Neck'
  gender?: string; // e.g. 'Men' / 'Unisex'
  season?: string; // e.g. 'All Seasons'
  origin?: string; // e.g. 'Bangladesh'
  care_instructions?: string; // e.g. 'Machine wash cold with like colors'
  exchange_policy?: string; // e.g. '7-Day Easy Exchange & Replacement'
  size_chart?: SizeChartRow[];
  sizeVariants?: SizeVariant[];
  size_variants?: SizeVariant[];
  variants: ProductVariant[];
  ingredients?: string;
  nutrition?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
    vitamins?: string;
  };
  benefits?: string[];
  how_to_use?: string;
  storage_instructions?: string;
  delivery_info: string;
  seo_title: string;
  seo_description: string;
  rating: number;
  review_count: number;
  status: 'active' | 'inactive' | 'draft';
  is_featured?: boolean;
  is_popular?: boolean;
  is_bestseller?: boolean;
  is_combo?: boolean;
  original_price?: number;
  sale_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  bn_name: string;
  slug: string;
  description: string;
  image: string;
  banner_image?: string;
  cover_photo?: string;
  display_order: number;
  is_active: boolean;
  show_on_homepage: boolean;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string; // cart item unique key
  product: Product;
  selected_variant: ProductVariant;
  quantity: number;

  // Normalized convenience fields for direct access & backward compatibility
  product_id?: string;
  variant_id?: string;
  product_name?: string;
  product_image?: string;
  price?: number;
  weight?: string;
  size?: string;
  color?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  variant_weight?: string;
  variant_size?: string;
  variant_color?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  order_notes?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  payment_method: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'bank' | string;
  payment_status: 'pending' | 'paid' | 'rejected';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'incomplete';
  created_at: string;
  bill_id?: string;
  is_incomplete?: boolean;
  courier_name?: string;
  tracking_id?: string;
  shipment_status?: string;
  shipment_date?: string;
  total_amount?: number;
  transaction_id?: string;
  sender_phone?: string;
  payment_proof?: string;
}

export type ManualPaymentMethodKey = 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'card_payment' | 'cod' | string;

export interface PaymentAccountConfig {
  id: string;
  method: ManualPaymentMethodKey;
  title: string;
  category?: 'mobile_banking' | 'bank_transfer' | 'card_payment' | 'cod';
  account_type: 'Send Money' | 'Payment' | 'Send Money / Payment' | 'Personal' | 'Agent' | 'Merchant' | 'Bank' | 'Card' | 'COD' | string;
  account_number: string;
  account_name?: string;
  bank_name?: string;
  branch_name?: string;
  routing_number?: string;
  instructions: string;
  logo_url?: string;
  is_enabled: boolean;
  display_order: number;
  updated_at?: string;
}

export type PaymentRecordStatus = 'PENDING' | 'PAID' | 'REJECTED';

export interface PaymentRecord {
  id: string;
  order_id: string;
  order_number?: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  payment_method: string;
  account_type: string;
  account_number: string;
  amount: number;
  transaction_id: string;
  sender_phone?: string;
  payment_proof?: string;
  status: PaymentRecordStatus;
  admin_note?: string;
  created_at: string;
  verified_at?: string;
}

export interface Review {
  id: string;
  user_id?: string;
  product_id: string;
  product_name?: string;
  customer_name: string;
  rating: number;
  comment: string;
  verified_purchase: boolean;
  status: 'approved' | 'pending';
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  role: 'customer' | 'admin';
  created_at?: string;
}

export interface SupportMessage {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  button_text: string;
  button_link?: string;
  image_url: string;
  image?: string;
  type: 'hero' | 'promo' | 'special';
  placement?: string;
  is_active: boolean;
  homepage_enabled?: boolean;
  product_id?: string;
  display_order?: number;
  created_at?: string;
}

export type PolicyPageSlug =
  | 'terms-and-conditions'
  | 'privacy-policy'
  | 'shipping-and-delivery'
  | 'return-and-refund'
  | 'payment-policy'
  | 'customer-rules'
  | 'report-an-issue';

export interface PolicyPageContent {
  slug: PolicyPageSlug;
  title: string;
  subtitle: string;
  content: string;
  updated_at: string;
}

export interface QuickLinkSectionItem {
  id: string;
  quick_link_id: string;
  section_number: number;
  heading: string;
  content: string;
  bullet_points: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuickLinkItem {
  id: string;
  title: string;
  page_title?: string;
  short_description?: string;
  slug: string;
  type: 'quick_link' | 'policy';
  url: string;
  is_active: boolean;
  display_order: number;
  sections?: QuickLinkSectionItem[];
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  // Company & Identity
  store_name: string;
  company_name?: string;
  store_logo?: string;
  company_logo?: string;

  // Taglines & Announcements
  announcement_text: string;
  footer_tagline?: string;
  footer_description?: string;

  // Contact Information
  store_phone: string;
  contact_phone?: string;
  store_email: string;
  contact_email?: string;
  store_address: string;
  contact_address?: string;
  support_email?: string;
  support_phone?: string;
  whatsapp_number: string;
  facebook_page_url: string;

  // Quality / Guarantee Section
  guarantee_quality?: string;
  guarantee_authentic?: string;
  guarantee_delivery?: string;
  guarantee_purity?: string;
  guarantee_payments?: string;
  guarantee_certification?: string;

  // Dynamic CMS Policy Pages
  policy_pages?: Record<PolicyPageSlug, PolicyPageContent>;

  // Copyright Section
  copyright_text?: string;
  footer_bottom_line_1?: string;
  footer_bottom_line_2?: string;
  footer_bottom_line_3?: string;

  // Mobile App Download
  app_download_enabled?: boolean;
  app_download_button_text?: string;
  app_android_url?: string;
  app_ios_url?: string;

  // Delivery Rates & Supabase
  delivery_inside_dhaka: number;
  delivery_outside_dhaka: number;
  free_delivery_min_order: number;
  supabase_connected?: boolean;
}

export interface ProcessStep {
  id: string;
  title: string;
  short_description: string;
  image_url: string;
  video_url?: string;
  video_thumbnail?: string;
  display_order: number;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface StockHistoryRecord {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  type: 'manual_adjustment' | 'order_deduction' | 'restock' | 'return';
  quantity_changed: number;
  previous_stock: number;
  new_stock: number;
  reason?: string;
  created_at: string;
}

export interface CalculationRecord {
  id: string;
  title: string;
  product_id?: string;
  product_name?: string;
  buying_price: number;
  stock_quantity: number;
  selling_price: number;
  discount: number;
  total_cost: number;
  total_sales: number;
  profit: number;
  profit_margin: number;
  notes?: string;
  created_at: string;
}

export interface SeoSettings {
  site_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  google_site_verification?: string;
  google_analytics_id?: string;
  facebook_pixel_id?: string;
  social_facebook_url?: string;
  social_instagram_url?: string;
  social_youtube_url?: string;
  structured_data_enabled: boolean;
  product_seo_template?: string;
  category_seo_template?: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Super Admin' | 'Store Manager' | 'Inventory Lead' | 'Staff';
  avatar?: string;
  last_login?: string;
  permissions?: string[];
}
