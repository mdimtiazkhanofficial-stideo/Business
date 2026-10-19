import express from 'express';
import { createServer as createViteServer } from 'vite';
import mysql, { Pool, RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================================================
// HOSTINGER MYSQL CONNECTION POOL CONFIGURATION
// Supports MYSQL_* or DB_* environment variables from Hostinger hPanel
// ============================================================================
const MYSQL_HOST = (process.env.MYSQL_HOST || process.env.DB_HOST || '').trim();
const MYSQL_PORT = Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306);
const MYSQL_USER = (process.env.MYSQL_USER || process.env.DB_USER || '').trim();
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '';
const MYSQL_DATABASE = (process.env.MYSQL_DATABASE || process.env.DB_NAME || '').trim();
const MYSQL_SSL = (process.env.MYSQL_SSL || 'false').toLowerCase() === 'true';

const isMySQLConfigured = Boolean(
  MYSQL_HOST &&
    MYSQL_HOST !== 'srv1234.hstgr.io' &&
    MYSQL_USER &&
    MYSQL_USER !== 'u123456789_shadsodai' &&
    MYSQL_DATABASE &&
    MYSQL_DATABASE !== 'u123456789_ecommerce'
);

let mysqlPool: Pool | null = null;
let isMySQLConnected = false;
let mysqlStatusMessage = 'Hostinger MySQL not yet configured in .env — using persistent server database (/data)';

async function initMySQLPool(): Promise<void> {
  if (!isMySQLConfigured) {
    return;
  }
  try {
    mysqlPool = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      ssl: MYSQL_SSL ? { rejectUnauthorized: false } : undefined
    });

    const conn = await mysqlPool.getConnection();
    try {
      await conn.query('SELECT 1');
      isMySQLConnected = true;
      mysqlStatusMessage = `Connected to Hostinger MySQL (${MYSQL_HOST}/${MYSQL_DATABASE})`;
      console.log(`[MySQL] ${mysqlStatusMessage}`);

      // Automatically ensure all tables exist from database/hostinger_mysql_schema.sql
      const schemaPath = path.resolve('database/hostinger_mysql_schema.sql');
      if (fs.existsSync(schemaPath)) {
        const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
        const statements = sqlContent
          .split(/;\s*\n/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith('--'));
        for (const stmt of statements) {
          try {
            await conn.query(stmt);
          } catch (stmtErr: any) {
            console.warn('[MySQL Schema Notice]:', stmtErr?.message || stmtErr);
          }
        }
      }
    } finally {
      conn.release();
    }
  } catch (err: any) {
    isMySQLConnected = false;
    mysqlStatusMessage = `Hostinger MySQL connection error: ${err?.message || 'Unable to connect'}`;
    console.warn('[MySQL] Fallback to persistent server store:', mysqlStatusMessage);
  }
}

function safeJsonParse<T>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val as T;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

// ============================================================================
// PERSISTENT SERVER-SIDE STORAGE IN /data (Used alongside or as fallback to MySQL)
// ============================================================================
const DATA_DIR = path.resolve('data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const CONFIG_FILE = path.join(DATA_DIR, 'payment_config.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const BRANDS_FILE = path.join(DATA_DIR, 'brands.json');
const BANNERS_FILE = path.join(DATA_DIR, 'banners.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const SUPPORT_MESSAGES_FILE = path.join(DATA_DIR, 'support_messages.json');
const PROCESS_STEPS_FILE = path.join(DATA_DIR, 'process_steps.json');
const PAYMENT_METHODS_FILE = path.join(DATA_DIR, 'payment_methods.json');
const PAYMENT_RECORDS_FILE = path.join(DATA_DIR, 'payment_records.json');
const QUICK_LINKS_FILE = path.join(DATA_DIR, 'quick_links.json');
const STOCK_HISTORY_FILE = path.join(DATA_DIR, 'stock_history.json');
const CALCULATIONS_FILE = path.join(DATA_DIR, 'calculations.json');
const SITE_SETTINGS_FILE = path.join(DATA_DIR, 'site_settings.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOADS_DIR));

const DEMO_PRODUCT_IDS = new Set([
  'prod-heavy-tee',
  'prod-oxford-shirt',
  'prod-stretch-chino',
  'prod-denim-jacket',
  'prod-pima-polo',
  'prod-selvedge-denim',
  'prod-1',
  'prod-2',
  'prod-3',
  'prod-4',
  'prod-5',
  'prod-6',
  'prod-7',
  'prod-8',
  'prod-9',
  'prod-10'
]);

const DEMO_CATEGORY_IDS = new Set([
  'cat-tshirts',
  'cat-shirts',
  'cat-pants',
  'cat-denim',
  'cat-jackets',
  'cat-co-ord',
  'cat-panjabi',
  'cat-polo',
  'cat-hoodies'
]);

const DEMO_BANNER_IDS = new Set(['ban-1', 'ban-2', 'ban-3']);

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// ============================================================================
// LEGACY PAYMENT GATEWAY ENDPOINTS (/api/payments/*)
// ============================================================================
const defaultPaymentConfig = {
  settings: {
    currency: 'BDT',
    environment: 'sandbox',
    min_order_amount: 10,
    max_order_amount: 200000,
    auto_cancel_minutes: 60,
    notify_email: 'mdimtiazkhan.official@gmail.com'
  },
  methods: {
    bkash: {
      id: 'bkash',
      name: 'bKash',
      category: 'mobile_banking',
      is_active: true,
      environment: 'sandbox',
      app_key: process.env.BKASH_APP_KEY || 'PLACEHOLDER_BKASH_APP_KEY',
      app_secret: process.env.BKASH_APP_SECRET || 'PLACEHOLDER_BKASH_APP_SECRET',
      username: process.env.BKASH_USERNAME || 'PLACEHOLDER_BKASH_USERNAME',
      password: process.env.BKASH_PASSWORD || 'PLACEHOLDER_BKASH_PASSWORD',
      merchant_number: process.env.BKASH_MERCHANT_NUMBER || '01700-000000',
      callback_url: '/api/payments/callback/bkash'
    },
    nagad: {
      id: 'nagad',
      name: 'Nagad',
      category: 'mobile_banking',
      is_active: true,
      environment: 'sandbox',
      merchant_id: process.env.NAGAD_MERCHANT_ID || 'PLACEHOLDER_NAGAD_MERCHANT_ID',
      merchant_private_key: process.env.NAGAD_PRIVATE_KEY || 'PLACEHOLDER_NAGAD_PRIVATE_KEY',
      nagad_public_key: process.env.NAGAD_PUBLIC_KEY || 'PLACEHOLDER_NAGAD_PUBLIC_KEY',
      account_number: process.env.NAGAD_ACCOUNT_NUMBER || '01700-000000',
      callback_url: '/api/payments/callback/nagad'
    },
    rocket: {
      id: 'rocket',
      name: 'Rocket',
      category: 'mobile_banking',
      is_active: true,
      environment: 'sandbox',
      biller_id: process.env.ROCKET_BILLER_ID || 'PLACEHOLDER_ROCKET_BILLER_ID',
      merchant_account: process.env.ROCKET_MERCHANT_ACCOUNT || '017000000009',
      terminal_id: process.env.ROCKET_TERMINAL_ID || 'PLACEHOLDER_ROCKET_TERMINAL_ID',
      api_key: process.env.ROCKET_API_KEY || 'PLACEHOLDER_ROCKET_API_KEY',
      callback_url: '/api/payments/callback/rocket'
    },
    card: {
      id: 'card',
      name: 'Bank Card (Visa / Mastercard)',
      category: 'card_payment',
      is_active: true,
      environment: 'sandbox',
      gateway_provider: 'sslcommerz',
      store_id: process.env.CARD_STORE_ID || 'PLACEHOLDER_STORE_ID',
      store_password: process.env.CARD_STORE_PASS || 'PLACEHOLDER_STORE_PASSWORD',
      supported_brands: ['Visa', 'Mastercard', 'AMEX', 'Nexus'],
      enforce_3d_secure: true,
      callback_url: '/api/payments/callback/card'
    },
    cod: {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      category: 'cash',
      is_active: true,
      environment: 'live',
      instructions: 'Pay directly in cash when receiving products from courier'
    }
  }
};

function getStoredConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return { ...defaultPaymentConfig, ...data, methods: { ...defaultPaymentConfig.methods, ...data.methods } };
    }
  } catch (err) {
    console.error('Error reading config file:', err);
  }
  return defaultPaymentConfig;
}

function saveStoredConfig(config: any) {
  writeJsonFile(CONFIG_FILE, config);
}

function getStoredPayments(): any[] {
  return readJsonFile<any[]>(PAYMENTS_FILE, []);
}

function saveStoredPayments(payments: any[]) {
  writeJsonFile(PAYMENTS_FILE, payments);
}

function maskSecret(val?: string) {
  if (!val || val.startsWith('PLACEHOLDER_') || val.length <= 4) return val || '';
  return val.slice(0, 2) + '••••••••' + val.slice(-4);
}

app.get('/api/payments/methods', (_req, res) => {
  const config = getStoredConfig();
  const activeMethods = Object.values(config.methods)
    .filter((m: any) => m.is_active)
    .map((m: any) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      is_active: m.is_active,
      environment: m.environment,
      supported_brands: m.supported_brands || [],
      instructions: m.instructions || ''
    }));
  res.json({ success: true, methods: activeMethods });
});

app.get('/api/payments/config', (_req, res) => {
  const config = getStoredConfig();
  const safeConfig = JSON.parse(JSON.stringify(config));
  if (safeConfig.methods.bkash) {
    safeConfig.methods.bkash.app_secret = maskSecret(safeConfig.methods.bkash.app_secret);
    safeConfig.methods.bkash.password = maskSecret(safeConfig.methods.bkash.password);
  }
  if (safeConfig.methods.nagad) {
    safeConfig.methods.nagad.merchant_private_key = maskSecret(safeConfig.methods.nagad.merchant_private_key);
  }
  if (safeConfig.methods.rocket) {
    safeConfig.methods.rocket.api_key = maskSecret(safeConfig.methods.rocket.api_key);
  }
  if (safeConfig.methods.card) {
    safeConfig.methods.card.store_password = maskSecret(safeConfig.methods.card.store_password);
  }
  res.json({ success: true, config: safeConfig });
});

app.post('/api/payments/config', (req, res) => {
  try {
    const currentConfig = getStoredConfig();
    const newConfig = req.body;
    if (newConfig.methods) {
      for (const [key, method] of Object.entries(newConfig.methods as Record<string, any>)) {
        if (!currentConfig.methods[key]) {
          currentConfig.methods[key] = method;
          continue;
        }
        for (const [prop, val] of Object.entries(method)) {
          if (typeof val === 'string' && val.includes('••••')) continue;
          currentConfig.methods[key][prop] = val;
        }
      }
    }
    if (newConfig.settings) {
      currentConfig.settings = { ...currentConfig.settings, ...newConfig.settings };
    }
    saveStoredConfig(currentConfig);
    res.json({ success: true, message: 'Payment configuration saved successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update config' });
  }
});

app.get('/api/payments/transactions', (req, res) => {
  const payments = getStoredPayments();
  const { status, method, search } = req.query;
  let filtered = [...payments];
  if (status && status !== 'all') filtered = filtered.filter((p) => p.status === status);
  if (method && method !== 'all') filtered = filtered.filter((p) => p.payment_method === method);
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.transaction_id?.toLowerCase().includes(q) ||
        p.order_id?.toLowerCase().includes(q) ||
        p.customer_name?.toLowerCase().includes(q) ||
        p.customer_phone?.toLowerCase().includes(q) ||
        p.customer_email?.toLowerCase().includes(q)
    );
  }
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ success: true, transactions: filtered });
});

app.post('/api/payments/initiate', (req, res) => {
  try {
    const { order_id, order_number, customer_id, customer_name, customer_phone, customer_email, payment_method, amount } = req.body;
    if (!order_id || !payment_method || amount === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required order or payment details' });
    }
    const config = getStoredConfig();
    const methodConfig = config.methods[payment_method];
    if (!methodConfig || !methodConfig.is_active) {
      return res.status(400).json({ success: false, error: `Payment method ${payment_method} is currently inactive` });
    }
    const transactionId = `TRX-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const paymentRecord = {
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order_id,
      order_number: order_number || order_id,
      customer_id: customer_id || '',
      customer_name: customer_name || 'Customer',
      customer_phone: customer_phone || '',
      customer_email: customer_email || '',
      payment_method,
      gateway: methodConfig.category === 'mobile_banking' ? `${payment_method}_merchant` : methodConfig.gateway_provider || 'gateway',
      transaction_id: transactionId,
      amount: Number(amount),
      currency: config.settings.currency || 'BDT',
      status: 'pending',
      gateway_response: {
        initiated_at: now,
        mode: methodConfig.environment || 'sandbox',
        credentials_status: 'placeholder_or_configured',
        note: 'Payment session created server-side. Awaiting verification/callback.'
      },
      paid_at: null,
      created_at: now,
      updated_at: now
    };
    const payments = getStoredPayments();
    payments.unshift(paymentRecord);
    saveStoredPayments(payments);
    res.json({
      success: true,
      transaction_id: transactionId,
      payment: paymentRecord,
      instructions: methodConfig.instructions || `Please authorize payment of ৳${amount} via ${methodConfig.name}.`,
      is_placeholder_mode: true
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to initiate payment' });
  }
});

app.post('/api/payments/verify', (req, res) => {
  try {
    const { transaction_id, order_id, action } = req.body;
    const payments = getStoredPayments();
    const idx = payments.findIndex((p) => p.transaction_id === transaction_id || p.order_id === order_id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Transaction record not found' });
    const payment = payments[idx];
    const now = new Date().toISOString();
    if (action === 'mark_paid') {
      payment.status = 'paid';
      payment.paid_at = now;
      payment.updated_at = now;
    } else if (action === 'mark_failed') {
      payment.status = 'failed';
      payment.updated_at = now;
    } else if (action === 'cancel') {
      payment.status = 'cancelled';
      payment.updated_at = now;
    } else if (action === 'refund') {
      payment.status = 'refunded';
      payment.updated_at = now;
    } else {
      payment.updated_at = now;
    }
    payments[idx] = payment;
    saveStoredPayments(payments);
    res.json({
      success: true,
      status: payment.status,
      payment,
      message: `Transaction ${payment.transaction_id} status is ${payment.status}`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Verification failed' });
  }
});

app.all('/api/payments/callback/:gateway', (req, res) => {
  try {
    const { gateway } = req.params;
    const payload = { ...(req.query || {}), ...(req.body || {}) };
    const transactionId = payload.trx_id || payload.tran_id || payload.payment_id || payload.transaction_id;
    const orderId = payload.order_id || payload.orderNumber || payload.value_a;
    const status = payload.status || payload.sp_code || (payload.val_id ? 'VALID' : 'PENDING');
    const payments = getStoredPayments();
    const idx = payments.findIndex(
      (p) => (transactionId && p.transaction_id === transactionId) || (orderId && p.order_id === orderId)
    );
    if (idx !== -1) {
      const payment = payments[idx];
      const now = new Date().toISOString();
      if (status === 'COMPLETED' || status === 'VALID' || status === 'SUCCESS' || status === '0000') {
        payment.status = 'paid';
        payment.paid_at = now;
      } else if (status === 'FAILED' || status === 'FAIL') {
        payment.status = 'failed';
      } else if (status === 'CANCELLED' || status === 'CANCEL') {
        payment.status = 'cancelled';
      }
      payment.updated_at = now;
      payments[idx] = payment;
      saveStoredPayments(payments);
    }
    res.json({ success: true, received: true, gateway, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// HOSTINGER MYSQL REST API ENDPOINTS (/api/db/*)
// Complete CRUD for Categories, Brands, Products, Variants, Banners, Orders,
// Order Items, Reviews, Customers, Support, Payments, Quick Links & Settings
// ============================================================================

// 0. Database Connection Status
app.get('/api/db/status', async (_req, res) => {
  if (mysqlPool && isMySQLConnected) {
    try {
      const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM products');
      const count = rows?.[0]?.count ?? 0;
      return res.json({
        success: true,
        connected: true,
        engine: 'hostinger-mysql',
        host: MYSQL_HOST,
        database: MYSQL_DATABASE,
        message: `Connected to Hostinger MySQL (${MYSQL_DATABASE})! Found ${count} products.`
      });
    } catch (err: any) {
      isMySQLConnected = false;
      mysqlStatusMessage = err?.message || 'MySQL query failed';
    }
  }
  const localProds = readJsonFile<any[]>(PRODUCTS_FILE, []);
  res.json({
    success: true,
    connected: true,
    engine: isMySQLConfigured ? 'mysql-fallback' : 'server-backend',
    host: MYSQL_HOST || 'localhost',
    database: MYSQL_DATABASE || 'shadsodai_mysql',
    message: isMySQLConnected
      ? mysqlStatusMessage
      : `Backend Database Active (${localProds.length} products). Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE in .env for direct Hostinger MySQL.`
  });
});

// 1. Categories CRUD
app.get('/api/db/categories', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [rows] = await mysqlPool.query<RowDataPacket[]>(
        'SELECT * FROM categories ORDER BY display_order ASC, created_at DESC'
      );
      const mapped = rows.map((r) => ({
        ...r,
        display_order: Number(r.display_order) || 0,
        is_active: Boolean(r.is_active),
        show_on_homepage: Boolean(r.show_on_homepage)
      }));
      return res.json({ success: true, categories: mapped });
    }
  } catch (err) {
    console.warn('[MySQL GET categories fallback]:', err);
  }
  const raw = readJsonFile<any[]>(CATEGORIES_FILE, []);
  const clean = raw.filter((c) => c && c.id && !DEMO_CATEGORY_IDS.has(c.id));
  if (clean.length !== raw.length) writeJsonFile(CATEGORIES_FILE, clean);
  clean.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  res.json({ success: true, categories: clean });
});

app.post('/api/db/categories', async (req, res) => {
  try {
    const category = req.body;
    if (!category || !category.id || !category.name) {
      return res.status(400).json({ success: false, error: 'Category id and name are required' });
    }
    const now = new Date().toISOString();
    const slug = category.slug || String(category.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const record = {
      ...category,
      id: category.id,
      name: category.name,
      bn_name: category.bn_name || category.name,
      slug,
      description: category.description || '',
      image: category.image || '',
      banner_image: category.banner_image || null,
      cover_photo: category.cover_photo || category.banner_image || null,
      display_order: Number(category.display_order) || 0,
      is_active: category.is_active !== false,
      show_on_homepage: category.show_on_homepage !== false,
      created_at: category.created_at || now,
      updated_at: now
    };

    const categories = readJsonFile<any[]>(CATEGORIES_FILE, []).filter((c) => c && c.id && !DEMO_CATEGORY_IDS.has(c.id));
    const idx = categories.findIndex((c) => c.id === record.id);
    if (idx >= 0) categories[idx] = record;
    else categories.push(record);
    writeJsonFile(CATEGORIES_FILE, categories);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO categories (id, name, bn_name, slug, description, image, banner_image, cover_photo, display_order, is_active, show_on_homepage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           bn_name = VALUES(bn_name),
           slug = VALUES(slug),
           description = VALUES(description),
           image = VALUES(image),
           banner_image = VALUES(banner_image),
           cover_photo = VALUES(cover_photo),
           display_order = VALUES(display_order),
           is_active = VALUES(is_active),
           show_on_homepage = VALUES(show_on_homepage)`,
        [
          record.id,
          record.name,
          record.bn_name,
          record.slug,
          record.description,
          record.image,
          record.banner_image,
          record.cover_photo,
          record.display_order,
          record.is_active ? 1 : 0,
          record.show_on_homepage ? 1 : 0
        ]
      );
    }

    res.json({ success: true, category: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/db/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const categories = readJsonFile<any[]>(CATEGORIES_FILE, []);
    writeJsonFile(
      CATEGORIES_FILE,
      categories.filter((c) => c.id !== id)
    );
    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query('DELETE FROM categories WHERE id = ?', [id]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Brands CRUD
app.get('/api/db/brands', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM brands ORDER BY name ASC');
      const mapped = rows.map((r) => ({ ...r, is_active: Boolean(r.is_active) }));
      return res.json({ success: true, brands: mapped });
    }
  } catch (err) {
    console.warn('[MySQL GET brands fallback]:', err);
  }
  const brands = readJsonFile<any[]>(BRANDS_FILE, []).filter((b) => b && b.id !== 'brand-shadsodai');
  res.json({ success: true, brands });
});

app.post('/api/db/brands', async (req, res) => {
  try {
    const brand = req.body;
    if (!brand || !brand.name) {
      return res.status(400).json({ success: false, error: 'Brand name is required' });
    }
    const now = new Date().toISOString();
    const slug = brand.slug || String(brand.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const id = brand.id || `brand-${slug}`;
    const brands = readJsonFile<any[]>(BRANDS_FILE, []);
    const idx = brands.findIndex((b) => b.id === id || b.slug === slug);
    const record = {
      id,
      name: String(brand.name).trim(),
      slug,
      logo_url: brand.logo_url || '',
      description: brand.description || '',
      is_active: brand.is_active !== false,
      created_at: brand.created_at || (idx >= 0 ? brands[idx].created_at : now) || now,
      updated_at: now
    };
    if (idx >= 0) brands[idx] = record;
    else brands.push(record);
    writeJsonFile(BRANDS_FILE, brands);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO brands (id, name, slug, logo_url, description, is_active)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           slug = VALUES(slug),
           logo_url = VALUES(logo_url),
           description = VALUES(description),
           is_active = VALUES(is_active)`,
        [record.id, record.name, record.slug, record.logo_url, record.description, record.is_active ? 1 : 0]
      );
    }

    res.json({ success: true, brand: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/db/brands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const brands = readJsonFile<any[]>(BRANDS_FILE, []);
    writeJsonFile(
      BRANDS_FILE,
      brands.filter((b) => b.id !== id)
    );
    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query('DELETE FROM brands WHERE id = ?', [id]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Products & Product Variants CRUD
function mapMySQLProductRow(row: any, variants: any[]): any {
  const sizeVariants = safeJsonParse<any[]>(row.size_variants, []);
  return {
    ...row,
    buying_price: Number(row.buying_price) || 0,
    selling_price: Number(row.selling_price) || 0,
    discount_price: row.discount_price !== null && row.discount_price !== undefined ? Number(row.discount_price) : undefined,
    original_price: row.original_price !== null && row.original_price !== undefined ? Number(row.original_price) : undefined,
    stock: Number(row.stock) || 0,
    rating: Number(row.rating) || 5.0,
    review_count: Number(row.review_count) || 0,
    sale_count: Number(row.sale_count) || 0,
    gallery_images: safeJsonParse<string[]>(row.gallery_images, []),
    sizes: safeJsonParse<string[]>(row.sizes, []),
    colors: safeJsonParse<any[]>(row.colors, []),
    size_chart: safeJsonParse<any[]>(row.size_chart, []),
    tags: safeJsonParse<string[]>(row.tags, []),
    size_variants: sizeVariants,
    sizeVariants: sizeVariants,
    nutrition: safeJsonParse<Record<string, string>>(row.nutrition, {}),
    benefits: safeJsonParse<string[]>(row.benefits, []),
    is_featured: Boolean(row.is_featured),
    is_popular: Boolean(row.is_popular),
    is_bestseller: Boolean(row.is_bestseller),
    is_combo: Boolean(row.is_combo),
    variants: variants.map((v) => ({
      ...v,
      price: Number(v.price) || 0,
      original_price: v.original_price !== null && v.original_price !== undefined ? Number(v.original_price) : undefined,
      stock: Number(v.stock) || 0
    }))
  };
}

app.get('/api/db/products', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [prodRows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM products ORDER BY created_at DESC');
      const [varRows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM product_variants');
      const varsByProd = new Map<string, any[]>();
      for (const v of varRows) {
        const list = varsByProd.get(v.product_id) || [];
        list.push(v);
        varsByProd.set(v.product_id, list);
      }
      const mapped = prodRows.map((p) => mapMySQLProductRow(p, varsByProd.get(p.id) || []));
      return res.json({ success: true, products: mapped });
    }
  } catch (err) {
    console.warn('[MySQL GET products fallback]:', err);
  }
  const rawProducts = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const cleanProducts = rawProducts.filter((p) => p && p.id && !DEMO_PRODUCT_IDS.has(p.id));
  if (cleanProducts.length !== rawProducts.length) {
    writeJsonFile(PRODUCTS_FILE, cleanProducts);
  }
  res.json({ success: true, products: cleanProducts });
});

app.post('/api/db/products', async (req, res) => {
  try {
    const product = req.body;
    if (!product || !product.id || !product.name) {
      return res.status(400).json({ success: false, error: 'Product id and name are required' });
    }
    const now = new Date().toISOString();
    const products = readJsonFile<any[]>(PRODUCTS_FILE, []).filter((p) => p && p.id && !DEMO_PRODUCT_IDS.has(p.id));
    const existingIdx = products.findIndex((p) => p.id === product.id);
    const createdAt = product.created_at || (existingIdx >= 0 ? products[existingIdx].created_at : now) || now;
    const slug = product.slug || `${String(product.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${product.id.slice(-4)}`;
    const sizeVariants = product.size_variants || product.sizeVariants || [];

    const record = {
      ...product,
      slug,
      bn_name: product.bn_name || product.name,
      brand: product.brand || 'SHAD SODAI',
      main_image: product.main_image || '',
      gallery_images: Array.isArray(product.gallery_images) ? product.gallery_images : [],
      buying_price: Number(product.buying_price) || 0,
      selling_price: Number(product.selling_price ?? product.price) || 0,
      discount_price: product.discount_price ? Number(product.discount_price) : undefined,
      original_price: product.original_price ? Number(product.original_price) : undefined,
      stock: Number(product.stock) || 0,
      rating: Number(product.rating) || 5.0,
      review_count: Number(product.review_count) || 0,
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      size_chart: Array.isArray(product.size_chart) ? product.size_chart : [],
      tags: Array.isArray(product.tags) ? product.tags : [],
      size_variants: sizeVariants,
      sizeVariants: sizeVariants,
      variants: Array.isArray(product.variants) ? product.variants : [],
      status: product.status || 'active',
      is_featured: Boolean(product.is_featured),
      is_popular: Boolean(product.is_popular),
      is_bestseller: Boolean(product.is_bestseller),
      is_combo: Boolean(product.is_combo),
      created_at: createdAt,
      updated_at: now
    };

    if (existingIdx >= 0) products[existingIdx] = record;
    else products.unshift(record);
    writeJsonFile(PRODUCTS_FILE, products);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO products (
          id, name, bn_name, slug, sku, category_id, category_name, brand_id, brand,
          main_image, gallery_images, short_description, long_description,
          buying_price, selling_price, discount_price, original_price, stock,
          rating, review_count, sizes, colors, fabric, material, fit, pattern,
          sleeve, neck_collar, gender, season, origin, care_instructions,
          exchange_policy, size_chart, tags, size_variants, ingredients,
          nutrition, benefits, how_to_use, storage_instructions, delivery_info,
          seo_title, seo_description, status, is_featured, is_popular, is_bestseller, is_combo
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?
        )
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          bn_name = VALUES(bn_name),
          slug = VALUES(slug),
          sku = VALUES(sku),
          category_id = VALUES(category_id),
          category_name = VALUES(category_name),
          brand_id = VALUES(brand_id),
          brand = VALUES(brand),
          main_image = VALUES(main_image),
          gallery_images = VALUES(gallery_images),
          short_description = VALUES(short_description),
          long_description = VALUES(long_description),
          buying_price = VALUES(buying_price),
          selling_price = VALUES(selling_price),
          discount_price = VALUES(discount_price),
          original_price = VALUES(original_price),
          stock = VALUES(stock),
          rating = VALUES(rating),
          review_count = VALUES(review_count),
          sizes = VALUES(sizes),
          colors = VALUES(colors),
          fabric = VALUES(fabric),
          material = VALUES(material),
          fit = VALUES(fit),
          pattern = VALUES(pattern),
          sleeve = VALUES(sleeve),
          neck_collar = VALUES(neck_collar),
          gender = VALUES(gender),
          season = VALUES(season),
          origin = VALUES(origin),
          care_instructions = VALUES(care_instructions),
          exchange_policy = VALUES(exchange_policy),
          size_chart = VALUES(size_chart),
          tags = VALUES(tags),
          size_variants = VALUES(size_variants),
          ingredients = VALUES(ingredients),
          nutrition = VALUES(nutrition),
          benefits = VALUES(benefits),
          how_to_use = VALUES(how_to_use),
          storage_instructions = VALUES(storage_instructions),
          delivery_info = VALUES(delivery_info),
          seo_title = VALUES(seo_title),
          seo_description = VALUES(seo_description),
          status = VALUES(status),
          is_featured = VALUES(is_featured),
          is_popular = VALUES(is_popular),
          is_bestseller = VALUES(is_bestseller),
          is_combo = VALUES(is_combo)`,
        [
          record.id,
          record.name,
          record.bn_name,
          record.slug,
          record.sku || null,
          record.category_id || null,
          record.category_name || null,
          record.brand_id || null,
          record.brand,
          record.main_image,
          JSON.stringify(record.gallery_images || []),
          record.short_description || null,
          record.long_description || null,
          record.buying_price,
          record.selling_price,
          record.discount_price ?? null,
          record.original_price ?? null,
          record.stock,
          record.rating,
          record.review_count,
          JSON.stringify(record.sizes || []),
          JSON.stringify(record.colors || []),
          record.fabric || null,
          record.material || null,
          record.fit || null,
          record.pattern || null,
          record.sleeve || null,
          record.neck_collar || null,
          record.gender || null,
          record.season || null,
          record.origin || null,
          record.care_instructions || null,
          record.exchange_policy || null,
          JSON.stringify(record.size_chart || []),
          JSON.stringify(record.tags || []),
          JSON.stringify(record.size_variants || []),
          record.ingredients || null,
          JSON.stringify(record.nutrition || {}),
          JSON.stringify(record.benefits || []),
          record.how_to_use || null,
          record.storage_instructions || null,
          record.delivery_info || null,
          record.seo_title || record.name,
          record.seo_description || record.short_description || null,
          record.status,
          record.is_featured ? 1 : 0,
          record.is_popular ? 1 : 0,
          record.is_bestseller ? 1 : 0,
          record.is_combo ? 1 : 0
        ]
      );

      // Sync product_variants in MySQL
      await mysqlPool.query('DELETE FROM product_variants WHERE product_id = ?', [record.id]);
      if (Array.isArray(record.variants) && record.variants.length > 0) {
        for (let idx = 0; idx < record.variants.length; idx++) {
          const v = record.variants[idx];
          const label = v.weight || [v.size, v.color].filter(Boolean).join(' / ') || 'Standard';
          const varId = v.id || `var-${record.id}-${idx}`;
          await mysqlPool.query(
            `INSERT INTO product_variants (id, product_id, weight, size, color, color_code, image, price, original_price, stock, sku)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              varId,
              record.id,
              label,
              v.size || null,
              v.color || null,
              v.color_code || null,
              v.image || record.main_image || null,
              Number(v.price) || record.selling_price || 0,
              v.original_price ? Number(v.original_price) : record.discount_price ?? null,
              Number(v.stock ?? record.stock ?? 10),
              v.sku || `${record.sku || record.id}-${idx + 1}`
            ]
          );
        }
      }
    }

    res.json({ success: true, product: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/db/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
    writeJsonFile(
      PRODUCTS_FILE,
      products.filter((p) => p.id !== id && !DEMO_PRODUCT_IDS.has(p.id))
    );
    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query('DELETE FROM product_variants WHERE product_id = ?', [id]);
      await mysqlPool.query('DELETE FROM products WHERE id = ?', [id]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Banners CRUD
app.get('/api/db/banners', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [rows] = await mysqlPool.query<RowDataPacket[]>(
        'SELECT * FROM banners ORDER BY display_order ASC, created_at DESC'
      );
      const mapped = rows.map((r) => ({
        ...r,
        display_order: Number(r.display_order) || 0,
        is_active: Boolean(r.is_active),
        homepage_enabled: Boolean(r.homepage_enabled)
      }));
      return res.json({ success: true, banners: mapped });
    }
  } catch (err) {
    console.warn('[MySQL GET banners fallback]:', err);
  }
  const raw = readJsonFile<any[]>(BANNERS_FILE, []);
  const clean = raw.filter((b) => b && b.id && !DEMO_BANNER_IDS.has(b.id));
  if (clean.length !== raw.length) writeJsonFile(BANNERS_FILE, clean);
  res.json({ success: true, banners: clean });
});

app.post('/api/db/banners', async (req, res) => {
  try {
    const banner = req.body;
    if (!banner || !banner.id || !banner.image_url) {
      return res.status(400).json({ success: false, error: 'Banner id and image_url are required' });
    }
    const now = new Date().toISOString();
    const record = {
      ...banner,
      id: banner.id,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      button_text: banner.button_text || 'SHOP NOW',
      button_link: banner.button_link || '#shop',
      image_url: banner.image_url,
      type: banner.type || 'hero',
      is_active: banner.is_active !== false,
      homepage_enabled: banner.homepage_enabled !== false,
      product_id: banner.product_id || null,
      display_order: Number(banner.display_order) || 0,
      created_at: banner.created_at || now
    };

    const banners = readJsonFile<any[]>(BANNERS_FILE, []).filter((b) => b && b.id && !DEMO_BANNER_IDS.has(b.id));
    const idx = banners.findIndex((b) => b.id === record.id);
    if (idx >= 0) banners[idx] = record;
    else banners.push(record);
    writeJsonFile(BANNERS_FILE, banners);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO banners (id, title, subtitle, button_text, button_link, image_url, type, is_active, homepage_enabled, product_id, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           subtitle = VALUES(subtitle),
           button_text = VALUES(button_text),
           button_link = VALUES(button_link),
           image_url = VALUES(image_url),
           type = VALUES(type),
           is_active = VALUES(is_active),
           homepage_enabled = VALUES(homepage_enabled),
           product_id = VALUES(product_id),
           display_order = VALUES(display_order)`,
        [
          record.id,
          record.title,
          record.subtitle,
          record.button_text,
          record.button_link,
          record.image_url,
          record.type,
          record.is_active ? 1 : 0,
          record.homepage_enabled ? 1 : 0,
          record.product_id,
          record.display_order
        ]
      );
    }

    res.json({ success: true, banner: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/db/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const banners = readJsonFile<any[]>(BANNERS_FILE, []);
    writeJsonFile(
      BANNERS_FILE,
      banners.filter((b) => b.id !== id)
    );
    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query('DELETE FROM banners WHERE id = ?', [id]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Orders & Order Items CRUD
app.get('/api/db/orders', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [ordRows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM orders ORDER BY created_at DESC');
      const [itemRows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM order_items');
      const itemsByOrder = new Map<string, any[]>();
      for (const it of itemRows) {
        const list = itemsByOrder.get(it.order_id) || [];
        list.push({
          ...it,
          id: String(it.id),
          quantity: Number(it.quantity) || 1,
          unit_price: Number(it.unit_price) || 0,
          total_price: Number(it.total_price) || 0
        });
        itemsByOrder.set(it.order_id, list);
      }
      const mapped = ordRows.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal) || 0,
        delivery_charge: Number(o.delivery_charge) || 0,
        discount: Number(o.discount) || 0,
        total: Number(o.total) || 0,
        total_amount: Number(o.total_amount ?? o.total) || 0,
        is_incomplete: Boolean(o.is_incomplete),
        items: itemsByOrder.get(o.id) || []
      }));
      return res.json({ success: true, orders: mapped });
    }
  } catch (err) {
    console.warn('[MySQL GET orders fallback]:', err);
  }
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  res.json({ success: true, orders });
});

app.post('/api/db/orders', async (req, res) => {
  try {
    const order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ success: false, error: 'Order id is required' });
    }
    const now = new Date().toISOString();
    const record = {
      ...order,
      subtotal: Number(order.subtotal) || 0,
      delivery_charge: Number(order.delivery_charge) || 0,
      discount: Number(order.discount) || 0,
      total: Number(order.total) || 0,
      total_amount: Number(order.total_amount ?? order.total) || 0,
      payment_method: order.payment_method || 'cod',
      payment_status: order.payment_status || 'pending',
      order_status: order.order_status || 'pending',
      items: Array.isArray(order.items) ? order.items : [],
      created_at: order.created_at || now
    };

    const orders = readJsonFile<any[]>(ORDERS_FILE, []);
    const idx = orders.findIndex((o) => o.id === record.id);
    if (idx >= 0) orders[idx] = record;
    else orders.unshift(record);
    writeJsonFile(ORDERS_FILE, orders);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO orders (
          id, order_number, user_id, customer_name, customer_email, customer_phone,
          customer_address, customer_city, order_notes, subtotal, delivery_charge,
          discount, total, total_amount, payment_method, payment_status, order_status,
          courier_name, tracking_id, shipment_status, shipment_date,
          transaction_id, sender_phone, payment_proof, is_incomplete, bill_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          customer_name = VALUES(customer_name),
          customer_email = VALUES(customer_email),
          customer_phone = VALUES(customer_phone),
          customer_address = VALUES(customer_address),
          customer_city = VALUES(customer_city),
          order_notes = VALUES(order_notes),
          subtotal = VALUES(subtotal),
          delivery_charge = VALUES(delivery_charge),
          discount = VALUES(discount),
          total = VALUES(total),
          total_amount = VALUES(total_amount),
          payment_method = VALUES(payment_method),
          payment_status = VALUES(payment_status),
          order_status = VALUES(order_status),
          courier_name = VALUES(courier_name),
          tracking_id = VALUES(tracking_id),
          shipment_status = VALUES(shipment_status),
          shipment_date = VALUES(shipment_date),
          transaction_id = VALUES(transaction_id),
          sender_phone = VALUES(sender_phone),
          payment_proof = VALUES(payment_proof),
          is_incomplete = VALUES(is_incomplete),
          bill_id = VALUES(bill_id)`,
        [
          record.id,
          record.order_number,
          record.user_id || null,
          record.customer_name,
          record.customer_email || null,
          record.customer_phone,
          record.customer_address,
          record.customer_city || 'Dhaka',
          record.order_notes || null,
          record.subtotal,
          record.delivery_charge,
          record.discount,
          record.total,
          record.total_amount,
          record.payment_method,
          record.payment_status,
          record.order_status,
          record.courier_name || null,
          record.tracking_id || null,
          record.shipment_status || null,
          record.shipment_date || null,
          record.transaction_id || null,
          record.sender_phone || null,
          record.payment_proof || null,
          record.is_incomplete ? 1 : 0,
          record.bill_id || null
        ]
      );

      await mysqlPool.query('DELETE FROM order_items WHERE order_id = ?', [record.id]);
      for (const it of record.items) {
        await mysqlPool.query(
          `INSERT INTO order_items (order_id, product_id, product_name, variant_weight, variant_size, variant_color, quantity, unit_price, total_price, image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record.id,
            it.product_id || null,
            it.product_name || 'Product',
            it.variant_weight || [it.variant_size, it.variant_color].filter(Boolean).join(' / ') || 'Standard',
            it.variant_size || null,
            it.variant_color || null,
            Number(it.quantity) || 1,
            Number(it.unit_price) || 0,
            Number(it.total_price) || (Number(it.unit_price) || 0) * (Number(it.quantity) || 1),
            it.image || null
          ]
        );
      }
    }

    res.json({ success: true, order: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/db/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const orders = readJsonFile<any[]>(ORDERS_FILE, []);
    const idx = orders.findIndex((o) => o.id === id);
    if (idx >= 0) {
      orders[idx] = { ...orders[idx], ...updates };
      writeJsonFile(ORDERS_FILE, orders);
    }

    if (mysqlPool && isMySQLConnected) {
      const target = idx >= 0 ? orders[idx] : updates;
      if (updates.order_status && Object.keys(updates).length === 1) {
        await mysqlPool.query('UPDATE orders SET order_status = ? WHERE id = ?', [updates.order_status, id]);
      } else {
        await mysqlPool.query(
          `UPDATE orders SET
            customer_name = COALESCE(?, customer_name),
            customer_phone = COALESCE(?, customer_phone),
            customer_address = COALESCE(?, customer_address),
            customer_city = COALESCE(?, customer_city),
            order_notes = ?,
            subtotal = COALESCE(?, subtotal),
            delivery_charge = COALESCE(?, delivery_charge),
            discount = COALESCE(?, discount),
            total = COALESCE(?, total),
            payment_method = COALESCE(?, payment_method),
            payment_status = COALESCE(?, payment_status),
            order_status = COALESCE(?, order_status),
            courier_name = ?,
            tracking_id = ?,
            shipment_status = ?,
            shipment_date = ?,
            transaction_id = ?,
            sender_phone = ?,
            payment_proof = ?
           WHERE id = ?`,
          [
            target.customer_name ?? null,
            target.customer_phone ?? null,
            target.customer_address ?? null,
            target.customer_city ?? null,
            target.order_notes ?? null,
            target.subtotal ?? null,
            target.delivery_charge ?? null,
            target.discount ?? null,
            target.total ?? null,
            target.payment_method ?? null,
            target.payment_status ?? null,
            target.order_status ?? null,
            target.courier_name ?? null,
            target.tracking_id ?? null,
            target.shipment_status ?? null,
            target.shipment_date ?? null,
            target.transaction_id ?? null,
            target.sender_phone ?? null,
            target.payment_proof ?? null,
            id
          ]
        );
      }
    }

    res.json({ success: true, order: idx >= 0 ? orders[idx] : updates });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/db/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orders = readJsonFile<any[]>(ORDERS_FILE, []);
    writeJsonFile(
      ORDERS_FILE,
      orders.filter((o) => o.id !== id)
    );
    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query('DELETE FROM order_items WHERE order_id = ?', [id]);
      await mysqlPool.query('DELETE FROM orders WHERE id = ?', [id]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Reviews CRUD
app.get('/api/db/reviews', async (req, res) => {
  const { status, productId } = req.query;
  try {
    if (mysqlPool && isMySQLConnected) {
      let sql = 'SELECT * FROM reviews WHERE 1=1';
      const params: any[] = [];
      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      if (productId) {
        sql += ' AND product_id = ?';
        params.push(productId);
      }
      sql += ' ORDER BY created_at DESC';
      const [rows] = await mysqlPool.query<RowDataPacket[]>(sql, params);
      const mapped = rows.map((r) => ({
        ...r,
        rating: Number(r.rating) || 5,
        verified_purchase: Boolean(r.verified_purchase)
      }));
      return res.json({ success: true, reviews: mapped });
    }
  } catch (err) {
    console.warn('[MySQL GET reviews fallback]:', err);
  }
  let reviews = readJsonFile<any[]>(REVIEWS_FILE, []).filter(
    (r) => r && r.id && !['rev-1', 'rev-2', 'rev-3'].includes(r.id)
  );
  if (status) reviews = reviews.filter((r) => r.status === status);
  if (productId) reviews = reviews.filter((r) => r.product_id === productId);
  res.json({ success: true, reviews });
});

app.post('/api/db/reviews', async (req, res) => {
  try {
    const review = req.body;
    const reviews = readJsonFile<any[]>(REVIEWS_FILE, []);
    const record = {
      ...review,
      id: review.id || `rev-${Date.now()}`,
      rating: Number(review.rating) || 5,
      verified_purchase: review.verified_purchase !== false,
      status: review.status || 'approved',
      created_at: review.created_at || new Date().toISOString()
    };
    reviews.unshift(record);
    writeJsonFile(REVIEWS_FILE, reviews);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO reviews (id, product_id, product_name, customer_name, rating, comment, verified_purchase, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), comment = VALUES(comment), rating = VALUES(rating)`,
        [
          record.id,
          record.product_id || null,
          record.product_name || null,
          record.customer_name,
          record.rating,
          record.comment,
          record.verified_purchase ? 1 : 0,
          record.status
        ]
      );
    }
    res.json({ success: true, review: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/db/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const reviews = readJsonFile<any[]>(REVIEWS_FILE, []);
    const updated = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    writeJsonFile(REVIEWS_FILE, updated);
    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/db/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = readJsonFile<any[]>(REVIEWS_FILE, []);
    writeJsonFile(
      REVIEWS_FILE,
      reviews.filter((r) => r.id !== id)
    );
    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query('DELETE FROM reviews WHERE id = ?', [id]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Customers & Auth CRUD
app.get('/api/db/customers', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM customers ORDER BY created_at DESC');
      return res.json({ success: true, customers: rows });
    }
  } catch (err) {
    console.warn('[MySQL GET customers fallback]:', err);
  }
  const customers = readJsonFile<any[]>(CUSTOMERS_FILE, []);
  res.json({ success: true, customers });
});

app.post('/api/db/customers', async (req, res) => {
  try {
    const cust = req.body;
    if (!cust || !cust.id) return res.status(400).json({ success: false, error: 'Customer id required' });
    const customers = readJsonFile<any[]>(CUSTOMERS_FILE, []);
    const idx = customers.findIndex((c) => c.id === cust.id || (cust.email && c.email === cust.email));
    const record = {
      ...cust,
      created_at: cust.created_at || new Date().toISOString()
    };
    if (idx >= 0) customers[idx] = { ...customers[idx], ...record };
    else customers.push(record);
    writeJsonFile(CUSTOMERS_FILE, customers);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO customers (id, name, email, phone, password_hash, address, city, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           email = VALUES(email),
           phone = VALUES(phone),
           address = VALUES(address),
           city = VALUES(city),
           role = VALUES(role)`,
        [
          record.id,
          record.name || 'Customer',
          record.email || null,
          record.phone || null,
          record.password || null,
          record.address || '',
          record.city || 'Dhaka',
          record.role || 'customer'
        ]
      );
    }
    res.json({ success: true, customer: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Support Messages CRUD
app.get('/api/db/support-messages', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM support_messages ORDER BY created_at DESC');
      return res.json({ success: true, messages: rows });
    }
  } catch (err) {
    console.warn('[MySQL GET support_messages fallback]:', err);
  }
  const messages = readJsonFile<any[]>(SUPPORT_MESSAGES_FILE, []).filter((m) => m && m.id !== 'msg-1');
  res.json({ success: true, messages });
});

app.post('/api/db/support-messages', async (req, res) => {
  try {
    const msg = req.body;
    const messages = readJsonFile<any[]>(SUPPORT_MESSAGES_FILE, []);
    const record = {
      ...msg,
      id: msg.id || `msg-${Date.now()}`,
      status: msg.status || 'new',
      created_at: msg.created_at || new Date().toISOString()
    };
    messages.unshift(record);
    writeJsonFile(SUPPORT_MESSAGES_FILE, messages);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO support_messages (id, user_id, customer_name, customer_email, customer_phone, subject, message, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          record.user_id || null,
          record.customer_name,
          record.customer_email,
          record.customer_phone || null,
          record.subject,
          record.message,
          record.status
        ]
      );
    }
    res.json({ success: true, message: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/db/support-messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const messages = readJsonFile<any[]>(SUPPORT_MESSAGES_FILE, []);
    writeJsonFile(
      SUPPORT_MESSAGES_FILE,
      messages.map((m) => (m.id === id ? { ...m, status } : m))
    );
    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query('UPDATE support_messages SET status = ? WHERE id = ?', [status, id]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Process Steps CRUD
app.get('/api/db/process-steps', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM process_steps ORDER BY display_order ASC');
      return res.json({ success: true, steps: rows });
    }
  } catch (err) {
    console.warn('[MySQL GET process_steps fallback]:', err);
  }
  const steps = readJsonFile<any[]>(PROCESS_STEPS_FILE, []);
  res.json({ success: true, steps });
});

app.post('/api/db/process-steps', async (req, res) => {
  try {
    const step = req.body;
    const steps = readJsonFile<any[]>(PROCESS_STEPS_FILE, []);
    const idx = steps.findIndex((s) => s.id === step.id);
    if (idx >= 0) steps[idx] = step;
    else steps.push(step);
    writeJsonFile(PROCESS_STEPS_FILE, steps);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO process_steps (id, title, short_description, image_url, video_url, video_thumbnail, display_order, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           short_description = VALUES(short_description),
           image_url = VALUES(image_url),
           video_url = VALUES(video_url),
           video_thumbnail = VALUES(video_thumbnail),
           display_order = VALUES(display_order),
           status = VALUES(status)`,
        [
          step.id,
          step.title,
          step.short_description,
          step.image_url,
          step.video_url || null,
          step.video_thumbnail || null,
          Number(step.display_order) || 0,
          step.status || 'active'
        ]
      );
    }
    res.json({ success: true, step });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/db/process-steps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const steps = readJsonFile<any[]>(PROCESS_STEPS_FILE, []);
    writeJsonFile(
      PROCESS_STEPS_FILE,
      steps.filter((s) => s.id !== id)
    );
    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query('DELETE FROM process_steps WHERE id = ?', [id]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Payment Methods & Payment Records CRUD
app.get('/api/db/payment-methods', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM payment_methods ORDER BY display_order ASC');
      const mapped = rows.map((r) => ({
        ...r,
        is_enabled: Boolean(r.is_enabled),
        display_order: Number(r.display_order) || 1
      }));
      return res.json({ success: true, methods: mapped });
    }
  } catch (err) {
    console.warn('[MySQL GET payment_methods fallback]:', err);
  }
  const methods = readJsonFile<any[]>(PAYMENT_METHODS_FILE, []);
  res.json({ success: true, methods });
});

app.post('/api/db/payment-methods', async (req, res) => {
  try {
    const config = req.body;
    const methods = readJsonFile<any[]>(PAYMENT_METHODS_FILE, []);
    const idx = methods.findIndex((m) => m.id === config.id || m.method === config.method);
    if (idx >= 0) methods[idx] = config;
    else methods.push(config);
    writeJsonFile(PAYMENT_METHODS_FILE, methods);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO payment_methods (id, method, title, category, account_type, account_number, account_name, bank_name, branch_name, routing_number, instructions, logo_url, is_enabled, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           category = VALUES(category),
           account_type = VALUES(account_type),
           account_number = VALUES(account_number),
           account_name = VALUES(account_name),
           bank_name = VALUES(bank_name),
           branch_name = VALUES(branch_name),
           routing_number = VALUES(routing_number),
           instructions = VALUES(instructions),
           logo_url = VALUES(logo_url),
           is_enabled = VALUES(is_enabled),
           display_order = VALUES(display_order)`,
        [
          config.id,
          config.method,
          config.title,
          config.category || null,
          config.account_type || null,
          config.account_number || '',
          config.account_name || null,
          config.bank_name || null,
          config.branch_name || null,
          config.routing_number || null,
          config.instructions || '',
          config.logo_url || null,
          config.is_enabled ? 1 : 0,
          Number(config.display_order) || 1
        ]
      );
    }
    res.json({ success: true, method: config });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/db/payment-records', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM payment_records ORDER BY created_at DESC');
      const mapped = rows.map((r) => ({ ...r, amount: Number(r.amount) || 0 }));
      return res.json({ success: true, records: mapped });
    }
  } catch (err) {
    console.warn('[MySQL GET payment_records fallback]:', err);
  }
  const records = readJsonFile<any[]>(PAYMENT_RECORDS_FILE, []);
  res.json({ success: true, records });
});

app.post('/api/db/payment-records', async (req, res) => {
  try {
    const rec = req.body;
    const records = readJsonFile<any[]>(PAYMENT_RECORDS_FILE, []);
    const idx = records.findIndex((r) => r.id === rec.id);
    if (idx >= 0) records[idx] = rec;
    else records.unshift(rec);
    writeJsonFile(PAYMENT_RECORDS_FILE, records);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO payment_records (id, order_id, order_number, customer_id, customer_name, customer_phone, payment_method, account_type, account_number, amount, transaction_id, sender_phone, payment_proof, status, admin_note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           status = VALUES(status),
           admin_note = VALUES(admin_note),
           transaction_id = VALUES(transaction_id)`,
        [
          rec.id,
          rec.order_id || null,
          rec.order_number || null,
          rec.customer_id || null,
          rec.customer_name || null,
          rec.customer_phone || null,
          rec.payment_method || null,
          rec.account_type || null,
          rec.account_number || null,
          Number(rec.amount) || 0,
          rec.transaction_id || null,
          rec.sender_phone || null,
          rec.payment_proof || null,
          rec.status || 'PENDING',
          rec.admin_note || null
        ]
      );
    }
    res.json({ success: true, record: rec });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/db/payment-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const records = readJsonFile<any[]>(PAYMENT_RECORDS_FILE, []);
    const idx = records.findIndex((r) => r.id === id);
    if (idx >= 0) {
      records[idx] = { ...records[idx], ...updates };
      writeJsonFile(PAYMENT_RECORDS_FILE, records);
    }
    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        'UPDATE payment_records SET status = COALESCE(?, status), admin_note = COALESCE(?, admin_note) WHERE id = ?',
        [updates.status ?? null, updates.admin_note ?? null, id]
      );
      if (updates.order_id && updates.order_payment_status) {
        await mysqlPool.query('UPDATE orders SET payment_status = ? WHERE id = ?', [
          updates.order_payment_status,
          updates.order_id
        ]);
      }
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Quick Links & Policy Sections CRUD
app.get('/api/db/quick-links', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [linkRows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM quick_links ORDER BY display_order ASC');
      const [secRows] = await mysqlPool.query<RowDataPacket[]>(
        'SELECT * FROM quick_link_sections ORDER BY display_order ASC'
      );
      const secsByLink = new Map<string, any[]>();
      for (const s of secRows) {
        const list = secsByLink.get(s.quick_link_id) || [];
        list.push({
          ...s,
          section_number: Number(s.section_number) || 1,
          display_order: Number(s.display_order) || 1,
          is_active: Boolean(s.is_active),
          bullet_points: safeJsonParse<string[]>(s.bullet_points, [])
        });
        secsByLink.set(s.quick_link_id, list);
      }
      const mapped = linkRows.map((l) => ({
        ...l,
        is_active: Boolean(l.is_active),
        display_order: Number(l.display_order) || 0,
        sections: secsByLink.get(l.id) || []
      }));
      return res.json({ success: true, links: mapped });
    }
  } catch (err) {
    console.warn('[MySQL GET quick_links fallback]:', err);
  }
  const links = readJsonFile<any[]>(QUICK_LINKS_FILE, []);
  res.json({ success: true, links });
});

app.post('/api/db/quick-links', async (req, res) => {
  try {
    const link = req.body;
    const links = readJsonFile<any[]>(QUICK_LINKS_FILE, []);
    const idx = links.findIndex((l) => l.id === link.id);
    if (idx >= 0) links[idx] = link;
    else links.push(link);
    writeJsonFile(QUICK_LINKS_FILE, links);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO quick_links (id, title, page_title, short_description, slug, type, url, is_active, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           page_title = VALUES(page_title),
           short_description = VALUES(short_description),
           slug = VALUES(slug),
           type = VALUES(type),
           url = VALUES(url),
           is_active = VALUES(is_active),
           display_order = VALUES(display_order)`,
        [
          link.id,
          link.title,
          link.page_title || null,
          link.short_description || null,
          link.slug,
          link.type || 'quick',
          link.url,
          link.is_active !== false ? 1 : 0,
          Number(link.display_order) || 0
        ]
      );

      await mysqlPool.query('DELETE FROM quick_link_sections WHERE quick_link_id = ?', [link.id]);
      if (Array.isArray(link.sections)) {
        for (const s of link.sections) {
          await mysqlPool.query(
            `INSERT INTO quick_link_sections (id, quick_link_id, section_number, heading, content, bullet_points, display_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              s.id,
              link.id,
              Number(s.section_number) || 1,
              s.heading || '',
              s.content || '',
              JSON.stringify(Array.isArray(s.bullet_points) ? s.bullet_points : []),
              Number(s.display_order) || 1,
              s.is_active !== false ? 1 : 0
            ]
          );
        }
      }
    }
    res.json({ success: true, link });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/db/quick-links', async (req, res) => {
  try {
    const list = Array.isArray(req.body?.links) ? req.body.links : [];
    writeJsonFile(QUICK_LINKS_FILE, list);
    if (mysqlPool && isMySQLConnected) {
      for (const link of list) {
        await mysqlPool.query(
          `INSERT INTO quick_links (id, title, page_title, short_description, slug, type, url, is_active, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             title = VALUES(title),
             is_active = VALUES(is_active),
             display_order = VALUES(display_order)`,
          [
            link.id,
            link.title,
            link.page_title || null,
            link.short_description || null,
            link.slug,
            link.type || 'quick',
            link.url,
            link.is_active !== false ? 1 : 0,
            Number(link.display_order) || 0
          ]
        );
      }
    }
    res.json({ success: true, links: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Stock History & Calculations CRUD
app.get('/api/db/stock-history', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM stock_history ORDER BY created_at DESC');
      return res.json({ success: true, history: rows });
    }
  } catch (err) {
    console.warn('[MySQL GET stock_history fallback]:', err);
  }
  const history = readJsonFile<any[]>(STOCK_HISTORY_FILE, []);
  res.json({ success: true, history });
});

app.post('/api/db/stock-history', async (req, res) => {
  try {
    const record = req.body;
    const history = readJsonFile<any[]>(STOCK_HISTORY_FILE, []);
    history.unshift(record);
    writeJsonFile(STOCK_HISTORY_FILE, history);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO stock_history (id, product_id, product_name, sku, type, quantity_changed, previous_stock, new_stock, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          record.product_id,
          record.product_name,
          record.sku || null,
          record.type || 'manual_adjustment',
          Number(record.quantity_changed) || 0,
          Number(record.previous_stock) || 0,
          Number(record.new_stock) || 0,
          record.reason || ''
        ]
      );
    }
    res.json({ success: true, record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/db/calculations', async (_req, res) => {
  try {
    if (mysqlPool && isMySQLConnected) {
      const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM calculations ORDER BY created_at DESC');
      const mapped = rows.map((r) => safeJsonParse(r.payload, r));
      return res.json({ success: true, calculations: mapped });
    }
  } catch (err) {
    console.warn('[MySQL GET calculations fallback]:', err);
  }
  const calculations = readJsonFile<any[]>(CALCULATIONS_FILE, []);
  res.json({ success: true, calculations });
});

app.post('/api/db/calculations', async (req, res) => {
  try {
    const calc = req.body;
    const list = readJsonFile<any[]>(CALCULATIONS_FILE, []);
    const idx = list.findIndex((c) => c.id === calc.id);
    if (idx >= 0) list[idx] = calc;
    else list.unshift(calc);
    writeJsonFile(CALCULATIONS_FILE, list);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO calculations (id, title, payload) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), payload = VALUES(payload)`,
        [calc.id, calc.title || calc.product_name || 'Calculation', JSON.stringify(calc)]
      );
    }
    res.json({ success: true, calculation: calc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/db/calculations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const list = readJsonFile<any[]>(CALCULATIONS_FILE, []);
    writeJsonFile(
      CALCULATIONS_FILE,
      list.filter((c) => c.id !== id)
    );
    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query('DELETE FROM calculations WHERE id = ?', [id]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Site Settings Key-Value Store (settings, seo_settings, admin_profile)
app.get('/api/db/settings/:key', async (req, res) => {
  const { key } = req.params;
  try {
    if (mysqlPool && isMySQLConnected) {
      const [rows] = await mysqlPool.query<RowDataPacket[]>(
        'SELECT setting_value FROM site_settings WHERE setting_key = ? LIMIT 1',
        [key]
      );
      if (rows && rows.length > 0) {
        return res.json({ success: true, value: safeJsonParse(rows[0].setting_value, null) });
      }
    }
  } catch (err) {
    console.warn(`[MySQL GET settings/${key} fallback]:`, err);
  }
  const allSettings = readJsonFile<Record<string, any>>(SITE_SETTINGS_FILE, {});
  res.json({ success: true, value: allSettings[key] ?? null });
});

app.post('/api/db/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = req.body?.value ?? req.body;
    const allSettings = readJsonFile<Record<string, any>>(SITE_SETTINGS_FILE, {});
    allSettings[key] = value;
    writeJsonFile(SITE_SETTINGS_FILE, allSettings);

    if (mysqlPool && isMySQLConnected) {
      await mysqlPool.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, JSON.stringify(value)]
      );
    }
    res.json({ success: true, value });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Image Upload Endpoint (Saves to /data/uploads and returns URL)
app.post('/api/db/upload', (req, res) => {
  try {
    const { fileName, dataUrl } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'dataUrl is required' });
    }
    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.json({ success: true, url: dataUrl });
    }
    const ext = (fileName ? path.extname(fileName) : '') || '.jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
    res.json({ success: true, url: `/uploads/${safeName}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

async function start() {
  await initMySQLPool();

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start();
