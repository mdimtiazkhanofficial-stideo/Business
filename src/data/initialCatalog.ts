import { Category, Product, Banner, Review, SiteSettings, ProcessStep, PolicyPageSlug, PolicyPageContent, QuickLinkItem } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-tshirts',
    name: 'T-Shirts & Polos',
    bn_name: 'টি-শার্ট ও পোলো',
    slug: 't-shirts-polos',
    description: 'Heavyweight organic cotton crewnecks, drop-shoulder oversized tees, and premium pima polos.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80',
    banner_image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80',
    display_order: 1,
    is_active: true,
    show_on_homepage: true,
    product_count: 6
  },
  {
    id: 'cat-shirts',
    name: 'Casual & Formal Shirts',
    bn_name: 'শার্ট কালেকশন',
    slug: 'casual-formal-shirts',
    description: 'Classic Oxford button-downs, breathable linen shirts, and modern resort collar casuals.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
    banner_image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1400&q=80',
    display_order: 2,
    is_active: true,
    show_on_homepage: true,
    product_count: 5
  },
  {
    id: 'cat-pants',
    name: 'Pants & Chinos',
    bn_name: 'প্যান্টস ও চিনো',
    slug: 'pants-chinos',
    description: 'Smart stretch chinos, tailored utility cargos, and relaxed pleated trousers.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80',
    banner_image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1400&q=80',
    display_order: 3,
    is_active: true,
    show_on_homepage: true,
    product_count: 4
  },
  {
    id: 'cat-denim',
    name: 'Denim Jeans',
    bn_name: 'ডেনিম জিন্স',
    slug: 'denim-jeans',
    description: 'Durable selvedge denim, slim taper cuts, and vintage washed daily jeans.',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80',
    banner_image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1400&q=80',
    display_order: 4,
    is_active: true,
    show_on_homepage: true,
    product_count: 4
  },
  {
    id: 'cat-jackets',
    name: 'Jackets & Hoodies',
    bn_name: 'জ্যাকেট ও হুডি',
    slug: 'jackets-hoodies',
    description: 'Denim trucker jackets, heavyweight fleece pullovers, and seasonal overshirts.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
    banner_image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=80',
    display_order: 5,
    is_active: true,
    show_on_homepage: true,
    product_count: 4
  },
  {
    id: 'cat-co-ord',
    name: 'Co-Ord Sets & Loungewear',
    bn_name: 'কো-অর্ড ও লাউঞ্জওয়্যার',
    slug: 'co-ord-sets',
    description: 'Matching summer linen sets, airport coordinates, and premium cotton loungewear.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
    banner_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80',
    display_order: 6,
    is_active: true,
    show_on_homepage: true,
    product_count: 3
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-heavy-tee',
    name: 'Heavyweight Premium Cotton Crewneck T-Shirt',
    bn_name: 'প্রিমিয়াম হেভিওয়েট সুতি টি-শার্ট',
    slug: 'heavyweight-premium-cotton-crewneck-t-shirt',
    sku: 'TSH-HVY-01',
    category_id: 'cat-tshirts',
    category_name: 'T-Shirts & Polos',
    main_image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80'
    ],
    short_description: 'Engineered from 240 GSM combed organic cotton with pre-shrunk weave and tailored ribbed collar.',
    long_description: 'A modern wardrobe foundation built to withstand hundreds of washes without losing shape or color richness. Features reinforced twin-needle stitching at hem and sleeves with an elevated comfortable fit.',
    buying_price: 320,
    selling_price: 590,
    discount_price: 750,
    stock: 85,
    rating: 4.9,
    review_count: 48,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Jet Black', hex: '#111111', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80' },
      { name: 'Heather Grey', hex: '#9CA3AF', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=700&q=80' },
      { name: 'Navy Blue', hex: '#1B365D', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80' },
      { name: 'Pure White', hex: '#FFFFFF' }
    ],
    fabric: '100% Combed Compact Cotton, 240 GSM',
    fit: 'Regular Tailored Fit',
    care_instructions: 'Machine wash cold with like colors. Do not bleach. Warm iron inside out.',
    variants: [
      { id: 'v-tee-s-blk', size: 'S', color: 'Jet Black', color_code: '#111111', price: 590, original_price: 750, stock: 15, sku: 'TSH-HVY-S-BLK' },
      { id: 'v-tee-m-blk', size: 'M', color: 'Jet Black', color_code: '#111111', price: 590, original_price: 750, stock: 20, sku: 'TSH-HVY-M-BLK' },
      { id: 'v-tee-l-blk', size: 'L', color: 'Jet Black', color_code: '#111111', price: 590, original_price: 750, stock: 20, sku: 'TSH-HVY-L-BLK' },
      { id: 'v-tee-xl-blk', size: 'XL', color: 'Jet Black', color_code: '#111111', price: 590, original_price: 750, stock: 15, sku: 'TSH-HVY-XL-BLK' },
      { id: 'v-tee-xxl-blk', size: 'XXL', color: 'Jet Black', color_code: '#111111', price: 650, original_price: 800, stock: 15, sku: 'TSH-HVY-XXL-BLK' }
    ],
    delivery_info: 'Delivered in 24-48 hours inside Dhaka, 3-5 days across all districts.',
    seo_title: 'Heavyweight Premium Cotton T-Shirt | SHAD SODAI Clothing',
    seo_description: 'Buy premium 240 GSM cotton t-shirts in Bangladesh. Durable, breathable, and pre-shrunk for maximum comfort.',
    status: 'active',
    is_popular: true,
    is_bestseller: true
  },
  {
    id: 'prod-oxford-shirt',
    name: 'Slim-Fit Oxford Cotton Casual Button-Down Shirt',
    bn_name: 'অক্সফোর্ড কটন ক্যাজুয়াল শার্ট',
    slug: 'slim-fit-oxford-cotton-casual-button-down-shirt',
    sku: 'SHT-OXF-02',
    category_id: 'cat-shirts',
    category_name: 'Casual & Formal Shirts',
    main_image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80'
    ],
    short_description: 'Woven from authentic two-ply Oxford basketweave cotton with classic button-down collar.',
    long_description: 'Versatile enough to be paired with chinos for meetings or unbuttoned over a t-shirt for weekend getaways. Breathable texture designed specifically for tropical comfort.',
    buying_price: 650,
    selling_price: 1190,
    discount_price: 1450,
    stock: 55,
    rating: 4.8,
    review_count: 32,
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Sky Blue', hex: '#87CEEB', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80' },
      { name: 'Pure White', hex: '#FFFFFF', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80' },
      { name: 'Dusty Olive', hex: '#556B2F' }
    ],
    fabric: '100% Two-Ply Oxford Cotton',
    fit: 'Modern Slim Fit',
    care_instructions: 'Machine wash warm. Hang dry. Medium steam iron.',
    variants: [
      { id: 'v-oxf-m', size: 'M', color: 'Sky Blue', price: 1190, original_price: 1450, stock: 20, sku: 'SHT-OXF-M' },
      { id: 'v-oxf-l', size: 'L', color: 'Sky Blue', price: 1190, original_price: 1450, stock: 20, sku: 'SHT-OXF-L' },
      { id: 'v-oxf-xl', size: 'XL', color: 'Sky Blue', price: 1190, original_price: 1450, stock: 15, sku: 'SHT-OXF-XL' }
    ],
    delivery_info: 'Fast delivery across Bangladesh. Easy size exchange within 7 days.',
    seo_title: 'Slim Fit Oxford Cotton Shirt | Menswear Collection',
    seo_description: 'Premium pure Oxford cotton casual button-down shirt. Perfect for work and casual style.',
    status: 'active',
    is_popular: true,
    is_bestseller: false
  },
  {
    id: 'prod-stretch-chino',
    name: 'Tailored Smart Stretch Chino Pants',
    bn_name: 'টেইলরড স্মার্ট স্ট্রেচ চিনো প্যান্ট',
    slug: 'tailored-smart-stretch-chino-pants',
    sku: 'PNT-CHN-03',
    category_id: 'cat-pants',
    category_name: 'Pants & Chinos',
    main_image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80'
    ],
    short_description: 'Crafted with 98% cotton twill and 2% elastane for complete flexibility and sharp silhouette.',
    long_description: 'Engineered for all-day mobility from office desks to commute. Features durable YKK zip fly, deep slash front pockets, and piped interior seam bindings.',
    buying_price: 780,
    selling_price: 1390,
    discount_price: 1690,
    stock: 45,
    rating: 4.8,
    review_count: 27,
    sizes: ['30', '32', '34', '36'],
    colors: [
      { name: 'Khaki', hex: '#C3B091' },
      { name: 'Navy Blue', hex: '#1B365D' },
      { name: 'Charcoal Black', hex: '#111111' }
    ],
    fabric: '98% Cotton Twill, 2% Spandex',
    fit: 'Tailored Tapered Leg',
    care_instructions: 'Machine wash cold inside out. Tumble dry low.',
    variants: [
      { id: 'v-chn-30', size: '30', color: 'Khaki', price: 1390, original_price: 1690, stock: 10, sku: 'PNT-CHN-30' },
      { id: 'v-chn-32', size: '32', color: 'Khaki', price: 1390, original_price: 1690, stock: 15, sku: 'PNT-CHN-32' },
      { id: 'v-chn-34', size: '34', color: 'Khaki', price: 1390, original_price: 1690, stock: 12, sku: 'PNT-CHN-34' },
      { id: 'v-chn-36', size: '36', color: 'Khaki', price: 1390, original_price: 1690, stock: 8, sku: 'PNT-CHN-36' }
    ],
    delivery_info: 'Express courier delivery nationwide with tracking.',
    seo_title: 'Smart Stretch Chino Pants | Menswear Essentials',
    seo_description: 'Buy comfortable stretch cotton chinos online. Clean tailored cut with flexible mobility.',
    status: 'active',
    is_popular: true,
    is_bestseller: true
  },
  {
    id: 'prod-denim-jacket',
    name: 'Vintage Washed Denim Trucker Jacket',
    bn_name: 'ভিন্টেজ ওয়াশড ডেনিম ট্র্যাকার জ্যাকেট',
    slug: 'vintage-washed-denim-trucker-jacket',
    sku: 'JKT-DNM-04',
    category_id: 'cat-jackets',
    category_name: 'Jackets & Hoodies',
    main_image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=700&q=80'
    ],
    short_description: '14 oz heavyweight rigid cotton denim featuring authentic hand-distressed wash and brass shanks.',
    long_description: 'An iconic classic outer layer designed to develop personalized patina over years of wear. Dual chest flap pockets and adjustable button side tabs.',
    buying_price: 1400,
    selling_price: 2450,
    discount_price: 2950,
    stock: 35,
    rating: 4.9,
    review_count: 19,
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Washed Indigo', hex: '#4682B4' },
      { name: 'Deep Midnight', hex: '#191970' }
    ],
    fabric: '100% Heavy Cotton Denim (14 oz)',
    fit: 'Standard Layering Fit',
    care_instructions: 'Wash sparingly inside out with cold water. Line dry.',
    variants: [
      { id: 'v-dnm-m', size: 'M', color: 'Washed Indigo', price: 2450, original_price: 2950, stock: 10, sku: 'JKT-DNM-M' },
      { id: 'v-dnm-l', size: 'L', color: 'Washed Indigo', price: 2450, original_price: 2950, stock: 15, sku: 'JKT-DNM-L' },
      { id: 'v-dnm-xl', size: 'XL', color: 'Washed Indigo', price: 2450, original_price: 2950, stock: 10, sku: 'JKT-DNM-XL' }
    ],
    delivery_info: 'Fast door-to-door delivery with open-box verification supported.',
    seo_title: 'Vintage Washed Denim Trucker Jacket',
    seo_description: 'Iconic 14oz heavyweight denim trucker jacket. Premium hardware and authentic faded wash.',
    status: 'active',
    is_popular: false,
    is_bestseller: true
  },
  {
    id: 'prod-pima-polo',
    name: 'Luxury Pima Cotton Piqué Polo Shirt',
    bn_name: 'লাক্সারি পিমা কটন পোলো শার্ট',
    slug: 'luxury-pima-cotton-pique-polo-shirt',
    sku: 'POL-PIM-05',
    category_id: 'cat-tshirts',
    category_name: 'T-Shirts & Polos',
    main_image: 'https://images.unsplash.com/photo-1625910513413-5b8209e7f415?auto=format&fit=crop&w=700&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1625910513413-5b8209e7f415?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=700&q=80'
    ],
    short_description: 'Ultra-soft long staple Pima cotton piqué with pearlized buttons and anti-roll knit collar.',
    long_description: 'Knitted for lasting softness, high color retention, and breathability. Styled with a crisp two-button placket and subtle side vents for neat untucked wear.',
    buying_price: 490,
    selling_price: 890,
    discount_price: 1100,
    stock: 60,
    rating: 4.8,
    review_count: 24,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Forest Green', hex: '#1B4332' },
      { name: 'Burgundy', hex: '#800000' },
      { name: 'Jet Black', hex: '#111111' }
    ],
    fabric: '100% Long-Staple Pima Cotton Piqué (220 GSM)',
    fit: 'Classic Athletic Fit',
    care_instructions: 'Machine wash gentle. Lay flat or hang to dry.',
    variants: [
      { id: 'v-pol-s', size: 'S', color: 'Forest Green', price: 890, original_price: 1100, stock: 15, sku: 'POL-PIM-S' },
      { id: 'v-pol-m', size: 'M', color: 'Forest Green', price: 890, original_price: 1100, stock: 20, sku: 'POL-PIM-M' },
      { id: 'v-pol-l', size: 'L', color: 'Forest Green', price: 890, original_price: 1100, stock: 15, sku: 'POL-PIM-L' },
      { id: 'v-pol-xl', size: 'XL', color: 'Forest Green', price: 890, original_price: 1100, stock: 10, sku: 'POL-PIM-XL' }
    ],
    delivery_info: 'Express shipment with nationwide Cash on Delivery support.',
    seo_title: 'Pima Cotton Piqué Polo Shirt | Casual Menswear',
    seo_description: 'Premium Pima cotton polo shirt offering unmatched softness and smart styling.',
    status: 'active',
    is_popular: true,
    is_bestseller: false
  },
  {
    id: 'prod-selvedge-denim',
    name: 'Raw Indigo Slim Taper Selvedge Denim',
    bn_name: 'র ইন্ডিগো সেলভেজ ডেনিম জিন্স',
    slug: 'raw-indigo-slim-taper-selvedge-denim',
    sku: 'DNM-SLV-06',
    category_id: 'cat-denim',
    category_name: 'Denim Jeans',
    main_image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=700&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=700&q=80'
    ],
    short_description: 'Shuttle-loom woven 13.5 oz Japanese selvedge denim with signature red ticker ID along outer seam.',
    long_description: 'Unwashed raw indigo finish that moulds uniquely to your body contours, creating custom honeycomb and whisker fades over time.',
    buying_price: 950,
    selling_price: 1790,
    discount_price: 2190,
    stock: 40,
    rating: 4.9,
    review_count: 21,
    sizes: ['30', '32', '34', '36'],
    colors: [
      { name: 'Raw Deep Indigo', hex: '#0D1B2A' }
    ],
    fabric: '100% Ring-Spun Cotton Selvedge (13.5 oz)',
    fit: 'Slim Taper Leg',
    care_instructions: 'Wash inside out in cold water after 6 months for best contrast fades.',
    variants: [
      { id: 'v-slv-30', size: '30', color: 'Raw Deep Indigo', price: 1790, original_price: 2190, stock: 10, sku: 'DNM-SLV-30' },
      { id: 'v-slv-32', size: '32', color: 'Raw Deep Indigo', price: 1790, original_price: 2190, stock: 12, sku: 'DNM-SLV-32' },
      { id: 'v-slv-34', size: '34', color: 'Raw Deep Indigo', price: 1790, original_price: 2190, stock: 10, sku: 'DNM-SLV-34' },
      { id: 'v-slv-36', size: '36', color: 'Raw Deep Indigo', price: 1790, original_price: 2190, stock: 8, sku: 'DNM-SLV-36' }
    ],
    delivery_info: 'Express door delivery across all districts in Bangladesh.',
    seo_title: 'Raw Indigo Selvedge Denim Jeans | SHAD SODAI',
    seo_description: 'Authentic 13.5oz shuttle-loom selvedge denim jeans. Unwashed raw indigo with red line ID.',
    status: 'active',
    is_popular: false,
    is_bestseller: true
  }
];

export const INITIAL_PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'proc-1',
    title: 'FABRIC SELECTION',
    short_description: 'We source only premium long-staple combed cotton and durable denim mills.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    video_url: '',
    video_thumbnail: '',
    display_order: 1,
    status: 'active'
  },
  {
    id: 'proc-2',
    title: 'PRECISION PATTERN',
    short_description: 'Expertly patterned cuts calibrated for tailored movement and clean drape.',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    video_url: '',
    video_thumbnail: '',
    display_order: 2,
    status: 'active'
  },
  {
    id: 'proc-3',
    title: 'ARTISAN STITCHING',
    short_description: 'Reinforced twin-needle seams, premium YKK hardware, and durable construction.',
    image_url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
    video_url: '',
    video_thumbnail: '',
    display_order: 3,
    status: 'active'
  },
  {
    id: 'proc-4',
    title: 'QUALITY INSPECTION',
    short_description: 'Each piece undergoes strict measurement, colorfastness, and finish auditing.',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    video_url: '',
    video_thumbnail: '',
    display_order: 4,
    status: 'active'
  }
];

export const INITIAL_BANNERS: Banner[] = [];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    product_id: 'prod-heavy-tee',
    product_name: 'Heavyweight Premium Cotton Crewneck T-Shirt',
    customer_name: 'Asif Rahman',
    rating: 5,
    comment: 'The 240 GSM fabric weight is phenomenal. Thick, holds its shape after multiple washes, and the collar stays tight. Easily beats imported brand quality.',
    verified_purchase: true,
    status: 'approved',
    created_at: '2026-08-12'
  },
  {
    id: 'rev-2',
    product_id: 'prod-oxford-shirt',
    product_name: 'Slim-Fit Oxford Cotton Casual Button-Down Shirt',
    customer_name: 'Tanvir Hossain',
    rating: 5,
    comment: 'Great fit across the shoulders and chest. The Oxford texture is crisp yet comfortable in humid weather. Fast delivery inside Dhaka.',
    verified_purchase: true,
    status: 'approved',
    created_at: '2026-08-15'
  },
  {
    id: 'rev-3',
    product_id: 'prod-stretch-chino',
    product_name: 'Tailored Smart Stretch Chino Pants',
    customer_name: 'Mahmudul Hasan',
    rating: 5,
    comment: 'The stretch is just right for daily office wear and commuting. Size 32 fit true to measurement. Will be ordering the navy version soon.',
    verified_purchase: true,
    status: 'approved',
    created_at: '2026-08-20'
  }
];

export const DEFAULT_POLICY_PAGES: Record<PolicyPageSlug, PolicyPageContent> = {
  'terms-and-conditions': {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    subtitle: 'Official terms of service, apparel ordering guidelines, and usage conditions.',
    content: `1. General Overview
By accessing and placing an order on our store, you agree to abide by the terms and conditions set forth below. All apparel, sizing specifications, fabric descriptions, and pricing are maintained with strict accuracy.

2. Product Representation & Sizing
We make every effort to display fabric colors, weave textures, and garment measurements accurately. Customers are encouraged to review the size chart on each product page before selecting their size (S, M, L, XL, XXL).

3. Order Confirmation & Fulfillment
All orders placed through our website undergo verification prior to dispatch. We reserve the right to contact customers via phone or SMS to confirm delivery address and size selection before shipping.

4. Pricing & Availability
All prices are listed in Bangladeshi Taka (BDT ৳). In the rare event that an item or size variant goes out of stock after an order is placed, our support team will notify you immediately for an alternative selection or full refund.`,
    updated_at: '2026-08-01'
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'How we protect, store, and handle your personal and order information.',
    content: `1. Information We Collect
When you place an order or register an account, we collect your name, mobile phone number, delivery address, and optional email address solely to process and deliver your order.

2. Data Security & Confidentiality
Your personal information is strictly confidential. We never sell, rent, or share customer contact numbers or addresses with unauthorized third parties. Contact details are only shared with assigned courier partners to complete doorstep delivery.

3. Payment Security
For manual payments (bKash, Nagad, Rocket, Bank Transfer, or Card Transfer), we only record your sender reference number and Transaction ID (TrxID) for verification. We never ask for or store your PIN, OTP, CVV, or password.

4. Customer Account Control
You may view or update your saved profile, delivery address, and order history at any time through your Customer Account dashboard.`,
    updated_at: '2026-08-01'
  },
  'shipping-and-delivery': {
    slug: 'shipping-and-delivery',
    title: 'Shipping & Delivery Policy',
    subtitle: 'Fast, trackable nationwide courier delivery timelines and shipping charges.',
    content: `1. Delivery Timelines
• Inside Dhaka Metro: Delivered within 24 to 48 hours after order confirmation.
• Outside Dhaka (All Districts): Delivered within 2 to 4 business days via Steadfast, Pathao, or RedX courier.

2. Delivery Charges
Standard delivery charges inside and outside Dhaka are calculated automatically at checkout. Orders meeting our minimum free-shipping threshold qualify for complimentary delivery.

3. Order Tracking
Once your parcel is handed over to our courier partner, your order status is updated with a live tracking ID. You can track your shipment anytime from the Track Your Order page.

4. Parcel Inspection Upon Delivery
Customers are encouraged to check the outer packaging and verify garment size and quantity in front of the delivery rider upon receiving the parcel.`,
    updated_at: '2026-08-01'
  },
  'return-and-refund': {
    slug: 'return-and-refund',
    title: 'Return & Refund Policy',
    subtitle: 'Hassle-free 7-day size exchange, return eligibility, and refund processing.',
    content: `1. 7-Day Easy Size Exchange & Return
We offer a 7-day exchange and return window from the date of delivery if the garment size does not fit, or if there is any manufacturing defect or wrong item delivered.

2. Return Eligibility Conditions
• The garment must be unworn, unwashed, and in its original condition.
• Original brand hangtags, labels, and packaging must remain intact.
• Requests must be initiated within 7 days of receiving the parcel.

3. Instant Spot Return
If you notice a wrong size or defective item while the delivery rider is present, you can return the parcel immediately to the rider without paying any extra return fee.

4. Refund Processing
Approved refunds for prepaid orders (bKash, Nagad, Rocket, or Bank Transfer) are processed within 2 to 4 business days back to the original sender account.`,
    updated_at: '2026-08-01'
  },
  'payment-policy': {
    slug: 'payment-policy',
    title: 'Payment Policy',
    subtitle: 'Transparent guidelines for Cash on Delivery and verified manual payments.',
    content: `1. Accepted Payment Methods
We support Cash on Delivery (COD) nationwide as well as manual digital payments via bKash, Nagad, Rocket, Bank Transfer, and Manual Card Transfer as enabled at checkout.

2. Manual Payment Verification
When paying via bKash, Nagad, Rocket, or Bank Transfer, please send the exact payable amount to the official account number displayed at checkout and enter your Sender Number and Transaction ID (TrxID). You may also attach a payment screenshot for faster verification.

3. Payment Status Lifecycle
• Pending: Your order and TrxID have been submitted and are awaiting admin verification.
• Paid: Our billing team has verified your transaction against our account statement.

4. Security Reminder
Our team will never call or message you asking for your bKash/Nagad PIN, OTP code, or card CVV.`,
    updated_at: '2026-08-01'
  },
  'customer-rules': {
    slug: 'customer-rules',
    title: 'Customer Rules',
    subtitle: 'Community standards and guidelines for a smooth shopping experience.',
    content: `1. Accurate Contact & Address Details
Please provide an active mobile phone number and complete delivery address (including house, road, and area landmark) so our verification team and courier rider can reach you promptly.

2. Order Confirmation Etiquette
For first-time or high-value Cash on Delivery orders, our team may call to confirm your order prior to dispatch. Unconfirmed or unreachable orders may be held until verified.

3. Fair Exchange & Return Usage
Please keep original tags attached when trying on garments for fit checks. Items stained, washed, or altered after delivery cannot be accepted for exchange.

4. Genuine Transaction Submissions
When using manual payment methods, please submit accurate Transaction IDs. Repeated submission of invalid or fake TrxIDs may result in order cancellation.`,
    updated_at: '2026-08-01'
  },
  'report-an-issue': {
    slug: 'report-an-issue',
    title: 'Report an Issue',
    subtitle: 'Dedicated resolution channel for order, sizing, courier, or payment issues.',
    content: `1. How to Report an Issue
If you experience any issue with garment quality, size mismatch, delayed courier delivery, or payment verification, please submit the form below or contact our helpline directly.

2. Information to Include
To help us resolve your issue as quickly as possible, please include your Order Number (e.g. #SS-1001), the mobile number used during checkout, and a clear description of the issue.

3. Resolution Timeline
Our customer care team reviews all reported issues within 4 to 12 business hours and will contact you directly by phone or WhatsApp with a resolution.`,
    updated_at: '2026-08-01'
  }
};

export const INITIAL_SETTINGS: SiteSettings = {
  // Company & Identity
  store_name: 'SHAD SODAI',
  company_name: 'SHAD SODAI',
  store_logo: '',
  company_logo: '',

  // Taglines & Announcements
  announcement_text: 'Premium Clothing & Essentials • 7-Day Easy Exchange • Free Delivery on Orders Over ৳1500',
  footer_tagline: 'Premium Streetwear & Apparel • Trusted Since 2026',
  footer_description: 'Your premier destination for high-GSM combed compact cotton drop shoulder t-shirts, premium casual shirts, and tailored essentials in Bangladesh.',

  // Contact Information
  store_phone: '+880 1700-000000',
  contact_phone: '+880 1700-000000',
  store_email: 'support@shadsodai.com',
  contact_email: 'support@shadsodai.com',
  store_address: 'House 12, Road 4, Sector 7, Uttara, Dhaka, Bangladesh',
  contact_address: 'House 12, Road 4, Sector 7, Uttara, Dhaka, Bangladesh',
  support_email: 'help@shadsodai.com',
  support_phone: '+880 1711-000000',
  whatsapp_number: '+8801700000000',
  facebook_page_url: 'https://facebook.com/shadsodai',

  // Quality / Guarantee Section (Clothing & Fashion Business)
  guarantee_quality: 'Multi-stage garment inspection with premium stitch & fabric durability.',
  guarantee_authentic: '100% genuine high-GSM combed cotton & authentic tailored apparel.',
  guarantee_payments: 'Cash on Delivery, bKash, Nagad, Rocket & verified bank transfer.',
  guarantee_delivery: 'Fast 24-48h delivery inside Dhaka & 2-4 days nationwide courier.',
  guarantee_purity: 'Multi-stage garment inspection with premium stitch & fabric durability.',
  guarantee_certification: '100% genuine high-GSM combed cotton & authentic tailored apparel.',

  // Dynamic CMS Policy Pages
  policy_pages: DEFAULT_POLICY_PAGES,

  // Copyright Section
  copyright_text: '© 2026 SHAD SODAI. All Rights Reserved.',
  footer_bottom_line_1: 'Combed Compact Cotton',
  footer_bottom_line_2: 'Tailored Streetwear Fit',
  footer_bottom_line_3: 'Crafted with ❤️ for modern lifestyle',

  // Mobile App Download
  app_download_enabled: false,
  app_download_button_text: 'Download Our App',
  app_android_url: 'https://play.google.com/store/apps',
  app_ios_url: 'https://apps.apple.com',

  // Delivery Rates & Supabase
  delivery_inside_dhaka: 60,
  delivery_outside_dhaka: 120,
  free_delivery_min_order: 1500,
  supabase_connected: false
};

export const INITIAL_QUICK_LINKS: QuickLinkItem[] = [
  {
    id: 'ql-home',
    title: 'Home',
    slug: 'home',
    type: 'quick_link',
    url: '/',
    is_active: true,
    display_order: 1,
    sections: [],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ql-shop',
    title: 'Shop All Products',
    slug: 'shop-all-products',
    type: 'quick_link',
    url: '/shop',
    is_active: true,
    display_order: 2,
    sections: [],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ql-categories',
    title: 'All Categories',
    slug: 'all-categories',
    type: 'quick_link',
    url: '/categories',
    is_active: true,
    display_order: 3,
    sections: [],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ql-contact',
    title: 'Contact Us',
    slug: 'contact-us',
    type: 'quick_link',
    url: '/contact',
    is_active: true,
    display_order: 4,
    sections: [],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ql-support',
    title: 'Support & Help Center',
    slug: 'support-help-center',
    type: 'quick_link',
    url: '/support',
    is_active: true,
    display_order: 5,
    sections: [],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ql-track',
    title: 'Track Your Order',
    slug: 'track-your-order',
    type: 'quick_link',
    url: '/track-order',
    is_active: true,
    display_order: 6,
    sections: [],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ql-terms',
    title: 'Terms & Conditions',
    page_title: 'TERMS & CONDITIONS',
    short_description: 'Official terms of service, apparel ordering guidelines, and usage conditions.',
    slug: 'terms-and-conditions',
    type: 'policy',
    url: '/terms-and-conditions',
    is_active: true,
    display_order: 7,
    sections: [
      {
        id: 'sec-terms-1',
        quick_link_id: 'ql-terms',
        section_number: 1,
        heading: 'General Overview',
        content: 'By accessing and placing an order on our store, you agree to abide by the terms and conditions set forth below. All apparel, sizing specifications, fabric descriptions, and pricing are maintained with strict accuracy.',
        bullet_points: [],
        display_order: 1,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-terms-2',
        quick_link_id: 'ql-terms',
        section_number: 2,
        heading: 'Product Representation & Sizing',
        content: 'We make every effort to display fabric colors, weave textures, and garment measurements accurately. Customers are encouraged to review the size chart on each product page before selecting their size (S, M, L, XL, XXL).',
        bullet_points: [],
        display_order: 2,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-terms-3',
        quick_link_id: 'ql-terms',
        section_number: 3,
        heading: 'Order Confirmation & Fulfillment',
        content: 'All orders placed through our website undergo verification prior to dispatch. We reserve the right to contact customers via phone or SMS to confirm delivery address and size selection before shipping.',
        bullet_points: [],
        display_order: 3,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-terms-4',
        quick_link_id: 'ql-terms',
        section_number: 4,
        heading: 'Pricing & Availability',
        content: 'All prices are listed in Bangladeshi Taka (BDT ৳). In the rare event that an item or size variant goes out of stock after an order is placed, our support team will notify you immediately for an alternative selection or full refund.',
        bullet_points: [],
        display_order: 4,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      }
    ],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ql-privacy',
    title: 'Privacy Policy',
    page_title: 'PRIVACY POLICY',
    short_description: 'How we protect, store, and handle your personal and order information.',
    slug: 'privacy-policy',
    type: 'policy',
    url: '/privacy-policy',
    is_active: true,
    display_order: 8,
    sections: [
      {
        id: 'sec-privacy-1',
        quick_link_id: 'ql-privacy',
        section_number: 1,
        heading: 'Information We Collect',
        content: 'When you place an order or register an account, we collect your name, mobile phone number, delivery address, and optional email address solely to process and deliver your order.',
        bullet_points: [],
        display_order: 1,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-privacy-2',
        quick_link_id: 'ql-privacy',
        section_number: 2,
        heading: 'Data Security & Confidentiality',
        content: 'Your personal information is strictly confidential. We never sell, rent, or share customer contact numbers or addresses with unauthorized third parties. Contact details are only shared with assigned courier partners to complete doorstep delivery.',
        bullet_points: [],
        display_order: 2,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-privacy-3',
        quick_link_id: 'ql-privacy',
        section_number: 3,
        heading: 'Payment Security',
        content: 'For manual payments (bKash, Nagad, Rocket, Bank Transfer, or Card Transfer), we only record your sender reference number and Transaction ID (TrxID) for verification. We never ask for or store your PIN, OTP, CVV, or password.',
        bullet_points: [],
        display_order: 3,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-privacy-4',
        quick_link_id: 'ql-privacy',
        section_number: 4,
        heading: 'Customer Account Control',
        content: 'You may view or update your saved profile, delivery address, and order history at any time through your Customer Account dashboard.',
        bullet_points: [],
        display_order: 4,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      }
    ],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ql-shipping',
    title: 'Shipping & Delivery Policy',
    page_title: 'SHIPPING & DELIVERY POLICY',
    short_description: 'Fast, trackable nationwide courier delivery timelines and shipping charges.',
    slug: 'shipping-and-delivery',
    type: 'policy',
    url: '/shipping-and-delivery',
    is_active: true,
    display_order: 9,
    sections: [
      {
        id: 'sec-ship-1',
        quick_link_id: 'ql-shipping',
        section_number: 1,
        heading: 'Delivery Timelines',
        content: '',
        bullet_points: [
          'Inside Dhaka Metro: Delivered within 24 to 48 hours after order confirmation.',
          'Outside Dhaka (All Districts): Delivered within 2 to 4 business days via Steadfast, Pathao, or RedX courier.'
        ],
        display_order: 1,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-ship-2',
        quick_link_id: 'ql-shipping',
        section_number: 2,
        heading: 'Delivery Charges',
        content: 'Standard delivery charges inside and outside Dhaka are calculated automatically at checkout. Orders meeting our minimum free-shipping threshold qualify for complimentary delivery.',
        bullet_points: [],
        display_order: 2,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-ship-3',
        quick_link_id: 'ql-shipping',
        section_number: 3,
        heading: 'Order Tracking',
        content: 'Once your parcel is handed over to our courier partner, your order status is updated with a live tracking ID. You can track your shipment anytime from the Track Your Order page.',
        bullet_points: [],
        display_order: 3,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-ship-4',
        quick_link_id: 'ql-shipping',
        section_number: 4,
        heading: 'Parcel Inspection Upon Delivery',
        content: 'Customers are encouraged to check the outer packaging and verify garment size and quantity in front of the delivery rider upon receiving the parcel.',
        bullet_points: [],
        display_order: 4,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      }
    ],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ql-return',
    title: 'Return & Refund Policy',
    page_title: 'RETURN & REFUND POLICY',
    short_description: 'Hassle-free 7-day size exchange, return eligibility, and refund processing.',
    slug: 'return-and-refund',
    type: 'policy',
    url: '/return-and-refund',
    is_active: true,
    display_order: 10,
    sections: [
      {
        id: 'sec-return-1',
        quick_link_id: 'ql-return',
        section_number: 1,
        heading: '7-Day Easy Size Exchange & Return',
        content: 'We offer a 7-day exchange and return window from the date of delivery if the garment size does not fit, or if there is any manufacturing defect or wrong item delivered.',
        bullet_points: [],
        display_order: 1,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-return-2',
        quick_link_id: 'ql-return',
        section_number: 2,
        heading: 'Return Eligibility Conditions',
        content: '',
        bullet_points: [
          'The garment must be unworn, unwashed, and in its original condition.',
          'Original brand hangtags, labels, and packaging must remain intact.',
          'Requests must be initiated within 7 days of receiving the parcel.'
        ],
        display_order: 2,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-return-3',
        quick_link_id: 'ql-return',
        section_number: 3,
        heading: 'Instant Spot Return',
        content: 'If you notice a wrong size or defective item while the delivery rider is present, you can return the parcel immediately to the rider without paying any extra return fee.',
        bullet_points: [],
        display_order: 3,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-return-4',
        quick_link_id: 'ql-return',
        section_number: 4,
        heading: 'Refund Processing',
        content: 'Approved refunds for prepaid orders (bKash, Nagad, Rocket, or Bank Transfer) are processed within 2 to 4 business days back to the original sender account.',
        bullet_points: [],
        display_order: 4,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      }
    ],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ql-payment',
    title: 'Payment Policy',
    page_title: 'PAYMENT POLICY',
    short_description: 'Transparent guidelines for Cash on Delivery and verified manual payments.',
    slug: 'payment-policy',
    type: 'policy',
    url: '/payment-policy',
    is_active: true,
    display_order: 11,
    sections: [
      {
        id: 'sec-pay-1',
        quick_link_id: 'ql-payment',
        section_number: 1,
        heading: 'Accepted Payment Methods',
        content: 'We support Cash on Delivery (COD) nationwide as well as manual digital payments via bKash, Nagad, Rocket, Bank Transfer, and Manual Card Transfer as enabled at checkout.',
        bullet_points: [],
        display_order: 1,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-pay-2',
        quick_link_id: 'ql-payment',
        section_number: 2,
        heading: 'Manual Payment Verification',
        content: 'When paying via bKash, Nagad, Rocket, or Bank Transfer, please send the exact payable amount to the official account number displayed at checkout and enter your Sender Number and Transaction ID (TrxID). You may also attach a payment screenshot for faster verification.',
        bullet_points: [],
        display_order: 2,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-pay-3',
        quick_link_id: 'ql-payment',
        section_number: 3,
        heading: 'Payment Status Lifecycle',
        content: '',
        bullet_points: [
          'Pending: Your order and TrxID have been submitted and are awaiting admin verification.',
          'Paid: Our billing team has verified your transaction against our account statement.'
        ],
        display_order: 3,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-pay-4',
        quick_link_id: 'ql-payment',
        section_number: 4,
        heading: 'Security Reminder',
        content: 'Our team will never call or message you asking for your bKash/Nagad PIN, OTP code, or card CVV.',
        bullet_points: [],
        display_order: 4,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      }
    ],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ql-rules',
    title: 'Customer Rules',
    page_title: 'CUSTOMER RULES',
    short_description: 'Community standards and guidelines for a smooth shopping experience.',
    slug: 'customer-rules',
    type: 'policy',
    url: '/customer-rules',
    is_active: true,
    display_order: 12,
    sections: [
      {
        id: 'sec-rules-1',
        quick_link_id: 'ql-rules',
        section_number: 1,
        heading: 'Accurate Contact & Address Details',
        content: 'Please provide an active mobile phone number and complete delivery address (including house, road, and area landmark) so our verification team and courier rider can reach you promptly.',
        bullet_points: [],
        display_order: 1,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-rules-2',
        quick_link_id: 'ql-rules',
        section_number: 2,
        heading: 'Order Confirmation Etiquette',
        content: 'For first-time or high-value Cash on Delivery orders, our team may call to confirm your order prior to dispatch. Unconfirmed or unreachable orders may be held until verified.',
        bullet_points: [],
        display_order: 2,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-rules-3',
        quick_link_id: 'ql-rules',
        section_number: 3,
        heading: 'Fair Exchange & Return Usage',
        content: 'Please keep original tags attached when trying on garments for fit checks. Items stained, washed, or altered after delivery cannot be accepted for exchange.',
        bullet_points: [],
        display_order: 3,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-rules-4',
        quick_link_id: 'ql-rules',
        section_number: 4,
        heading: 'Genuine Transaction Submissions',
        content: 'When using manual payment methods, please submit accurate Transaction IDs. Repeated submission of invalid or fake TrxIDs may result in order cancellation.',
        bullet_points: [],
        display_order: 4,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      }
    ],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ql-report',
    title: 'Report an Issue',
    page_title: 'REPORT AN ISSUE',
    short_description: 'Dedicated resolution channel for order, sizing, courier, or payment issues.',
    slug: 'report-an-issue',
    type: 'policy',
    url: '/report-an-issue',
    is_active: true,
    display_order: 13,
    sections: [
      {
        id: 'sec-report-1',
        quick_link_id: 'ql-report',
        section_number: 1,
        heading: 'How to Report an Issue',
        content: 'If you experience any issue with garment quality, size mismatch, delayed courier delivery, or payment verification, please submit the form below or contact our helpline directly.',
        bullet_points: [],
        display_order: 1,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-report-2',
        quick_link_id: 'ql-report',
        section_number: 2,
        heading: 'Information to Include',
        content: 'To help us resolve your issue as quickly as possible, please include your Order Number (e.g. #SS-1001), the mobile number used during checkout, and a clear description of the issue.',
        bullet_points: [],
        display_order: 2,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      },
      {
        id: 'sec-report-3',
        quick_link_id: 'ql-report',
        section_number: 3,
        heading: 'Resolution Timeline',
        content: 'Our customer care team reviews all reported issues within 4 to 12 business hours and will contact you directly by phone or WhatsApp with a resolution.',
        bullet_points: [],
        display_order: 3,
        is_active: true,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
      }
    ],
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  }
];
