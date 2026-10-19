import { Category, Product, Brand, Banner, Review, SiteSettings, ProcessStep, PolicyPageSlug, PolicyPageContent, QuickLinkItem } from '../types';

export const INITIAL_BRANDS: Brand[] = [];

export const INITIAL_CATEGORIES: Category[] = [];

// No static/demo product data — products are loaded strictly from the database
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PROCESS_STEPS: ProcessStep[] = [];

export const INITIAL_BANNERS: Banner[] = [];

export const INITIAL_REVIEWS: Review[] = [];

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
