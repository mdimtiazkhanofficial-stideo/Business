import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Product,
  Category,
  Brand,
  Order,
  Review,
  Banner,
  SiteSettings,
  ProductVariant,
  ProcessStep,
  User,
  Customer,
  SupportMessage,
  StockHistoryRecord,
  CalculationRecord,
  SeoSettings,
  AdminProfile,
  PaymentAccountConfig,
  PaymentRecord,
  QuickLinkItem,
  QuickLinkSectionItem
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS, INITIAL_BANNERS, INITIAL_REVIEWS, INITIAL_SETTINGS, INITIAL_PROCESS_STEPS, INITIAL_QUICK_LINKS } from '../data/initialCatalog';

const DEMO_ACCOUNT_NUMBERS = new Set([
  '01711-223344',
  '01811-223344',
  '01911-223344-7',
  '1501203456789001',
  '01700-000000',
  '017000000009'
]);

export const DEFAULT_PAYMENT_CONFIGS: PaymentAccountConfig[] = [
  {
    id: 'pay-method-bkash',
    method: 'bkash',
    title: 'bKash',
    category: 'mobile_banking',
    account_type: 'Send Money',
    account_number: '',
    account_name: '',
    instructions: '',
    logo_url: '',
    is_enabled: false,
    display_order: 1
  },
  {
    id: 'pay-method-nagad',
    method: 'nagad',
    title: 'Nagad',
    category: 'mobile_banking',
    account_type: 'Send Money',
    account_number: '',
    account_name: '',
    instructions: '',
    logo_url: '',
    is_enabled: false,
    display_order: 2
  },
  {
    id: 'pay-method-rocket',
    method: 'rocket',
    title: 'Rocket',
    category: 'mobile_banking',
    account_type: 'Send Money',
    account_number: '',
    account_name: '',
    instructions: '',
    logo_url: '',
    is_enabled: false,
    display_order: 3
  },
  {
    id: 'pay-method-bank',
    method: 'bank_transfer',
    title: 'Bank Transfer',
    category: 'bank_transfer',
    account_type: 'Bank',
    account_number: '',
    account_name: '',
    bank_name: '',
    branch_name: '',
    routing_number: '',
    instructions: '',
    logo_url: '',
    is_enabled: false,
    display_order: 4
  },
  {
    id: 'pay-method-card',
    method: 'card_payment',
    title: 'Card Payment',
    category: 'card_payment',
    account_type: 'Card',
    account_number: '',
    account_name: '',
    bank_name: '',
    instructions: '',
    logo_url: '',
    is_enabled: false,
    display_order: 5
  }
];

const env = (import.meta as any).env || {};

function loadInitialSupabaseConfig() {
  let url = env.VITE_SUPABASE_URL || '';
  let anonKey = env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    try {
      const savedUrl = localStorage.getItem('shadsodai_supabase_url');
      const savedKey = localStorage.getItem('shadsodai_supabase_anon_key');
      if (savedUrl && savedKey) {
        url = savedUrl;
        anonKey = savedKey;
      }
    } catch {
      // ignore
    }
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}

let { url: activeSupabaseUrl, anonKey: activeSupabaseAnonKey } = loadInitialSupabaseConfig();

export let isSupabaseConfigured = Boolean(
  activeSupabaseUrl &&
  activeSupabaseAnonKey &&
  activeSupabaseUrl.startsWith('http')
);

export let supabase: SupabaseClient | null = null;

function initSupabaseClient(url: string, key: string): SupabaseClient | null {
  if (!url || !key || !url.startsWith('http')) return null;
  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

if (isSupabaseConfigured) {
  supabase = initSupabaseClient(activeSupabaseUrl, activeSupabaseAnonKey);
}

export function getActiveSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  return {
    url: activeSupabaseUrl,
    anonKey: activeSupabaseAnonKey,
    isConfigured: isSupabaseConfigured
  };
}

export function updateSupabaseConfig(url: string, anonKey: string): { success: boolean; error?: string } {
  try {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();
    if (!cleanUrl.startsWith('http')) {
      return { success: false, error: 'Project URL must start with https://' };
    }
    if (!cleanKey) {
      return { success: false, error: 'Supabase anon/public key is required.' };
    }

    const client = initSupabaseClient(cleanUrl, cleanKey);
    if (!client) {
      return { success: false, error: 'Could not initialize Supabase with provided credentials.' };
    }

    activeSupabaseUrl = cleanUrl;
    activeSupabaseAnonKey = cleanKey;
    supabase = client;
    isSupabaseConfigured = true;

    localStorage.setItem('shadsodai_supabase_url', cleanUrl);
    localStorage.setItem('shadsodai_supabase_anon_key', cleanKey);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update Supabase configuration.' };
  }
}

export function resetSupabaseConfig(): void {
  try {
    localStorage.removeItem('shadsodai_supabase_url');
    localStorage.removeItem('shadsodai_supabase_anon_key');
    activeSupabaseUrl = env.VITE_SUPABASE_URL || '';
    activeSupabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';
    if (activeSupabaseUrl && activeSupabaseAnonKey) {
      supabase = initSupabaseClient(activeSupabaseUrl, activeSupabaseAnonKey);
      isSupabaseConfigured = true;
    } else {
      supabase = null;
      isSupabaseConfigured = false;
    }
  } catch (err) {
    console.error('Error resetting Supabase config:', err);
  }
}

// Local persistent cache key for instant reactivity & offline/pre-configured states
const STORAGE_PREFIX = 'shadsodai_apparel_v1_';

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Local cache write error:', e);
  }
}

export const AuthService = {
  getCurrentUser(): User | null {
    const user = getStored<User | null>('current_user', null);
    if (
      user &&
      (user.id === 'usr-admin-01' ||
        user.id === 'usr-demo-01' ||
        user.email === 'admin@shadsodai.com' ||
        user.email === 'customer@shadsodai.com' ||
        user.email === 'customer@shadghor.com' ||
        user.email === 'admin@shadghor.com')
    ) {
      setStored('current_user', null);
      return null;
    }
    return user;
  },

  async signUp(data: {
    name: string;
    phone: string;
    email: string;
    password?: string;
    address?: string;
    city?: string;
    role?: 'customer' | 'admin';
  }): Promise<{ user: User; error?: string }> {
    const cleanEmail = data.email.toLowerCase().trim();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      address: data.address?.trim() || '',
      city: data.city?.trim() || 'Dhaka',
      role: 'customer',
      created_at: new Date().toISOString()
    };

    const registered = getStored<User[]>('registered_users', []);
    const existingIndex = registered.findIndex((u) => u.email === cleanEmail || (newUser.phone && u.phone === newUser.phone));
    if (existingIndex >= 0) {
      registered[existingIndex] = { ...registered[existingIndex], ...newUser };
    } else {
      registered.push(newUser);
    }
    setStored('registered_users', registered);
    setStored('current_user', newUser);

    if (supabase) {
      try {
        if (data.password) {
          await supabase.auth.signUp({
            email: newUser.email,
            password: data.password,
            options: {
              data: {
                name: newUser.name,
                phone: newUser.phone,
                role: newUser.role,
                address: newUser.address,
                city: newUser.city
              }
            }
          });
        }
        await supabase.from('customers').upsert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          address: newUser.address,
          city: newUser.city,
          role: newUser.role
        });
      } catch (err) {
        console.warn('Supabase auth signup fallback:', err);
      }
    }

    return { user: newUser };
  },

  async signIn(emailOrPhone: string, password?: string): Promise<{ user: User | null; error?: string }> {
    const query = emailOrPhone.trim().toLowerCase();

    // Search existing registered users
    const registered = getStored<User[]>('registered_users', []).filter(
      (u) =>
        u.id !== 'usr-admin-01' &&
        u.id !== 'usr-demo-01' &&
        u.email !== 'admin@shadsodai.com' &&
        u.email !== 'customer@shadsodai.com'
    );
    const found = registered.find(
      (u) => u.email.toLowerCase() === query || (u.phone && u.phone.includes(query))
    );

    if (found) {
      setStored('current_user', found);
      return { user: found };
    }

    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: query,
          password
        });
        if (!error && data?.user) {
          const user: User = {
            id: data.user.id,
            email: data.user.email || query,
            name: data.user.user_metadata?.name || 'Customer',
            phone: data.user.user_metadata?.phone || '',
            role: 'customer',
            address: data.user.user_metadata?.address || '',
            city: data.user.user_metadata?.city || 'Dhaka',
            created_at: data.user.created_at
          };
          setStored('current_user', user);
          return { user };
        }
      } catch (err: any) {
        console.warn('Supabase signIn fallback:', err);
      }
    }

    return { user: null, error: 'No account found with those credentials. Please register a new account first.' };
  },

  async signOut(): Promise<void> {
    setStored('current_user', null);
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signout fallback:', err);
      }
    }
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<{ user: User | null; error?: string }> {
    const current = this.getCurrentUser();
    if (!current) return { user: null, error: 'Not authenticated' };
    const updated: User = { ...current, ...data };
    setStored('current_user', updated);

    const registered = getStored<User[]>('registered_users', []);
    const idx = registered.findIndex((u) => u.id === userId || u.email === current.email);
    if (idx >= 0) {
      registered[idx] = { ...registered[idx], ...data };
      setStored('registered_users', registered);
    }

    if (supabase) {
      try {
        await supabase.from('customers').upsert({
          id: updated.id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          address: updated.address,
          city: updated.city
        });
      } catch (err) {
        console.warn('Supabase update customer profile fallback:', err);
      }
    }

    return { user: updated };
  }
};

export const DataService = {
  // Check connection
  async checkConnection(): Promise<{ connected: boolean; message: string; tablesPending?: boolean; productCount?: number }> {
    if (!supabase) {
      return {
        connected: false,
        message: 'Supabase credentials not configured. Please enter your Supabase Project URL & Anon Key.'
      };
    }
    try {
      const { error, count } = await supabase.from('products').select('*', { count: 'exact', head: true });
      if (error) {
        if (error.code === '42P01') {
          return {
            connected: true,
            tablesPending: true,
            message: 'Connected to Supabase, but "products" table was not found yet. Run the SQL Schema script in your Supabase SQL Editor.'
          };
        }
        throw error;
      }
      return {
        connected: true,
        productCount: count ?? 0,
        message: `Connected to Supabase! Live database verified (${count ?? 0} products found).`
      };
    } catch (err: any) {
      return { connected: false, message: err?.message || 'Failed to connect to Supabase.' };
    }
  },

  // 1. Categories
  async getCategories(): Promise<Category[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) {
          return data as Category[];
        }
      } catch (err) {
        console.warn('Supabase fetch categories fallback:', err);
      }
    }
    return getStored<Category[]>('categories', INITIAL_CATEGORIES);
  },

  async saveCategory(category: Category): Promise<Category> {
    const categories = await this.getCategories();
    const existingIndex = categories.findIndex((c) => c.id === category.id);
    let updatedCategories: Category[];

    if (existingIndex >= 0) {
      updatedCategories = categories.map((c) => (c.id === category.id ? category : c));
    } else {
      updatedCategories = [...categories, category];
    }
    setStored('categories', updatedCategories);

    if (supabase) {
      try {
        await supabase.from('categories').upsert({
          id: category.id,
          name: category.name,
          bn_name: category.bn_name || category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          banner_image: category.banner_image,
          display_order: category.display_order,
          is_active: category.is_active,
          show_on_homepage: category.show_on_homepage
        });
      } catch (err) {
        console.error('Error upserting category to Supabase:', err);
      }
    }

    return category;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const categories = await this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    setStored('categories', filtered);

    if (supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting category from Supabase:', err);
      }
    }
    return true;
  },

  // 1.1 Brands
  async getBrands(): Promise<Brand[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data) {
          return data as Brand[];
        }
      } catch (err) {
        console.warn('Supabase fetch brands fallback:', err);
      }
    }
    return getStored<Brand[]>('brands', INITIAL_BRANDS);
  },

  async saveBrand(brand: Brand): Promise<Brand> {
    const brands = await this.getBrands();
    const existingIndex = brands.findIndex((b) => b.id === brand.id);
    let updatedBrands: Brand[];

    if (existingIndex >= 0) {
      updatedBrands = brands.map((b) => (b.id === brand.id ? brand : b));
    } else {
      updatedBrands = [...brands, brand];
    }
    setStored('brands', updatedBrands);

    if (supabase) {
      try {
        await supabase.from('brands').upsert({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logo_url: brand.logo_url || null,
          description: brand.description || '',
          is_active: brand.is_active !== false
        });
      } catch (err) {
        console.error('Error upserting brand to Supabase:', err);
      }
    }

    return brand;
  },

  async deleteBrand(id: string): Promise<boolean> {
    const brands = await this.getBrands();
    const filtered = brands.filter((b) => b.id !== id);
    setStored('brands', filtered);

    if (supabase) {
      try {
        await supabase.from('brands').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting brand from Supabase:', err);
      }
    }
    return true;
  },

  // 2. Products
  async getProducts(): Promise<Product[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            variants:product_variants(*)
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as Product[];
        }
      } catch (err) {
        console.warn('Supabase fetch products fallback:', err);
      }
    }
    return getStored<Product[]>('products', INITIAL_PRODUCTS);
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id || p.slug === id) || null;
  },

  async saveProduct(product: Product): Promise<Product> {
    const products = await this.getProducts();
    const existingIndex = products.findIndex((p) => p.id === product.id);
    let updatedProducts: Product[];

    if (existingIndex >= 0) {
      updatedProducts = products.map((p) => (p.id === product.id ? product : p));
    } else {
      updatedProducts = [product, ...products];
    }
    setStored('products', updatedProducts);

    if (supabase) {
      try {
        // Ensure the product's category exists in Supabase if category_id is present
        if (product.category_id) {
          const allCats = getStored<Category[]>('categories', INITIAL_CATEGORIES);
          const matchedCat = allCats.find((c) => c.id === product.category_id);
          if (matchedCat) {
            await supabase.from('categories').upsert({
              id: matchedCat.id,
              name: matchedCat.name,
              bn_name: matchedCat.bn_name || matchedCat.name,
              slug: matchedCat.slug,
              description: matchedCat.description || '',
              image: matchedCat.image || '',
              banner_image: matchedCat.banner_image || null,
              display_order: matchedCat.display_order || 0,
              is_active: matchedCat.is_active !== false,
              show_on_homepage: matchedCat.show_on_homepage !== false
            });
          }
        }

        const fullProductPayload = {
          id: product.id,
          name: product.name,
          bn_name: product.bn_name || product.name,
          slug: product.slug,
          sku: product.sku,
          category_id: product.category_id || null,
          category_name: product.category_name || '',
          main_image: product.main_image,
          gallery_images: product.gallery_images || [],
          short_description: product.short_description || '',
          long_description: product.long_description || '',
          buying_price: Number(product.buying_price) || 0,
          selling_price: Number(product.selling_price) || 0,
          discount_price: product.discount_price ? Number(product.discount_price) : null,
          original_price: product.original_price ? Number(product.original_price) : null,
          stock: Number(product.stock) || 0,
          rating: Number(product.rating) || 5.0,
          review_count: Number(product.review_count) || 0,
          brand: product.brand || 'SHAD SODAI',
          sizes: product.sizes || [],
          colors: product.colors || [],
          fabric: product.fabric || null,
          material: product.material || null,
          fit: product.fit || null,
          pattern: product.pattern || null,
          sleeve: product.sleeve || null,
          neck_collar: product.neck_collar || null,
          gender: product.gender || null,
          season: product.season || null,
          origin: product.origin || null,
          care_instructions: product.care_instructions || null,
          exchange_policy: product.exchange_policy || null,
          size_chart: product.size_chart || [],
          tags: product.tags || [],
          size_variants: product.size_variants || product.sizeVariants || [],
          ingredients: product.ingredients || null,
          nutrition: product.nutrition || {},
          benefits: product.benefits || [],
          how_to_use: product.how_to_use || null,
          storage_instructions: product.storage_instructions || null,
          delivery_info: product.delivery_info || '',
          seo_title: product.seo_title || product.name,
          seo_description: product.seo_description || product.short_description || '',
          status: product.status || 'active',
          is_featured: Boolean(product.is_featured),
          is_popular: Boolean(product.is_popular),
          is_bestseller: Boolean(product.is_bestseller),
          is_combo: Boolean(product.is_combo)
        };

        const { error: prodError } = await supabase.from('products').upsert(fullProductPayload);

        if (prodError) {
          // Fallback to base columns if extended columns are not yet migrated
          const { error: fallbackError } = await supabase.from('products').upsert({
            id: product.id,
            name: product.name,
            bn_name: product.bn_name || product.name,
            slug: product.slug,
            sku: product.sku,
            category_id: product.category_id || null,
            category_name: product.category_name || '',
            main_image: product.main_image,
            gallery_images: product.gallery_images || [],
            short_description: product.short_description || '',
            long_description: product.long_description || '',
            buying_price: Number(product.buying_price) || 0,
            selling_price: Number(product.selling_price) || 0,
            discount_price: product.discount_price ? Number(product.discount_price) : null,
            stock: Number(product.stock) || 0,
            rating: Number(product.rating) || 5.0,
            review_count: Number(product.review_count) || 0,
            delivery_info: product.delivery_info || '',
            seo_title: product.seo_title || product.name,
            seo_description: product.seo_description || product.short_description || '',
            status: product.status || 'active',
            is_popular: Boolean(product.is_popular),
            is_bestseller: Boolean(product.is_bestseller),
            is_combo: Boolean(product.is_combo)
          });
          if (fallbackError) throw fallbackError;
        }

        // Upsert variants
        if (product.variants && product.variants.length > 0) {
          const variantsPayload = product.variants.map((v, idx) => {
            const label = v.weight || [v.size, v.color].filter(Boolean).join(' / ') || 'Standard';
            return {
              id: v.id || `var-${product.id}-${idx}`,
              product_id: product.id,
              weight: label,
              size: v.size || null,
              color: v.color || null,
              color_code: v.color_code || null,
              image: v.image || product.main_image || null,
              price: Number(v.price) || Number(product.selling_price) || 0,
              original_price: Number(v.original_price) || Number(product.discount_price) || Number(product.selling_price) || 0,
              stock: Number(v.stock) ?? Number(product.stock) ?? 10,
              sku: v.sku || `${product.sku}-${label}`
            };
          });
          const { error: varErr } = await supabase.from('product_variants').upsert(variantsPayload);
          if (varErr) {
            const basicVariantsPayload = variantsPayload.map((v) => ({
              id: v.id,
              product_id: v.product_id,
              weight: v.weight,
              price: v.price,
              original_price: v.original_price,
              stock: v.stock,
              sku: v.sku
            }));
            await supabase.from('product_variants').upsert(basicVariantsPayload);
          }
        }
      } catch (err) {
        console.error('Error saving product in Supabase:', err);
      }
    }

    return product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    setStored('products', filtered);

    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting product from Supabase:', err);
      }
    }
    return true;
  },

  // 3. Process Steps ("OUR PROCESS")
  async getProcessSteps(): Promise<ProcessStep[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('process_steps')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) {
          return data as ProcessStep[];
        }
      } catch (err) {
        console.warn('Supabase fetch process_steps fallback:', err);
      }
    }
    return getStored<ProcessStep[]>('process_steps', INITIAL_PROCESS_STEPS);
  },

  async saveProcessStep(step: ProcessStep): Promise<ProcessStep> {
    const steps = await this.getProcessSteps();
    const existingIndex = steps.findIndex((s) => s.id === step.id);
    let updatedSteps: ProcessStep[];

    if (existingIndex >= 0) {
      updatedSteps = steps.map((s) => (s.id === step.id ? step : s));
    } else {
      updatedSteps = [...steps, step];
    }
    setStored('process_steps', updatedSteps);

    if (supabase) {
      try {
        await supabase.from('process_steps').upsert({
          id: step.id,
          title: step.title,
          short_description: step.short_description,
          image_url: step.image_url,
          video_url: step.video_url || null,
          video_thumbnail: step.video_thumbnail || null,
          display_order: step.display_order,
          status: step.status
        });
      } catch (err) {
        console.error('Error upserting process_step to Supabase:', err);
      }
    }

    return step;
  },

  async deleteProcessStep(id: string): Promise<boolean> {
    const steps = await this.getProcessSteps();
    const filtered = steps.filter((s) => s.id !== id);
    setStored('process_steps', filtered);

    if (supabase) {
      try {
        await supabase.from('process_steps').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting process_step from Supabase:', err);
      }
    }
    return true;
  },

  // 4. Orders
  async getOrders(): Promise<Order[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*)
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as Order[];
        }
      } catch (err) {
        console.warn('Supabase fetch orders fallback:', err);
      }
    }
    return getStored<Order[]>('orders', []);
  },

  async createOrder(order: Order): Promise<Order> {
    const orders = await this.getOrders();
    const updatedOrders = [order, ...orders];
    setStored('orders', updatedOrders);

    if (supabase) {
      try {
        // 1. Upsert Order with all fields (fallback to base fields if needed)
        const fullOrderPayload = {
          id: order.id,
          order_number: order.order_number,
          user_id: order.user_id || null,
          customer_name: order.customer_name,
          customer_email: order.customer_email || null,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          customer_city: order.customer_city || 'Dhaka',
          order_notes: order.order_notes || null,
          subtotal: Number(order.subtotal) || 0,
          delivery_charge: Number(order.delivery_charge) || 0,
          discount: Number(order.discount) || 0,
          total: Number(order.total) || 0,
          total_amount: Number(order.total_amount ?? order.total) || 0,
          payment_method: order.payment_method,
          payment_status: order.payment_status || 'pending',
          order_status: order.order_status || 'pending',
          courier_name: order.courier_name || null,
          tracking_id: order.tracking_id || null,
          shipment_status: order.shipment_status || null,
          shipment_date: order.shipment_date || null,
          transaction_id: order.transaction_id || null,
          sender_phone: order.sender_phone || null,
          payment_proof: order.payment_proof || null,
          created_at: order.created_at || new Date().toISOString()
        };

        const { error: ordError } = await supabase.from('orders').upsert(fullOrderPayload);

        if (ordError) {
          const { error: fallbackOrdError } = await supabase.from('orders').upsert({
            id: order.id,
            order_number: order.order_number,
            user_id: order.user_id || null,
            customer_name: order.customer_name,
            customer_email: order.customer_email || null,
            customer_phone: order.customer_phone,
            customer_address: order.customer_address,
            customer_city: order.customer_city || 'Dhaka',
            order_notes: order.order_notes || null,
            subtotal: Number(order.subtotal) || 0,
            delivery_charge: Number(order.delivery_charge) || 0,
            discount: Number(order.discount) || 0,
            total: Number(order.total) || 0,
            payment_method: order.payment_method,
            payment_status: order.payment_status || 'pending',
            order_status: order.order_status || 'pending'
          });
          if (fallbackOrdError) throw fallbackOrdError;
        }

        // 2. Insert Order Items (and ensure referenced products exist in Supabase)
        if (order.items && order.items.length > 0) {
          const allLocalProducts = getStored<Product[]>('products', INITIAL_PRODUCTS);
          for (const it of order.items) {
            if (it.product_id) {
              const matchedProd = allLocalProducts.find((p) => p.id === it.product_id);
              if (matchedProd) {
                await this.saveProduct(matchedProd);
              }
            }
          }

          const fullItemsPayload = order.items.map((it) => ({
            order_id: order.id,
            product_id: it.product_id || null,
            product_name: it.product_name,
            variant_weight: it.variant_weight || [it.variant_size, it.variant_color].filter(Boolean).join(' / ') || 'Standard',
            variant_size: it.variant_size || null,
            variant_color: it.variant_color || null,
            quantity: Number(it.quantity) || 1,
            unit_price: Number(it.unit_price) || 0,
            total_price: Number(it.total_price) || (Number(it.unit_price) || 0) * (Number(it.quantity) || 1),
            image: it.image || ''
          }));

          const { error: itemsErr } = await supabase.from('order_items').insert(fullItemsPayload);
          if (itemsErr) {
            const basicItemsPayload = fullItemsPayload.map((it) => ({
              order_id: it.order_id,
              product_id: it.product_id,
              product_name: it.product_name,
              variant_weight: it.variant_weight,
              quantity: it.quantity,
              unit_price: it.unit_price,
              total_price: it.total_price,
              image: it.image
            }));
            await supabase.from('order_items').insert(basicItemsPayload);
          }
        }
      } catch (err) {
        console.error('Error saving order in Supabase:', err);
      }
    }

    return order;
  },

  async updateOrderStatus(orderId: string, status: Order['order_status']): Promise<void> {
    const orders = await this.getOrders();
    const updated = orders.map((o) => (o.id === orderId ? { ...o, order_status: status } : o));
    setStored('orders', updated);

    if (supabase) {
      try {
        await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
      } catch (err) {
        console.error('Error updating order status in Supabase:', err);
      }
    }
  },

  async updateOrder(order: Order): Promise<Order> {
    const orders = await this.getOrders();
    const updated = orders.map((o) => (o.id === order.id ? order : o));
    setStored('orders', updated);

    // Sync payment_records if payment_status changed
    const records = getStored<PaymentRecord[]>('payment_records', []);
    if (records.some((r) => r.order_id === order.id || r.order_number === order.order_number)) {
      const nextStatus: PaymentRecord['status'] =
        order.payment_status === 'paid'
          ? 'PAID'
          : order.payment_status === 'rejected'
          ? 'REJECTED'
          : 'PENDING';
      const syncedRecords = records.map((r) =>
        r.order_id === order.id || r.order_number === order.order_number
          ? { ...r, status: nextStatus, payment_method: order.payment_method }
          : r
      );
      setStored('payment_records', syncedRecords);
    }

    if (supabase) {
      try {
        await supabase.from('orders').update({
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          customer_city: order.customer_city,
          order_notes: order.order_notes,
          subtotal: order.subtotal,
          delivery_charge: order.delivery_charge,
          discount: order.discount,
          total: order.total,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          order_status: order.order_status,
          courier_name: order.courier_name,
          tracking_id: order.tracking_id,
          shipment_status: order.shipment_status,
          shipment_date: order.shipment_date,
          transaction_id: order.transaction_id || null,
          sender_phone: order.sender_phone || null,
          payment_proof: order.payment_proof || null
        }).eq('id', order.id);
      } catch (err) {
        console.error('Error updating order in Supabase:', err);
      }
    }
    return order;
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    const orders = await this.getOrders();
    const filtered = orders.filter((o) => o.id !== orderId);
    setStored('orders', filtered);

    if (supabase) {
      try {
        await supabase.from('order_items').delete().eq('order_id', orderId);
        await supabase.from('orders').delete().eq('id', orderId);
      } catch (err) {
        console.error('Error deleting order from Supabase:', err);
      }
    }
    return true;
  },

  // 5. Reviews
  async getReviews(productId?: string): Promise<Review[]> {
    if (supabase) {
      try {
        let query = supabase.from('reviews').select('*').eq('status', 'approved');
        if (productId) query = query.eq('product_id', productId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) return data as Review[];
      } catch (err) {
        console.warn('Supabase fetch reviews fallback:', err);
      }
    }
    const stored = getStored<Review[]>('reviews', INITIAL_REVIEWS);
    const approved = stored.filter((r) => r.status === 'approved');
    return productId ? approved.filter((r) => r.product_id === productId) : approved;
  },

  async getAllReviews(): Promise<Review[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as Review[];
      } catch (err) {
        console.warn('Supabase fetch all reviews fallback:', err);
      }
    }
    return getStored<Review[]>('reviews', INITIAL_REVIEWS);
  },

  async addReview(review: Review): Promise<Review> {
    const reviews = await this.getAllReviews();
    const updated = [review, ...reviews];
    setStored('reviews', updated);

    if (supabase) {
      try {
        await supabase.from('reviews').insert({
          id: review.id,
          product_id: review.product_id,
          product_name: review.product_name,
          customer_name: review.customer_name,
          rating: review.rating,
          comment: review.comment,
          verified_purchase: review.verified_purchase,
          status: review.status
        });
      } catch (err) {
        console.error('Error adding review in Supabase:', err);
      }
    }
    return review;
  },

  async updateReviewStatus(id: string, status: 'approved' | 'pending'): Promise<void> {
    const reviews = await this.getAllReviews();
    const updated = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    setStored('reviews', updated);

    if (supabase) {
      try {
        await supabase.from('reviews').update({ status }).eq('id', id);
      } catch (err) {
        console.error('Error updating review status in Supabase:', err);
      }
    }
  },

  async deleteReview(id: string): Promise<boolean> {
    const reviews = await this.getAllReviews();
    const updated = reviews.filter((r) => r.id !== id);
    setStored('reviews', updated);

    if (supabase) {
      try {
        await supabase.from('reviews').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting review from Supabase:', err);
      }
    }
    return true;
  },

  // 6. Banners & Settings
  async getBanners(): Promise<Banner[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('banners').select('*').eq('is_active', true);
        if (!error && data) return data as Banner[];
      } catch (err) {
        console.warn('Supabase fetch banners:', err);
      }
    }
    return getStored<Banner[]>('banners', []);
  },

  async getAllBanners(): Promise<Banner[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('banners').select('*');
        if (!error && data) return data as Banner[];
      } catch (err) {
        console.warn('Supabase fetch all banners:', err);
      }
    }
    return getStored<Banner[]>('banners', []);
  },

  async saveBanner(banner: Banner): Promise<Banner> {
    const banners = await this.getAllBanners();
    const existingIndex = banners.findIndex((b) => b.id === banner.id);
    let updated: Banner[];
    if (existingIndex >= 0) {
      updated = banners.map((b) => (b.id === banner.id ? banner : b));
    } else {
      updated = [...banners, banner];
    }
    setStored('banners', updated);

    if (supabase) {
      try {
        await supabase.from('banners').upsert({
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle,
          button_text: banner.button_text,
          button_link: banner.button_link,
          image_url: banner.image_url,
          type: banner.type,
          is_active: banner.is_active,
          homepage_enabled: banner.homepage_enabled,
          product_id: banner.product_id,
          display_order: banner.display_order
        });
      } catch (err) {
        console.error('Error upserting banner in Supabase:', err);
      }
    }
    return banner;
  },

  async deleteBanner(id: string): Promise<boolean> {
    const banners = await this.getAllBanners();
    const updated = banners.filter((b) => b.id !== id);
    setStored('banners', updated);

    if (supabase) {
      try {
        await supabase.from('banners').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting banner in Supabase:', err);
      }
    }
    return true;
  },

  // 7. Customers (Aggregated directly from real registered users + live orders)
  async getCustomers(): Promise<Customer[]> {
    const registered = getStored<User[]>('registered_users', []);
    const orders = await this.getOrders();

    const customerMap = new Map<string, Customer>();

    // Add all registered users
    for (const u of registered) {
      if (u.role === 'admin') continue;
      const custOrders = orders.filter(
        (o) => (o.user_id && o.user_id === u.id) || o.customer_phone === u.phone || (u.email && o.customer_email === u.email)
      );
      const totalSpent = custOrders.reduce((sum, o) => sum + o.total, 0);

      customerMap.set(u.phone || u.email, {
        id: u.id,
        name: u.name,
        phone: u.phone || '',
        email: u.email,
        address: u.address || '',
        city: u.city || 'Dhaka',
        total_orders: custOrders.length,
        total_spent: totalSpent,
        created_at: u.created_at || new Date().toISOString()
      });
    }

    // Include any customers who ordered as guests without prior account
    for (const ord of orders) {
      const key = ord.customer_phone || ord.customer_email || ord.customer_name;
      if (!customerMap.has(key)) {
        const custOrders = orders.filter((o) => o.customer_phone === ord.customer_phone);
        const totalSpent = custOrders.reduce((sum, o) => sum + o.total, 0);
        customerMap.set(key, {
          id: `cust-${ord.id}`,
          name: ord.customer_name,
          phone: ord.customer_phone,
          email: ord.customer_email || '',
          address: ord.customer_address,
          city: ord.customer_city,
          total_orders: custOrders.length,
          total_spent: totalSpent,
          created_at: ord.created_at
        });
      }
    }

    return Array.from(customerMap.values());
  },

  // 8. Customer Support Messages / Helpdesk
  async getSupportMessages(): Promise<SupportMessage[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('support_messages')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data as SupportMessage[];
      } catch (err) {
        console.warn('Supabase fetch support_messages fallback:', err);
      }
    }
    return getStored<SupportMessage[]>('support_messages', [
      {
        id: 'msg-1',
        customer_name: 'SHAD SODAI Customer',
        customer_email: 'customer@shadsodai.com',
        customer_phone: '+880 1711-000000',
        subject: 'Wholesale & Family Combo Inquiries',
        message: 'Hello SHAD SODAI Support! Are custom gift packaging boxes available for corporate dry fruit orders?',
        status: 'new',
        created_at: new Date().toISOString()
      }
    ]);
  },

  async saveSupportMessage(msg: SupportMessage): Promise<SupportMessage> {
    const messages = await this.getSupportMessages();
    const updated = [msg, ...messages];
    setStored('support_messages', updated);

    if (supabase) {
      try {
        await supabase.from('support_messages').insert({
          id: msg.id,
          user_id: msg.user_id || null,
          customer_name: msg.customer_name,
          customer_email: msg.customer_email,
          customer_phone: msg.customer_phone || null,
          subject: msg.subject,
          message: msg.message,
          status: msg.status
        });
      } catch (err) {
        console.error('Error saving support message in Supabase:', err);
      }
    }
    return msg;
  },

  async updateSupportMessageStatus(id: string, status: SupportMessage['status']): Promise<void> {
    const messages = await this.getSupportMessages();
    const updated = messages.map((m) => (m.id === id ? { ...m, status } : m));
    setStored('support_messages', updated);

    if (supabase) {
      try {
        await supabase.from('support_messages').update({ status }).eq('id', id);
      } catch (err) {
        console.error('Error updating support message status:', err);
      }
    }
  },

  async getSettings(): Promise<SiteSettings> {
    return getStored<SiteSettings>('settings', {
      ...INITIAL_SETTINGS,
      supabase_connected: isSupabaseConfigured
    });
  },

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    setStored('settings', settings);
    return settings;
  },

  // 9. Payment Management (bKash, Nagad, Rocket, Bank Transfer, Card Payment)
  async getPaymentConfigs(): Promise<PaymentAccountConfig[]> {
    let storedList: PaymentAccountConfig[] = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data && data.length > 0) {
          storedList = data as PaymentAccountConfig[];
        }
      } catch (err) {
        console.warn('Supabase fetch payment_methods fallback:', err);
      }
    }

    if (storedList.length === 0) {
      storedList = getStored<PaymentAccountConfig[]>('payment_configs', []);
    }

    // Normalize and ensure all 5 standard manual methods exist without any demo numbers
    const normalizedMap = new Map<string, PaymentAccountConfig>();

    for (const def of DEFAULT_PAYMENT_CONFIGS) {
      normalizedMap.set(def.method, { ...def });
    }

    for (const item of storedList) {
      let key = item.method;
      if (key === 'bkash_personal') key = 'bkash';
      if (key === 'nagad_personal') key = 'nagad';
      if (key === 'rocket_personal') key = 'rocket';
      if (key === 'cod') continue; // COD is handled at checkout alongside manual methods

      const isDemoNumber = DEMO_ACCOUNT_NUMBERS.has((item.account_number || '').trim());
      if (isDemoNumber) {
        continue;
      }

      const base = normalizedMap.get(key);
      if (base) {
        normalizedMap.set(key, {
          ...base,
          ...item,
          id: base.id,
          method: key,
          category: base.category,
          account_number: item.account_number || '',
          account_name: item.account_name || '',
          bank_name: item.bank_name || '',
          branch_name: item.branch_name || '',
          routing_number: item.routing_number || '',
          instructions: item.instructions || '',
          logo_url: item.logo_url || '',
          display_order: Number(item.display_order) || base.display_order
        });
      } else {
        normalizedMap.set(key, {
          ...item,
          account_number: item.account_number || '',
          instructions: item.instructions || '',
          display_order: Number(item.display_order) || normalizedMap.size + 1
        });
      }
    }

    const finalConfigs = Array.from(normalizedMap.values()).sort(
      (a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99)
    );

    setStored('payment_configs', finalConfigs);
    return finalConfigs;
  },

  async savePaymentConfig(config: PaymentAccountConfig): Promise<PaymentAccountConfig> {
    const configs = await this.getPaymentConfigs();
    const updatedConfig: PaymentAccountConfig = {
      ...config,
      updated_at: new Date().toISOString()
    };

    const exists = configs.some((c) => c.id === updatedConfig.id || c.method === updatedConfig.method);
    const nextConfigs = exists
      ? configs.map((c) => (c.id === updatedConfig.id || c.method === updatedConfig.method ? updatedConfig : c))
      : [...configs, updatedConfig];

    nextConfigs.sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99));
    setStored('payment_configs', nextConfigs);

    if (supabase) {
      try {
        await supabase.from('payment_methods').upsert({
          id: updatedConfig.id,
          method: updatedConfig.method,
          title: updatedConfig.title,
          category: updatedConfig.category || null,
          account_type: updatedConfig.account_type,
          account_number: updatedConfig.account_number,
          account_name: updatedConfig.account_name || null,
          bank_name: updatedConfig.bank_name || null,
          branch_name: updatedConfig.branch_name || null,
          routing_number: updatedConfig.routing_number || null,
          instructions: updatedConfig.instructions,
          logo_url: updatedConfig.logo_url || null,
          is_enabled: updatedConfig.is_enabled,
          display_order: updatedConfig.display_order,
          updated_at: updatedConfig.updated_at
        });
      } catch (err) {
        console.warn('Supabase upsert payment_methods fallback:', err);
      }
    }

    return updatedConfig;
  },

  async getPaymentRecords(): Promise<PaymentRecord[]> {
    let records: PaymentRecord[] = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('payment_records')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          records = data as PaymentRecord[];
        }
      } catch (err) {
        console.warn('Supabase fetch payment_records fallback:', err);
      }
    }

    if (records.length === 0) {
      records = getStored<PaymentRecord[]>('payment_records', []);
    }

    // Filter out any old sample records and sync with real orders
    const orders = await this.getOrders();
    const orderIds = new Set(orders.map((o) => o.id));
    const orderNumbers = new Set(orders.map((o) => o.order_number));

    const validRecords = records.filter(
      (r) => !r.id.startsWith('pay-sample-') && (orderIds.has(r.order_id) || (r.order_number && orderNumbers.has(r.order_number)))
    );

    // Ensure every order in the database is represented if it has payment details
    const recordedOrderIds = new Set(validRecords.map((r) => r.order_id));
    for (const ord of orders) {
      if (!recordedOrderIds.has(ord.id)) {
        const statusMap: Record<string, PaymentRecord['status']> = {
          paid: 'PAID',
          rejected: 'REJECTED',
          pending: 'PENDING'
        };
        validRecords.push({
          id: `pay-${ord.id}`,
          order_id: ord.id,
          order_number: ord.order_number,
          customer_id: ord.user_id,
          customer_name: ord.customer_name,
          customer_phone: ord.customer_phone,
          payment_method: ord.payment_method,
          account_type: ord.payment_method.toLowerCase().includes('cod') ? 'COD' : 'Manual',
          account_number: '',
          amount: Number(ord.total ?? ord.total_amount ?? 0),
          transaction_id: ord.transaction_id || (ord.payment_method.toLowerCase().includes('cod') ? 'COD' : ''),
          sender_phone: ord.sender_phone || ord.customer_phone,
          payment_proof: ord.payment_proof,
          status: statusMap[ord.payment_status] || 'PENDING',
          created_at: ord.created_at
        });
      }
    }

    validRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setStored('payment_records', validRecords);
    return validRecords;
  },

  async createPaymentRecord(record: PaymentRecord): Promise<PaymentRecord> {
    const records = await this.getPaymentRecords();
    const filtered = records.filter((r) => r.id !== record.id && r.order_id !== record.order_id);
    const updated = [record, ...filtered];
    setStored('payment_records', updated);

    if (supabase) {
      try {
        await supabase.from('payment_records').upsert({
          id: record.id,
          order_id: record.order_id,
          order_number: record.order_number,
          customer_id: record.customer_id || null,
          customer_name: record.customer_name || null,
          customer_phone: record.customer_phone || null,
          payment_method: record.payment_method,
          account_type: record.account_type,
          account_number: record.account_number,
          amount: record.amount,
          transaction_id: record.transaction_id,
          sender_phone: record.sender_phone || null,
          payment_proof: record.payment_proof || null,
          status: record.status,
          admin_note: record.admin_note || null,
          created_at: record.created_at
        });
      } catch (err) {
        console.warn('Supabase insert payment_record fallback:', err);
      }
    }

    return record;
  },

  async verifyPayment(paymentId: string, adminNote?: string): Promise<PaymentRecord | null> {
    const records = await this.getPaymentRecords();
    const target = records.find((r) => r.id === paymentId);
    if (!target) return null;

    const verifiedRecord: PaymentRecord = {
      ...target,
      status: 'PAID',
      admin_note: adminNote || target.admin_note || '',
      verified_at: new Date().toISOString()
    };

    const updatedRecords = records.map((r) => (r.id === paymentId ? verifiedRecord : r));
    setStored('payment_records', updatedRecords);

    // Sync with linked Order in database
    const orders = await this.getOrders();
    const updatedOrders = orders.map((o) =>
      o.id === target.order_id || o.order_number === target.order_number
        ? { ...o, payment_status: 'paid' as const }
        : o
    );
    setStored('orders', updatedOrders);

    if (supabase) {
      try {
        await supabase
          .from('payment_records')
          .update({ status: 'PAID', admin_note: verifiedRecord.admin_note, verified_at: verifiedRecord.verified_at })
          .eq('id', paymentId);
        await supabase
          .from('orders')
          .update({ payment_status: 'paid' })
          .eq('id', target.order_id);
      } catch (err) {
        console.warn('Supabase verifyPayment fallback:', err);
      }
    }

    return verifiedRecord;
  },

  async rejectPayment(paymentId: string, adminNote?: string): Promise<PaymentRecord | null> {
    const records = await this.getPaymentRecords();
    const target = records.find((r) => r.id === paymentId);
    if (!target) return null;

    const rejectedRecord: PaymentRecord = {
      ...target,
      status: 'REJECTED',
      admin_note: adminNote || target.admin_note || ''
    };

    const updatedRecords = records.map((r) => (r.id === paymentId ? rejectedRecord : r));
    setStored('payment_records', updatedRecords);

    // Sync with linked Order in database
    const orders = await this.getOrders();
    const updatedOrders = orders.map((o) =>
      o.id === target.order_id || o.order_number === target.order_number
        ? { ...o, payment_status: 'rejected' as const }
        : o
    );
    setStored('orders', updatedOrders);

    if (supabase) {
      try {
        await supabase
          .from('payment_records')
          .update({ status: 'REJECTED', admin_note: rejectedRecord.admin_note })
          .eq('id', paymentId);
        await supabase
          .from('orders')
          .update({ payment_status: 'rejected' })
          .eq('id', target.order_id);
      } catch (err) {
        console.warn('Supabase rejectPayment fallback:', err);
      }
    }

    return rejectedRecord;
  },

  // 10. Stock History & Adjustments
  async getStockHistory(): Promise<StockHistoryRecord[]> {
    return getStored<StockHistoryRecord[]>('stock_history', []);
  },

  async adjustProductStock(productId: string, adjustment: number, reason: string): Promise<Product | null> {
    const products = await this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return null;

    const prevStock = Number(product.stock) || 0;
    const newStock = Math.max(0, prevStock + adjustment);
    const updatedProduct: Product = { ...product, stock: newStock };
    await this.saveProduct(updatedProduct);

    const history = await this.getStockHistory();
    const record: StockHistoryRecord = {
      id: `stk-${Date.now()}`,
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      type: adjustment >= 0 ? 'restock' : 'manual_adjustment',
      quantity_changed: adjustment,
      previous_stock: prevStock,
      new_stock: newStock,
      reason,
      created_at: new Date().toISOString()
    };
    setStored('stock_history', [record, ...history]);
    return updatedProduct;
  },

  // 11. Profit / Business Calculations
  async getCalculations(): Promise<CalculationRecord[]> {
    return getStored<CalculationRecord[]>('calculations', []);
  },

  async saveCalculation(calc: CalculationRecord): Promise<CalculationRecord> {
    const list = await this.getCalculations();
    const idx = list.findIndex((c) => c.id === calc.id);
    const updated = idx >= 0 ? list.map((c) => (c.id === calc.id ? calc : c)) : [calc, ...list];
    setStored('calculations', updated);
    return calc;
  },

  async deleteCalculation(id: string): Promise<boolean> {
    const list = await this.getCalculations();
    setStored('calculations', list.filter((c) => c.id !== id));
    return true;
  },

  // 12. SEO Settings & Admin Profile
  async getSeoSettings(): Promise<SeoSettings> {
    return getStored<SeoSettings>('seo_settings', {
      site_title: 'SHAD SODAI',
      meta_description: '',
      meta_keywords: '',
      og_image: '',
      structured_data_enabled: true
    });
  },

  async saveSeoSettings(seo: SeoSettings): Promise<SeoSettings> {
    setStored('seo_settings', seo);
    return seo;
  },

  async getAdminProfile(): Promise<AdminProfile> {
    return getStored<AdminProfile>('admin_profile', {
      id: 'adm-01',
      name: 'SHAD SODAI Admin',
      email: 'admin@shadsodai.com',
      phone: '',
      role: 'Super Admin'
    });
  },

  async saveAdminProfile(profile: AdminProfile): Promise<AdminProfile> {
    setStored('admin_profile', profile);
    return profile;
  },

  // 13. Quick Links & Policy Sections (quick_links + quick_link_sections)
  async getQuickLinks(): Promise<QuickLinkItem[]> {
    let storedLinks: QuickLinkItem[] = [];
    let storedSections: QuickLinkSectionItem[] = [];

    if (supabase) {
      try {
        const { data: linksData, error: linksError } = await supabase
          .from('quick_links')
          .select('*')
          .order('display_order', { ascending: true });

        const { data: sectionsData, error: sectionsError } = await supabase
          .from('quick_link_sections')
          .select('*')
          .order('display_order', { ascending: true });

        if (!linksError && linksData && linksData.length > 0) {
          storedLinks = linksData as QuickLinkItem[];
          if (!sectionsError && sectionsData) {
            storedSections = sectionsData as QuickLinkSectionItem[];
          }
        }
      } catch (err) {
        console.warn('Supabase fetch quick_links fallback:', err);
      }
    }

    if (storedLinks.length === 0) {
      storedLinks = getStored<QuickLinkItem[]>('quick_links', []);
      storedSections = getStored<QuickLinkSectionItem[]>('quick_link_sections', []);
    }

    // Ensure all 13 default Quick Links exist and merge saved changes + sections
    const linkMap = new Map<string, QuickLinkItem>();
    for (const def of INITIAL_QUICK_LINKS) {
      linkMap.set(def.id, {
        ...def,
        sections: (def.sections || []).map((s) => ({ ...s }))
      });
    }

    for (const saved of storedLinks) {
      const existing = linkMap.get(saved.id) || Array.from(linkMap.values()).find((l) => l.slug === saved.slug);
      const key = existing ? existing.id : saved.id;
      const savedInlineSections = Array.isArray(saved.sections) ? saved.sections : undefined;
      const relatedTableSections = storedSections.filter((s) => s.quick_link_id === key);

      const resolvedSections =
        relatedTableSections.length > 0
          ? relatedTableSections
          : savedInlineSections !== undefined
          ? savedInlineSections
          : existing?.sections || [];

      linkMap.set(key, {
        ...(existing || {}),
        ...saved,
        id: key,
        sections: [...resolvedSections].sort(
          (a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99)
        )
      });
    }

    const finalLinks = Array.from(linkMap.values()).sort(
      (a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99)
    );

    const allFlattenedSections = finalLinks.flatMap((l) => l.sections || []);
    setStored('quick_links', finalLinks);
    setStored('quick_link_sections', allFlattenedSections);

    return finalLinks;
  },

  async saveQuickLink(link: QuickLinkItem): Promise<QuickLinkItem> {
    const links = await this.getQuickLinks();
    const now = new Date().toISOString();

    const normalizedSections: QuickLinkSectionItem[] = (link.sections || [])
      .map((sec, idx) => ({
        ...sec,
        id: sec.id || `sec-${link.slug}-${Date.now()}-${idx}`,
        quick_link_id: link.id,
        section_number: Number(sec.section_number) || idx + 1,
        heading: sec.heading || '',
        content: sec.content || '',
        bullet_points: Array.isArray(sec.bullet_points) ? sec.bullet_points : [],
        display_order: Number(sec.display_order) || idx + 1,
        is_active: sec.is_active !== false,
        created_at: sec.created_at || now,
        updated_at: now
      }))
      .sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99));

    const updatedLink: QuickLinkItem = {
      ...link,
      sections: normalizedSections,
      updated_at: now
    };

    const exists = links.some((l) => l.id === updatedLink.id);
    const nextLinks = exists
      ? links.map((l) => (l.id === updatedLink.id ? updatedLink : l))
      : [...links, updatedLink];

    nextLinks.sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99));
    const allSections = nextLinks.flatMap((l) => l.sections || []);

    setStored('quick_links', nextLinks);
    setStored('quick_link_sections', allSections);

    if (supabase) {
      try {
        await supabase.from('quick_links').upsert({
          id: updatedLink.id,
          title: updatedLink.title,
          page_title: updatedLink.page_title || null,
          short_description: updatedLink.short_description || null,
          slug: updatedLink.slug,
          type: updatedLink.type,
          url: updatedLink.url,
          is_active: updatedLink.is_active,
          display_order: updatedLink.display_order,
          created_at: updatedLink.created_at,
          updated_at: updatedLink.updated_at
        });

        await supabase.from('quick_link_sections').delete().eq('quick_link_id', updatedLink.id);
        if (normalizedSections.length > 0) {
          await supabase.from('quick_link_sections').insert(
            normalizedSections.map((s) => ({
              id: s.id,
              quick_link_id: s.quick_link_id,
              section_number: s.section_number,
              heading: s.heading,
              content: s.content,
              bullet_points: s.bullet_points,
              display_order: s.display_order,
              is_active: s.is_active,
              created_at: s.created_at,
              updated_at: s.updated_at
            }))
          );
        }
      } catch (err) {
        console.warn('Supabase saveQuickLink fallback:', err);
      }
    }

    return updatedLink;
  },

  async saveQuickLinksList(links: QuickLinkItem[]): Promise<QuickLinkItem[]> {
    const sorted = [...links].sort(
      (a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99)
    );
    const allSections = sorted.flatMap((l) => l.sections || []);
    setStored('quick_links', sorted);
    setStored('quick_link_sections', allSections);

    if (supabase) {
      try {
        for (const l of sorted) {
          await supabase.from('quick_links').upsert({
            id: l.id,
            title: l.title,
            page_title: l.page_title || null,
            short_description: l.short_description || null,
            slug: l.slug,
            type: l.type,
            url: l.url,
            is_active: l.is_active,
            display_order: l.display_order,
            created_at: l.created_at,
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Supabase saveQuickLinksList fallback:', err);
      }
    }

    return sorted;
  },

  // Image upload handler
  async uploadProductImage(file: File): Promise<string> {
    return this.uploadImage(file);
  },

  async uploadImage(file: File): Promise<string> {
    if (supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('dryfood-images')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage.from('dryfood-images').getPublicUrl(filePath);
          return data.publicUrl;
        } else {
          console.warn('Supabase storage upload error:', uploadError);
        }
      } catch (err) {
        console.error('Upload exception:', err);
      }
    }

    // Client-side instant reader fallback for images
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  },

  // Complete SQL Schema script for direct execution in Supabase SQL editor
  getSupabaseSchemaSQL(): string {
    return `-- ============================================================================
-- SHAD SODAI — COMPLETE SUPABASE POSTGRESQL SCHEMA (PRODUCTS, ORDERS & CMS)
-- Copy & Run this entire script in your Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Categories Table
create table if not exists categories (
  id text primary key,
  name text not null,
  bn_name text,
  slug text unique not null,
  description text,
  image text,
  banner_image text,
  cover_photo text,
  display_order integer default 0,
  is_active boolean default true,
  show_on_homepage boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Products Table (Supports Apparel/Clothing & General Products)
create table if not exists products (
  id text primary key,
  name text not null,
  bn_name text,
  slug text unique not null,
  sku text,
  category_id text,
  category_name text,
  main_image text not null,
  gallery_images text[] default '{}',
  short_description text,
  long_description text,
  buying_price numeric default 0,
  selling_price numeric not null,
  discount_price numeric,
  original_price numeric,
  stock integer default 0,
  rating numeric default 5.0,
  review_count integer default 0,
  brand text default 'SHAD SODAI',
  sizes text[] default '{}',
  colors jsonb default '[]'::jsonb,
  fabric text,
  material text,
  fit text,
  pattern text,
  sleeve text,
  neck_collar text,
  gender text,
  season text,
  origin text,
  care_instructions text,
  exchange_policy text,
  size_chart jsonb default '[]'::jsonb,
  tags text[] default '{}',
  size_variants jsonb default '[]'::jsonb,
  ingredients text,
  nutrition jsonb default '{}'::jsonb,
  benefits text[] default '{}',
  how_to_use text,
  storage_instructions text,
  delivery_info text,
  seo_title text,
  seo_description text,
  status text default 'active',
  is_featured boolean default false,
  is_popular boolean default false,
  is_bestseller boolean default false,
  is_combo boolean default false,
  sale_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure all columns exist if products table was created earlier
alter table products add column if not exists original_price numeric;
alter table products add column if not exists brand text default 'SHAD SODAI';
alter table products add column if not exists sizes text[] default '{}';
alter table products add column if not exists colors jsonb default '[]'::jsonb;
alter table products add column if not exists fabric text;
alter table products add column if not exists material text;
alter table products add column if not exists fit text;
alter table products add column if not exists pattern text;
alter table products add column if not exists sleeve text;
alter table products add column if not exists neck_collar text;
alter table products add column if not exists gender text;
alter table products add column if not exists season text;
alter table products add column if not exists origin text;
alter table products add column if not exists care_instructions text;
alter table products add column if not exists exchange_policy text;
alter table products add column if not exists size_chart jsonb default '[]'::jsonb;
alter table products add column if not exists tags text[] default '{}';
alter table products add column if not exists size_variants jsonb default '[]'::jsonb;
alter table products add column if not exists is_featured boolean default false;
alter table products add column if not exists sale_count integer default 0;
alter table products drop constraint if exists products_sku_key;
alter table products drop constraint if exists products_category_id_fkey;

-- 3. Product Variants Table
create table if not exists product_variants (
  id text primary key,
  product_id text references products(id) on delete cascade,
  weight text default 'Standard',
  size text,
  color text,
  color_code text,
  image text,
  price numeric not null default 0,
  original_price numeric,
  stock integer default 10,
  sku text
);

alter table product_variants alter column weight drop not null;
alter table product_variants add column if not exists size text;
alter table product_variants add column if not exists color text;
alter table product_variants add column if not exists color_code text;
alter table product_variants add column if not exists image text;

-- 4. Customers Table
create table if not exists customers (
  id text primary key,
  user_id uuid,
  name text not null,
  email text,
  phone text,
  address text,
  city text default 'Dhaka',
  role text default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Orders Table (Supports Admin Add Order & Customer Checkout)
create table if not exists orders (
  id text primary key,
  order_number text unique not null,
  user_id text,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  customer_address text not null,
  customer_city text not null default 'Dhaka',
  order_notes text,
  subtotal numeric not null default 0,
  delivery_charge numeric not null default 0,
  discount numeric default 0,
  total numeric not null default 0,
  total_amount numeric default 0,
  payment_method text not null default 'cod',
  payment_status text default 'pending',
  order_status text default 'pending',
  courier_name text,
  tracking_id text,
  shipment_status text,
  shipment_date text,
  transaction_id text,
  sender_phone text,
  payment_proof text,
  is_incomplete boolean default false,
  bill_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table orders add column if not exists total_amount numeric default 0;
alter table orders add column if not exists courier_name text;
alter table orders add column if not exists tracking_id text;
alter table orders add column if not exists shipment_status text;
alter table orders add column if not exists shipment_date text;
alter table orders add column if not exists transaction_id text;
alter table orders add column if not exists sender_phone text;
alter table orders add column if not exists payment_proof text;
alter table orders add column if not exists is_incomplete boolean default false;
alter table orders add column if not exists bill_id text;

-- 6. Order Items Table (Links Ordered Products to Orders)
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text references orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  variant_weight text,
  variant_size text,
  variant_color text,
  quantity integer not null default 1,
  unit_price numeric not null default 0,
  total_price numeric not null default 0,
  image text
);

alter table order_items drop constraint if exists order_items_product_id_fkey;
alter table order_items add column if not exists variant_size text;
alter table order_items add column if not exists variant_color text;

-- 7. Payment Methods & Payment Records Tables
create table if not exists payment_methods (
  id text primary key,
  method text unique not null,
  title text not null,
  category text,
  account_type text,
  account_number text,
  account_name text,
  bank_name text,
  branch_name text,
  routing_number text,
  instructions text,
  logo_url text,
  is_enabled boolean default false,
  display_order integer default 1,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists payment_records (
  id text primary key,
  order_id text,
  order_number text,
  customer_id text,
  customer_name text,
  customer_phone text,
  payment_method text,
  account_type text,
  account_number text,
  amount numeric default 0,
  transaction_id text,
  sender_phone text,
  payment_proof text,
  status text default 'PENDING',
  admin_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  verified_at timestamp with time zone
);

-- 8. Reviews Table
create table if not exists reviews (
  id text primary key,
  product_id text,
  product_name text,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  verified_purchase boolean default true,
  status text default 'approved',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 9. Banners Table
create table if not exists banners (
  id text primary key,
  title text,
  subtitle text,
  button_text text default 'SHOP NOW',
  button_link text default '#shop',
  image_url text not null,
  type text default 'hero',
  is_active boolean default true,
  homepage_enabled boolean default true,
  product_id text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 10. Process Steps Table
create table if not exists process_steps (
  id text primary key,
  title text not null,
  short_description text not null,
  image_url text not null,
  video_url text,
  video_thumbnail text,
  display_order integer default 0,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 11. Support Messages Table
create table if not exists support_messages (
  id text primary key,
  user_id text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  subject text not null,
  message text not null,
  status text default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 12. Quick Links & Policy Pages Tables
create table if not exists quick_links (
  id text primary key,
  title text not null,
  page_title text,
  short_description text,
  slug text unique not null,
  type text not null default 'quick_link',
  url text not null,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists quick_link_sections (
  id text primary key,
  quick_link_id text references quick_links(id) on delete cascade,
  section_number integer default 1,
  heading text not null,
  content text,
  bullet_points text[] default '{}',
  display_order integer default 1,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 13. Row Level Security (RLS) & Full Access Policies for Storefront + Admin Panel
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payment_methods enable row level security;
alter table payment_records enable row level security;
alter table reviews enable row level security;
alter table banners enable row level security;
alter table process_steps enable row level security;
alter table support_messages enable row level security;
alter table quick_links enable row level security;
alter table quick_link_sections enable row level security;

drop policy if exists "Allow full access categories" on categories;
create policy "Allow full access categories" on categories for all using (true) with check (true);

drop policy if exists "Allow full access products" on products;
create policy "Allow full access products" on products for all using (true) with check (true);

drop policy if exists "Allow full access product_variants" on product_variants;
create policy "Allow full access product_variants" on product_variants for all using (true) with check (true);

drop policy if exists "Allow full access customers" on customers;
create policy "Allow full access customers" on customers for all using (true) with check (true);

drop policy if exists "Allow full access orders" on orders;
create policy "Allow full access orders" on orders for all using (true) with check (true);

drop policy if exists "Allow full access order_items" on order_items;
create policy "Allow full access order_items" on order_items for all using (true) with check (true);

drop policy if exists "Allow full access payment_methods" on payment_methods;
create policy "Allow full access payment_methods" on payment_methods for all using (true) with check (true);

drop policy if exists "Allow full access payment_records" on payment_records;
create policy "Allow full access payment_records" on payment_records for all using (true) with check (true);

drop policy if exists "Allow full access reviews" on reviews;
create policy "Allow full access reviews" on reviews for all using (true) with check (true);

drop policy if exists "Allow full access banners" on banners;
create policy "Allow full access banners" on banners for all using (true) with check (true);

drop policy if exists "Allow full access process_steps" on process_steps;
create policy "Allow full access process_steps" on process_steps for all using (true) with check (true);

drop policy if exists "Allow full access support_messages" on support_messages;
create policy "Allow full access support_messages" on support_messages for all using (true) with check (true);

drop policy if exists "Allow full access quick_links" on quick_links;
create policy "Allow full access quick_links" on quick_links for all using (true) with check (true);

drop policy if exists "Allow full access quick_link_sections" on quick_link_sections;
create policy "Allow full access quick_link_sections" on quick_link_sections for all using (true) with check (true);
`;
  },

  get SUPABASE_SCHEMA_SQL(): string {
    return this.getSupabaseSchemaSQL();
  },

  async seedDatabase(): Promise<void> {
    for (const cat of INITIAL_CATEGORIES) {
      await this.saveCategory(cat);
    }
    for (const prod of INITIAL_PRODUCTS) {
      await this.saveProduct(prod);
    }
    for (const step of INITIAL_PROCESS_STEPS) {
      await this.saveProcessStep(step);
    }
    await this.saveSettings(INITIAL_SETTINGS);
  }
};
