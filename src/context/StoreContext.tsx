import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, Brand, CartItem, Order, OrderItem, Review, Banner, SiteSettings, ProductVariant, ProcessStep, User, Customer, SupportMessage, StockHistoryRecord, CalculationRecord, SeoSettings, AdminProfile, PaymentAccountConfig, PaymentRecord, QuickLinkItem } from '../types';
import { DataService, AuthService, isSupabaseConfigured, getActiveSupabaseConfig, updateSupabaseConfig, resetSupabaseConfig } from '../services/supabase';
import { INITIAL_QUICK_LINKS, INITIAL_BRANDS } from '../data/initialCatalog';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  banners: Banner[];
  reviews: Review[];
  allReviews: Review[];
  processSteps: ProcessStep[];
  settings: SiteSettings;
  loading: boolean;
  isSupabaseActive: boolean;

  // Supabase Database Connection
  supabaseConfig: { url: string; anonKey: string; isConfigured: boolean };
  connectSupabase: (url: string, anonKey: string) => Promise<{ success: boolean; message: string; tablesPending?: boolean }>;
  disconnectSupabase: () => Promise<void>;
  checkSupabaseHealth: () => Promise<{ connected: boolean; message: string; tablesPending?: boolean; productCount?: number }>;

  // Stock Management
  stockHistory: StockHistoryRecord[];
  adjustStock: (productId: string, adjustment: number, reason: string) => Promise<void>;

  // Calculations / Profit
  calculations: CalculationRecord[];
  saveCalculation: (calc: CalculationRecord) => Promise<void>;
  deleteCalculation: (id: string) => Promise<void>;

  // SEO Master
  seoSettings: SeoSettings;
  saveSeoSettings: (seo: SeoSettings) => Promise<void>;

  // Admin Profile
  adminProfile: AdminProfile;
  saveAdminProfile: (profile: AdminProfile) => Promise<void>;

  // Auth & Roles (TAZU MART Auth System)
  currentUser: User | null;
  authRole: 'customer' | 'admin' | 'guest';
  login: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (data: {
    name: string;
    phone: string;
    email: string;
    password?: string;
    address?: string;
    city?: string;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;

  // Customer Management & Support
  customers: Customer[];
  supportMessages: SupportMessage[];
  sendSupportMessage: (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => Promise<void>;
  submitSupportMessage: (data: {
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    subject: string;
    message: string;
  }) => Promise<void>;
  updateSupportMessageStatus: (id: string, status: SupportMessage['status']) => Promise<void>;

  // Quick Links & Policy Pages Management
  quickLinks: QuickLinkItem[];
  saveQuickLink: (link: QuickLinkItem) => Promise<void>;
  saveQuickLinksList: (links: QuickLinkItem[]) => Promise<void>;

  // Filters & Search
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Selected Product Modal/View
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  deliveryCharge: number;
  cartTotal: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Manual Payment System (Personal Accounts & Transactions)
  paymentConfigs: PaymentAccountConfig[];
  savePaymentConfig: (config: PaymentAccountConfig) => Promise<void>;
  paymentRecords: PaymentRecord[];
  createPaymentRecord: (record: PaymentRecord) => Promise<PaymentRecord>;
  verifyPayment: (paymentId: string, adminNote?: string) => Promise<void>;
  rejectPayment: (paymentId: string, adminNote?: string) => Promise<void>;

  // Checkout
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  placeOrder: (customerData: {
    name: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
    paymentMethod: string;
    transactionId?: string;
    senderPhone?: string;
    paymentProof?: string;
  }) => Promise<Order | null>;

  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order['order_status']) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  createManualOrder: (data: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    customer_address: string;
    customer_city: string;
    order_notes?: string;
    items: OrderItem[];
    payment_method: string;
    delivery_charge: number;
    payment_status?: 'pending' | 'paid' | 'rejected';
    order_status?: Order['order_status'];
    courier_name?: string;
    tracking_id?: string;
    shipment_status?: string;
    shipment_date?: string;
    transaction_id?: string;
    sender_phone?: string;
    payment_proof?: string;
  }) => Promise<Order>;

  // Admin Product, Category, Brand, Banner, Review & Process Management
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveBrand: (brand: Brand) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  saveBanner: (banner: Banner) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  saveProcessStep: (step: ProcessStep) => Promise<void>;
  deleteProcessStep: (id: string) => Promise<void>;
  addReview: (review: Review) => Promise<void>;
  updateReviewStatus: (id: string, status: 'approved' | 'pending') => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  saveSettings: (settings: SiteSettings) => Promise<void>;
  refreshData: () => Promise<void>;

  // Navigation & Modals
  activeTab: 'home' | 'shop' | 'categories' | 'process' | 'about' | 'contact' | 'admin';
  setActiveTab: (tab: 'home' | 'shop' | 'categories' | 'process' | 'about' | 'contact' | 'admin') => void;
  isAccountOpen: boolean;
  setIsAccountOpen: (open: boolean) => void;
  isSupportOpen: boolean;
  setIsSupportOpen: (open: boolean) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({} as SiteSettings);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistoryRecord[]>([]);
  const [calculations, setCalculations] = useState<CalculationRecord[]>([]);
  const [seoSettings, setSeoSettings] = useState<SeoSettings>({} as SeoSettings);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({} as AdminProfile);
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentAccountConfig[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLinkItem[]>(INITIAL_QUICK_LINKS);
  const [loading, setLoading] = useState<boolean>(true);
  const [supabaseConfig, setSupabaseConfigState] = useState(() => getActiveSupabaseConfig());
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(() => isSupabaseConfigured);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => AuthService.getCurrentUser());
  const authRole: 'customer' | 'admin' | 'guest' = currentUser ? currentUser.role : 'guest';

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'categories' | 'process' | 'about' | 'contact' | 'admin'>('home');
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Load Cart from localStorage with sanitization (never NaN or missing fields)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shadsodai_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];

      return parsed.map((item: any) => {
        const prod = item.product || {};
        const variant = item.selected_variant || {};
        const validTitle = item.product_name || prod.name || prod.title || 'Product';
        const validImage =
          item.product_image ||
          prod.main_image ||
          prod.image ||
          variant.image ||
          (Array.isArray(prod.gallery_images) && prod.gallery_images[0]) ||
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80';

        const rawPrice = item.price ?? variant.price ?? prod.selling_price ?? prod.price ?? 0;
        const numPrice = Number(rawPrice);
        const safePrice = !isNaN(numPrice) && numPrice > 0 ? numPrice : 0;
        const safeQty = Math.max(1, Number(item.quantity) || 1);
        const itemId = item.id || `item-${prod.id || Date.now()}`;

        return {
          id: itemId,
          product: {
            ...prod,
            id: prod.id || item.product_id || itemId,
            name: validTitle,
            main_image: validImage,
            selling_price: safePrice
          },
          selected_variant: {
            ...variant,
            id: variant.id || `var-${prod.id || itemId}`,
            price: safePrice,
            image: validImage
          },
          quantity: safeQty,
          product_id: prod.id || item.product_id || itemId,
          variant_id: variant.id || `var-${prod.id || itemId}`,
          product_name: validTitle,
          product_image: validImage,
          price: safePrice,
          weight: item.weight || [variant.size, variant.color].filter(Boolean).join(' / ') || '',
          size: variant.size || item.size,
          color: variant.color || item.color
        };
      });
    } catch {
      return [];
    }
  });

  // Load Wishlist from localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shadsodai_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save Cart to storage
  useEffect(() => {
    try {
      localStorage.setItem('shadsodai_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save Wishlist to storage
  useEffect(() => {
    try {
      localStorage.setItem('shadsodai_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Load all initial data from Supabase/DataService
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [cats, brds, prods, bans, revs, allRevs, procs, sets, ords, custs, msgs, stks, calcs, seo, adm, payCfgs, payRecs, qLinks] = await Promise.all([
        DataService.getCategories(),
        DataService.getBrands(),
        DataService.getProducts(),
        DataService.getAllBanners(),
        DataService.getReviews(),
        DataService.getAllReviews(),
        DataService.getProcessSteps(),
        DataService.getSettings(),
        DataService.getOrders(),
        DataService.getCustomers(),
        DataService.getSupportMessages(),
        DataService.getStockHistory(),
        DataService.getCalculations(),
        DataService.getSeoSettings(),
        DataService.getAdminProfile(),
        DataService.getPaymentConfigs(),
        DataService.getPaymentRecords(),
        DataService.getQuickLinks()
      ]);
      setCategories(cats);
      setBrands(brds);
      setProducts(prods);
      setBanners(bans);
      setReviews(revs);
      setAllReviews(allRevs);
      setProcessSteps(procs);
      setSettings(sets);
      setOrders(ords);
      setCustomers(custs);
      setSupportMessages(msgs);
      setStockHistory(stks);
      setCalculations(calcs);
      setSeoSettings(seo);
      setAdminProfile(adm);
      setPaymentConfigs(payCfgs);
      setPaymentRecords(payRecs);
      setQuickLinks(qLinks);
    } catch (err) {
      console.error('Error refreshing data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Supabase Database Connection Management
  const checkSupabaseHealth = useCallback(async () => {
    return await DataService.checkConnection();
  }, []);

  const connectSupabase = useCallback(
    async (url: string, anonKey: string) => {
      const res = updateSupabaseConfig(url, anonKey);
      if (!res.success) {
        showToast(res.error || 'Failed to initialize Supabase credentials.', 'error');
        return { success: false, message: res.error || 'Failed to initialize Supabase credentials.' };
      }

      setSupabaseConfigState(getActiveSupabaseConfig());
      setIsSupabaseActive(true);

      const health = await DataService.checkConnection();
      if (health.connected) {
        await refreshData();
        showToast(health.message, 'success');
        return { success: true, message: health.message, tablesPending: health.tablesPending, productCount: health.productCount };
      } else {
        showToast(health.message, 'error');
        return { success: false, message: health.message };
      }
    },
    [refreshData, showToast]
  );

  const disconnectSupabase = useCallback(async () => {
    resetSupabaseConfig();
    setSupabaseConfigState(getActiveSupabaseConfig());
    setIsSupabaseActive(false);
    await refreshData();
    showToast('Supabase disconnected. Using local database store.', 'info');
  }, [refreshData, showToast]);

  // Auth Methods
  const login = useCallback(
    async (emailOrPhone: string, password?: string) => {
      const res = await AuthService.signIn(emailOrPhone, password);
      if (res.user) {
        setCurrentUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`);
        return { success: true, user: res.user };
      }
      showToast(res.error || 'Login failed. Please check your credentials.', 'error');
      return { success: false, error: res.error };
    },
    [showToast]
  );

  const register = useCallback(
    async (data: {
      name: string;
      phone: string;
      email: string;
      password?: string;
      address?: string;
      city?: string;
    }) => {
      const res = await AuthService.signUp(data);
      if (res.user) {
        setCurrentUser(res.user);
        showToast(`Welcome to SHAD SODAI, ${res.user.name}!`);
        // refresh customer list
        const updatedCusts = await DataService.getCustomers();
        setCustomers(updatedCusts);
        return { success: true, user: res.user };
      }
      showToast(res.error || 'Registration failed.', 'error');
      return { success: false, error: res.error };
    },
    [showToast]
  );

  const logout = useCallback(async () => {
    await AuthService.signOut();
    setCurrentUser(null);
    showToast('Signed out successfully', 'info');
  }, [showToast]);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!currentUser) return false;
      const res = await AuthService.updateProfile(currentUser.id, data);
      if (res.user) {
        setCurrentUser(res.user);
        showToast('Profile updated successfully!');
        const updatedCusts = await DataService.getCustomers();
        setCustomers(updatedCusts);
        return true;
      }
      showToast('Failed to update profile', 'error');
      return false;
    },
    [currentUser, showToast]
  );

  // Customer Support Helpdesk
  const sendSupportMessage = useCallback(
    async (data: {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
    }) => {
      const newMsg: SupportMessage = {
        id: `msg-${Date.now()}`,
        user_id: currentUser?.id,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        subject: data.subject,
        message: data.message,
        status: 'new',
        created_at: new Date().toISOString()
      };
      await DataService.saveSupportMessage(newMsg);
      setSupportMessages((prev) => [newMsg, ...prev]);
      showToast('Your message has been sent to SHAD SODAI Support! We will reply promptly.');
    },
    [currentUser, showToast]
  );

  const updateSupportMessageStatus = useCallback(
    async (id: string, status: SupportMessage['status']) => {
      await DataService.updateSupportMessageStatus(id, status);
      setSupportMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      showToast(`Message marked as ${status}`);
    },
    [showToast]
  );

  const submitSupportMessage = useCallback(
    async (data: {
      customer_name: string;
      customer_email: string;
      customer_phone?: string;
      subject: string;
      message: string;
    }) => {
      await sendSupportMessage({
        name: data.customer_name,
        email: data.customer_email,
        phone: data.customer_phone,
        subject: data.subject,
        message: data.message
      });
    },
    [sendSupportMessage]
  );

  const saveQuickLink = useCallback(
    async (link: QuickLinkItem) => {
      await DataService.saveQuickLink(link);
      const updated = await DataService.getQuickLinks();
      setQuickLinks(updated);
      showToast(`"${link.title}" updated successfully!`);
    },
    [showToast]
  );

  const saveQuickLinksList = useCallback(
    async (links: QuickLinkItem[]) => {
      const updated = await DataService.saveQuickLinksList(links);
      setQuickLinks(updated);
      showToast('Quick Links order and status saved!');
    },
    [showToast]
  );

  // Cart operations
  const addToCart = useCallback(
    (product: Product, variant?: ProductVariant, quantity: number = 1) => {
      if (!product) return;

      // 1. Resolve valid product image
      const validImage =
        variant?.image ||
        product.main_image ||
        (product as any).image ||
        (Array.isArray(product.gallery_images) && product.gallery_images.length > 0 ? product.gallery_images[0] : '') ||
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80';

      // 2. Resolve safe numeric prices
      const rawPrice = variant?.price ?? product.selling_price ?? (product as any).price ?? 0;
      const numPrice = Number(rawPrice);
      const safePrice = !isNaN(numPrice) && numPrice > 0 ? numPrice : 0;

      const rawOriginalPrice = variant?.original_price ?? product.discount_price ?? safePrice;
      const numOriginalPrice = Number(rawOriginalPrice);
      const safeOriginalPrice = !isNaN(numOriginalPrice) && numOriginalPrice > 0 ? numOriginalPrice : safePrice;

      const validTitle = product.name || (product as any).title || 'Product';

      // 3. Resolve variant
      const selectedVar: ProductVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : {
        id: `var-${product.id}`,
        size: 'Standard',
        price: safePrice,
        original_price: safeOriginalPrice,
        stock: product.stock || 99,
        image: validImage
      });

      selectedVar.price = safePrice;
      selectedVar.original_price = safeOriginalPrice;
      if (!selectedVar.image) {
        selectedVar.image = validImage;
      }

      const variantKey = [selectedVar.id, selectedVar.size, selectedVar.color].filter(Boolean).join('_') || 'std';
      const cartItemId = `${product.id}_${variantKey}`;
      const safeQty = Math.max(1, Number(quantity) || 1);

      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (item) =>
            item.id === cartItemId ||
            (item.product_id === product.id && item.variant_id === selectedVar.id) ||
            (item.product?.id === product.id && item.selected_variant?.id === selectedVar.id)
        );

        if (existingIndex > -1) {
          const updated = [...prevCart];
          const existing = updated[existingIndex];
          const currentQty = Math.max(1, Number(existing.quantity) || 1);
          updated[existingIndex] = {
            ...existing,
            quantity: currentQty + safeQty,
            price: safePrice,
            product_image: validImage,
            product_name: validTitle
          };
          return updated;
        }

        const newCartItem: CartItem = {
          id: cartItemId,
          product: {
            ...product,
            name: validTitle,
            main_image: validImage,
            selling_price: safePrice
          },
          selected_variant: selectedVar,
          quantity: safeQty,
          product_id: product.id,
          variant_id: selectedVar.id,
          product_name: validTitle,
          product_image: validImage,
          price: safePrice,
          weight: [selectedVar.size, selectedVar.color].filter(Boolean).join(' / ') || selectedVar.weight || '',
          size: selectedVar.size,
          color: selectedVar.color
        };

        return [...prevCart, newCartItem];
      });

      const variantLabel = [selectedVar.size, selectedVar.color].filter(Boolean).join(' / ');
      showToast(`Added "${validTitle}"${variantLabel ? ` (${variantLabel})` : ''} to cart!`);
    },
    [showToast]
  );

  const removeFromCart = useCallback((cartItemIdOrProductId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (item.id === cartItemIdOrProductId) return false;
        if (variantId && (item.product_id === cartItemIdOrProductId || item.product?.id === cartItemIdOrProductId)) {
          if (item.variant_id === variantId || item.selected_variant?.id === variantId) return false;
        }
        if (!variantId && (item.product_id === cartItemIdOrProductId || item.product?.id === cartItemIdOrProductId)) {
          return false;
        }
        return true;
      })
    );
  }, []);

  const updateCartQuantity = useCallback(
    (cartItemIdOrProductId: string, quantityOrVariantId: number | string, newQuantity?: number) => {
      let targetId = cartItemIdOrProductId;
      let targetVariantId: string | undefined = undefined;
      let targetQty: number;

      if (typeof quantityOrVariantId === 'number') {
        targetQty = quantityOrVariantId;
      } else {
        targetVariantId = quantityOrVariantId;
        targetQty = newQuantity ?? 1;
      }

      if (targetQty <= 0) {
        removeFromCart(targetId, targetVariantId);
        return;
      }

      setCart((prev) =>
        prev.map((item) => {
          const isMatch =
            item.id === targetId ||
            (targetVariantId && (item.product_id === targetId || item.product?.id === targetId) && (item.variant_id === targetVariantId || item.selected_variant?.id === targetVariantId)) ||
            (!targetVariantId && (item.product_id === targetId || item.product?.id === targetId));

          return isMatch ? { ...item, quantity: targetQty } : item;
        })
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const cartSubtotal = cart.reduce((sum, item) => {
    const rawPrice = item.price ?? item.selected_variant?.price ?? item.product?.selling_price ?? 0;
    const numPrice = Number(rawPrice);
    const safePrice = !isNaN(numPrice) && numPrice > 0 ? numPrice : 0;
    const itemQty = Math.max(0, Number(item.quantity) || 0);
    return sum + safePrice * itemQty;
  }, 0);

  const deliveryCharge =
    cartSubtotal >= (settings.free_delivery_min_order || 50) || cartSubtotal === 0
      ? 0
      : settings.delivery_inside_dhaka || 5;
  const cartTotal = cartSubtotal + deliveryCharge;

  // Wishlist
  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          showToast('Removed from wishlist', 'info');
          return prev.filter((id) => id !== productId);
        } else {
          showToast('Added to wishlist', 'success');
          return [...prev, productId];
        }
      });
    },
    [showToast]
  );

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  // Order Placement (Manual Payment System)
  const placeOrder = useCallback(
    async (customerData: {
      name: string;
      phone: string;
      address: string;
      city: string;
      notes?: string;
      paymentMethod: string;
      transactionId?: string;
      senderPhone?: string;
      paymentProof?: string;
    }): Promise<Order | null> => {
      if (cart.length === 0) return null;

      const orderNumber = `SG-${Date.now().toString().slice(-6)}`;
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        order_number: orderNumber,
        user_id: currentUser?.id,
        customer_name: customerData.name,
        customer_email: currentUser?.email,
        customer_phone: customerData.phone,
        customer_address: customerData.address,
        customer_city: customerData.city,
        order_notes: customerData.notes,
        items: cart.map((c) => ({
          product_id: c.product.id,
          product_name: c.product.name,
          variant_weight: [c.selected_variant.size, c.selected_variant.color].filter(Boolean).join(' / ') || c.selected_variant.weight || 'Standard',
          variant_size: c.selected_variant.size,
          variant_color: c.selected_variant.color,
          quantity: c.quantity,
          unit_price: c.selected_variant.price,
          total_price: c.selected_variant.price * c.quantity,
          image: c.selected_variant.image || c.product.main_image
        })),
        subtotal: cartSubtotal,
        delivery_charge: deliveryCharge,
        discount: 0,
        total: cartTotal,
        total_amount: cartTotal,
        payment_method: customerData.paymentMethod,
        payment_status: 'pending', // REQUIRED: "After customer submits payment information: Order payment status = PENDING"
        order_status: 'pending',
        transaction_id: customerData.transactionId,
        sender_phone: customerData.senderPhone,
        payment_proof: customerData.paymentProof,
        created_at: new Date().toISOString()
      };

      await DataService.createOrder(newOrder);

      // Create linked PaymentRecord
      const matchedConfig = paymentConfigs.find(
        (c) => c.method === customerData.paymentMethod || c.title.toLowerCase() === customerData.paymentMethod.toLowerCase()
      );

      const isCod = customerData.paymentMethod === 'cod' || customerData.paymentMethod.toLowerCase().includes('cash');
      const newPaymentRecord: PaymentRecord = {
        id: `pay-${Date.now()}`,
        order_id: newOrder.id,
        order_number: newOrder.order_number,
        customer_id: currentUser?.id,
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        payment_method: matchedConfig?.title || customerData.paymentMethod,
        account_type: matchedConfig?.account_type || (isCod ? 'COD' : 'Personal'),
        account_number: matchedConfig?.account_number || (isCod ? 'N/A (Cash on Delivery)' : 'Personal Account'),
        amount: cartTotal,
        transaction_id: customerData.transactionId || (isCod ? 'COD' : 'N/A'),
        sender_phone: customerData.senderPhone || customerData.phone,
        payment_proof: customerData.paymentProof,
        status: 'PENDING',
        admin_note: '',
        created_at: new Date().toISOString()
      };

      await DataService.createPaymentRecord(newPaymentRecord);
      setPaymentRecords((prev) => [newPaymentRecord, ...prev]);

      setOrders((prev) => [newOrder, ...prev]);
      const updatedCusts = await DataService.getCustomers();
      setCustomers(updatedCusts);
      clearCart();
      setIsCheckoutOpen(false);
      showToast(`Order #${orderNumber} placed successfully! Payment status is PENDING verification.`);
      return newOrder;
    },
    [cart, cartSubtotal, deliveryCharge, cartTotal, clearCart, showToast, currentUser, paymentConfigs]
  );

  // Manual Payment System Handlers
  const savePaymentConfig = useCallback(async (config: PaymentAccountConfig) => {
    await DataService.savePaymentConfig(config);
    setPaymentConfigs((prev) => {
      const idx = prev.findIndex((c) => c.id === config.id || c.method === config.method);
      if (idx >= 0) {
        return prev.map((c) => (c.id === config.id || c.method === config.method ? config : c));
      }
      return [...prev, config];
    });
    showToast(`Payment method "${config.title}" updated successfully!`, 'success');
  }, [showToast]);

  const createPaymentRecord = useCallback(async (record: PaymentRecord) => {
    const saved = await DataService.createPaymentRecord(record);
    setPaymentRecords((prev) => [saved, ...prev]);
    return saved;
  }, []);

  const verifyPayment = useCallback(async (paymentId: string, adminNote?: string) => {
    const res = await DataService.verifyPayment(paymentId, adminNote);
    if (res) {
      setPaymentRecords((prev) => prev.map((p) => (p.id === paymentId ? res : p)));
      setOrders((prev) =>
        prev.map((o) =>
          o.id === res.order_id || o.order_number === res.order_number
            ? { ...o, payment_status: 'paid' }
            : o
        )
      );
      showToast(`Payment #${paymentId} verified and marked as PAID!`, 'success');
    }
  }, [showToast]);

  const rejectPayment = useCallback(async (paymentId: string, adminNote?: string) => {
    const res = await DataService.rejectPayment(paymentId, adminNote);
    if (res) {
      setPaymentRecords((prev) => prev.map((p) => (p.id === paymentId ? res : p)));
      setOrders((prev) =>
        prev.map((o) =>
          o.id === res.order_id || o.order_number === res.order_number
            ? { ...o, payment_status: 'rejected' }
            : o
        )
      );
      showToast(`Payment #${paymentId} marked as REJECTED.`, 'info');
    }
  }, [showToast]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['order_status']) => {
    await DataService.updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, order_status: status } : o)));
  }, []);

  const updateOrder = useCallback(async (order: Order) => {
    await DataService.updateOrder(order);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    showToast(`Order #${order.order_number} updated successfully!`, 'success');
  }, [showToast]);

  const deleteOrder = useCallback(async (orderId: string) => {
    await DataService.deleteOrder(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast('Order deleted successfully!', 'success');
  }, [showToast]);

  const createManualOrder = useCallback(async (data: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    customer_address: string;
    customer_city: string;
    order_notes?: string;
    items: OrderItem[];
    payment_method: string;
    delivery_charge: number;
    payment_status?: 'pending' | 'paid' | 'rejected';
    order_status?: Order['order_status'];
    courier_name?: string;
    tracking_id?: string;
    shipment_status?: string;
    shipment_date?: string;
    transaction_id?: string;
    sender_phone?: string;
    payment_proof?: string;
  }) => {
    const orderNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const subtotal = data.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const total = subtotal + data.delivery_charge;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      customer_name: data.customer_name.trim(),
      customer_email: data.customer_email?.trim(),
      customer_phone: data.customer_phone.trim(),
      customer_address: data.customer_address.trim(),
      customer_city: data.customer_city.trim() || 'Dhaka',
      order_notes: data.order_notes?.trim(),
      items: data.items,
      subtotal,
      delivery_charge: data.delivery_charge,
      discount: 0,
      total,
      total_amount: total,
      payment_method: data.payment_method,
      payment_status: data.payment_status || 'pending',
      order_status: data.order_status || 'pending',
      courier_name: data.courier_name,
      tracking_id: data.tracking_id,
      shipment_status: data.shipment_status,
      shipment_date: data.shipment_date,
      transaction_id: data.transaction_id,
      sender_phone: data.sender_phone,
      payment_proof: data.payment_proof,
      created_at: new Date().toISOString()
    };

    await DataService.createOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Manual order #${orderNumber} created successfully!`, 'success');
    return newOrder;
  }, [showToast]);

  // Admin Actions
  const saveProduct = useCallback(
    async (product: Product) => {
      await DataService.saveProduct(product);
      await refreshData();
      showToast('Product saved to database successfully!');
    },
    [refreshData, showToast]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await DataService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      await refreshData();
      showToast('Product deleted from database', 'info');
    },
    [refreshData, showToast]
  );

  const saveCategory = useCallback(
    async (category: Category) => {
      await DataService.saveCategory(category);
      await refreshData();
      showToast('Category saved successfully!');
    },
    [refreshData, showToast]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await DataService.deleteCategory(id);
      await refreshData();
      showToast('Category removed', 'info');
    },
    [refreshData, showToast]
  );

  const saveBrand = useCallback(
    async (brand: Brand) => {
      await DataService.saveBrand(brand);
      await refreshData();
      showToast('Brand saved to database!');
    },
    [refreshData, showToast]
  );

  const deleteBrand = useCallback(
    async (id: string) => {
      await DataService.deleteBrand(id);
      setBrands((prev) => prev.filter((b) => b.id !== id));
      await refreshData();
      showToast('Brand removed from database', 'info');
    },
    [refreshData, showToast]
  );

  const saveBanner = useCallback(
    async (banner: Banner) => {
      await DataService.saveBanner(banner);
      await refreshData();
      showToast('Banner saved successfully!');
    },
    [refreshData, showToast]
  );

  const deleteBanner = useCallback(
    async (id: string) => {
      await DataService.deleteBanner(id);
      await refreshData();
      showToast('Banner removed', 'info');
    },
    [refreshData, showToast]
  );

  const saveProcessStep = useCallback(
    async (step: ProcessStep) => {
      await DataService.saveProcessStep(step);
      await refreshData();
      showToast('Process step saved successfully!');
    },
    [refreshData, showToast]
  );

  const deleteProcessStep = useCallback(
    async (id: string) => {
      await DataService.deleteProcessStep(id);
      await refreshData();
      showToast('Process step removed', 'info');
    },
    [refreshData, showToast]
  );

  const addReview = useCallback(
    async (review: Review) => {
      await DataService.addReview(review);
      await refreshData();
      showToast('Thank you! Your review has been submitted to SHAD SODAI.');
    },
    [refreshData, showToast]
  );

  const updateReviewStatus = useCallback(
    async (id: string, status: 'approved' | 'pending') => {
      await DataService.updateReviewStatus(id, status);
      await refreshData();
      showToast(`Review marked as ${status}`);
    },
    [refreshData, showToast]
  );

  const deleteReview = useCallback(
    async (id: string) => {
      await DataService.deleteReview(id);
      await refreshData();
      showToast('Review removed', 'info');
    },
    [refreshData, showToast]
  );

  const saveSettings = useCallback(
    async (newSettings: SiteSettings) => {
      await DataService.saveSettings(newSettings);
      setSettings(newSettings);
      showToast('Store settings updated successfully');
    },
    [showToast]
  );

  // Stock Adjustment Action
  const adjustStock = useCallback(
    async (productId: string, adjustment: number, reason: string) => {
      const updatedProd = await DataService.adjustProductStock(productId, adjustment, reason);
      if (updatedProd) {
        await refreshData();
        showToast(`Stock updated: ${updatedProd.name} is now ${updatedProd.stock} units`);
      } else {
        showToast('Failed to adjust stock', 'error');
      }
    },
    [refreshData, showToast]
  );

  // Calculation Actions
  const saveCalculation = useCallback(
    async (calc: CalculationRecord) => {
      await DataService.saveCalculation(calc);
      await refreshData();
      showToast('Calculation saved successfully!');
    },
    [refreshData, showToast]
  );

  const deleteCalculation = useCallback(
    async (id: string) => {
      await DataService.deleteCalculation(id);
      await refreshData();
      showToast('Calculation removed', 'info');
    },
    [refreshData, showToast]
  );

  // SEO Actions
  const saveSeoSettings = useCallback(
    async (seo: SeoSettings) => {
      await DataService.saveSeoSettings(seo);
      setSeoSettings(seo);
      showToast('SEO settings saved successfully!');
    },
    [showToast]
  );

  // Admin Profile Actions
  const saveAdminProfile = useCallback(
    async (profile: AdminProfile) => {
      await DataService.saveAdminProfile(profile);
      setAdminProfile(profile);
      showToast('Admin profile updated successfully!');
    },
    [showToast]
  );

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        brands,
        banners,
        reviews,
        allReviews,
        processSteps,
        settings,
        loading,
        isSupabaseActive,
        supabaseConfig,
        connectSupabase,
        disconnectSupabase,
        checkSupabaseHealth,
        stockHistory,
        adjustStock,
        calculations,
        saveCalculation,
        deleteCalculation,
        seoSettings,
        saveSeoSettings,
        adminProfile,
        saveAdminProfile,
        currentUser,
        authRole,
        login,
        register,
        logout,
        updateProfile,
        customers,
        supportMessages,
        sendSupportMessage,
        submitSupportMessage,
        updateSupportMessageStatus,
        quickLinks,
        saveQuickLink,
        saveQuickLinksList,
        selectedCategoryId,
        setSelectedCategoryId,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        setSelectedProduct,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        deliveryCharge,
        cartTotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        isCheckoutOpen,
        setIsCheckoutOpen,
        placeOrder,
        paymentConfigs,
        savePaymentConfig,
        paymentRecords,
        createPaymentRecord,
        verifyPayment,
        rejectPayment,
        orders,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        createManualOrder,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        saveBrand,
        deleteBrand,
        saveBanner,
        deleteBanner,
        saveProcessStep,
        deleteProcessStep,
        addReview,
        updateReviewStatus,
        deleteReview,
        saveSettings,
        refreshData,
        activeTab,
        setActiveTab,
        isAccountOpen,
        setIsAccountOpen,
        isSupportOpen,
        setIsSupportOpen,
        isMenuOpen,
        setIsMenuOpen,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
