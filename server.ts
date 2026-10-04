import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory or file-backed storage for server-side payment data
const DATA_DIR = path.resolve('data');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const CONFIG_FILE = path.join(DATA_DIR, 'payment_config.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default configuration
const defaultPaymentConfig = {
  settings: {
    currency: 'BDT',
    environment: 'sandbox', // 'sandbox' | 'live'
    min_order_amount: 10,
    max_order_amount: 200000,
    auto_cancel_minutes: 60,
    notify_email: 'mdimtiazkhan.official@gmail.com',
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
      callback_url: '/api/payments/callback/bkash',
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
      callback_url: '/api/payments/callback/nagad',
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
      callback_url: '/api/payments/callback/rocket',
    },
    card: {
      id: 'card',
      name: 'Bank Card (Visa / Mastercard)',
      category: 'card_payment',
      is_active: true,
      environment: 'sandbox',
      gateway_provider: 'sslcommerz', // 'sslcommerz' | 'stripe' | 'aamarpay'
      store_id: process.env.CARD_STORE_ID || 'PLACEHOLDER_STORE_ID',
      store_password: process.env.CARD_STORE_PASS || 'PLACEHOLDER_STORE_PASSWORD',
      supported_brands: ['Visa', 'Mastercard', 'AMEX', 'Nexus'],
      enforce_3d_secure: true,
      callback_url: '/api/payments/callback/card',
    },
    cod: {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      category: 'cash',
      is_active: true,
      environment: 'live',
      instructions: 'Pay directly in cash when receiving products from courier',
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
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving config file:', err);
  }
}

function getStoredPayments(): any[] {
  try {
    if (fs.existsSync(PAYMENTS_FILE)) {
      return JSON.parse(fs.readFileSync(PAYMENTS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading payments file:', err);
  }
  return [];
}

function saveStoredPayments(payments: any[]) {
  try {
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving payments file:', err);
  }
}

// Helper to mask secret strings
function maskSecret(val?: string) {
  if (!val || val.startsWith('PLACEHOLDER_') || val.length <= 4) return val || '';
  return val.slice(0, 2) + '••••••••' + val.slice(-4);
}

// 1. Public API: Get Active Payment Methods for Checkout
app.get('/api/payments/methods', (req, res) => {
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

// 2. Admin API: Get Payment Configuration (Masked for Security)
app.get('/api/payments/config', (req, res) => {
  const config = getStoredConfig();
  const safeConfig = JSON.parse(JSON.stringify(config));

  // Mask credentials
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

// 3. Admin API: Update Payment Configuration
app.post('/api/payments/config', (req, res) => {
  try {
    const currentConfig = getStoredConfig();
    const newConfig = req.body;

    // Merge without overwriting with masked strings
    if (newConfig.methods) {
      for (const [key, method] of Object.entries(newConfig.methods as Record<string, any>)) {
        if (!currentConfig.methods[key]) {
          currentConfig.methods[key] = method;
          continue;
        }
        for (const [prop, val] of Object.entries(method)) {
          if (typeof val === 'string' && val.includes('••••')) {
            // Keep existing unmasked secret
            continue;
          }
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

// 4. Admin API: Get Transactions History
app.get('/api/payments/transactions', (req, res) => {
  const payments = getStoredPayments();
  const { status, method, search } = req.query;

  let filtered = [...payments];

  if (status && status !== 'all') {
    filtered = filtered.filter((p) => p.status === status);
  }
  if (method && method !== 'all') {
    filtered = filtered.filter((p) => p.payment_method === method);
  }
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

  // Sort newest first
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({ success: true, transactions: filtered });
});

// 5. Checkout API: Initiate Payment
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
      status: payment_method === 'cod' ? 'pending' : 'pending',
      gateway_response: {
        initiated_at: now,
        mode: methodConfig.environment || 'sandbox',
        credentials_status: 'placeholder_or_configured',
        note: 'Payment session created server-side. Awaiting verification/callback.'
      },
      paid_at: null,
      created_at: now,
      updated_at: now,
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

// 6. Server-Side Verification API: Verify payment with gateway
app.post('/api/payments/verify', (req, res) => {
  try {
    const { transaction_id, order_id, action } = req.body;

    const payments = getStoredPayments();
    const idx = payments.findIndex((p) => p.transaction_id === transaction_id || p.order_id === order_id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Transaction record not found' });
    }

    const payment = payments[idx];
    const now = new Date().toISOString();

    // Verification logic
    // Action can be 'check_status', 'mark_paid', 'mark_failed', 'cancel', 'refund' (from admin or gateway callback)
    if (action === 'mark_paid') {
      payment.status = 'paid';
      payment.paid_at = now;
      payment.updated_at = now;
      payment.gateway_response = {
        ...payment.gateway_response,
        verified_at: now,
        verification_status: 'SUCCESS',
        gateway_trx_id: payment.transaction_id,
        verification_method: 'SERVER_CALLBACK_OR_ADMIN_CONFIRMATION'
      };
    } else if (action === 'mark_failed') {
      payment.status = 'failed';
      payment.updated_at = now;
      payment.gateway_response = {
        ...payment.gateway_response,
        failed_at: now,
        reason: 'Payment authentication failed or timed out by customer/gateway'
      };
    } else if (action === 'cancel') {
      payment.status = 'cancelled';
      payment.updated_at = now;
      payment.gateway_response = {
        ...payment.gateway_response,
        cancelled_at: now,
        reason: 'Payment cancelled by user or merchant session expiry'
      };
    } else if (action === 'refund') {
      payment.status = 'refunded';
      payment.updated_at = now;
      payment.gateway_response = {
        ...payment.gateway_response,
        refunded_at: now,
        reason: 'Payment refunded via merchant console'
      };
    } else {
      // Default query check: if credentials are placeholder, return pending
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

// 7. Gateway Webhook / Callback Handler
app.all('/api/payments/callback/:gateway', (req, res) => {
  try {
    const { gateway } = req.params;
    const body = req.body || {};
    const query = req.query || {};
    const payload = { ...query, ...body };

    const transactionId = payload.trx_id || payload.tran_id || payload.payment_id || payload.transaction_id;
    const orderId = payload.order_id || payload.orderNumber || payload.value_a;
    const status = payload.status || payload.sp_code || (payload.val_id ? 'VALID' : 'PENDING');

    console.log(`[Payment Webhook] Gateway: ${gateway}`, { transactionId, orderId, status });

    const payments = getStoredPayments();
    const idx = payments.findIndex((p) => (transactionId && p.transaction_id === transactionId) || (orderId && p.order_id === orderId));

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
      payment.gateway_response = { ...payment.gateway_response, webhook_payload: payload };
      payments[idx] = payment;
      saveStoredPayments(payments);
    }

    res.json({ success: true, received: true, gateway, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

async function start() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start();
