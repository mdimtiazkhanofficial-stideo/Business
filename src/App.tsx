import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';

// Common Shell Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MenuDrawer } from './components/common/MenuDrawer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { FloatingContact } from './components/common/FloatingContact';
import { NotificationToast } from './components/common/NotificationToast';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './components/shop/ShopPage';
import { CategoriesPage } from './components/shop/CategoriesPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { SupportPage } from './pages/SupportPage';
import { MobileMenuPage } from './pages/MobileMenuPage';
import { ContactPage } from './components/common/ContactPage';
import { PolicyPage } from './pages/PolicyPage';

// Account & Auth Pages
import { AccountPage } from './pages/account/AccountPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { TrackOrderPage } from './pages/account/TrackOrderPage';

// Admin Pages & Modules
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminCustomers } from './components/admin/AdminCustomers';
import { AdminBanners } from './components/admin/AdminBanners';
import { AdminBranding } from './components/admin/AdminBranding';
import { AdminReviews } from './components/admin/AdminReviews';
import { AdminSupport } from './components/admin/AdminSupport';
import { AdminProcess } from './components/admin/AdminProcess';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';
import { AdminCustomerDetailPage } from './pages/admin/AdminCustomerDetailPage';
import { AdminCreateOrderPage } from './components/admin/AdminCreateOrderPage';
import { AdminCourierManagement } from './components/admin/AdminCourierManagement';
import { AdminStockManagement } from './components/admin/AdminStockManagement';
import { AdminCalculation } from './components/admin/AdminCalculation';
import { AdminSeoMaster } from './components/admin/AdminSeoMaster';
import { AdminPayments } from './components/admin/AdminPayments';
import { AdminQuickLinks } from './components/admin/AdminQuickLinks';

// Scroll to top on every navigation change
const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, search]);

  return null;
};

// Main Storefront Layout with Header, Footer & Floating Controls
const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-stone-800 font-sans selection:bg-[#1B4332] selection:text-white w-full max-w-full overflow-x-hidden relative">
      {/* Global Header */}
      <Header />

      {/* Global Slide-out Drawer */}
      <MenuDrawer />

      {/* Main Routed Page Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Direct Contact Floating Triggers */}
      <FloatingContact />

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Status & Feedback Notifications */}
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Direct Storefront Pages */}
          <Route element={<StorefrontLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-success/:orderId" element={<OrderSuccessPage />} />

            {/* Direct Account & Authentication Routes */}
            <Route path="account" element={<AccountPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="track-order" element={<TrackOrderPage />} />

            {/* Direct Support, Menu & Information Routes */}
            <Route path="support" element={<SupportPage />} />
            <Route path="menu" element={<MobileMenuPage />} />
            <Route path="contact" element={<ContactPage />} />

            {/* Direct Individual Policy Pages */}
            <Route path="terms-and-conditions" element={<PolicyPage fixedSlug="terms-and-conditions" />} />
            <Route path="privacy-policy" element={<PolicyPage fixedSlug="privacy-policy" />} />
            <Route path="shipping-and-delivery" element={<PolicyPage fixedSlug="shipping-and-delivery" />} />
            <Route path="return-and-refund" element={<PolicyPage fixedSlug="return-and-refund" />} />
            <Route path="payment-policy" element={<PolicyPage fixedSlug="payment-policy" />} />
            <Route path="customer-rules" element={<PolicyPage fixedSlug="customer-rules" />} />
            <Route path="report-an-issue" element={<PolicyPage fixedSlug="report-an-issue" />} />
            <Route path="policies/:slug" element={<PolicyPage />} />
          </Route>

          {/* Direct Admin Routes */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<AdminProducts mode="add" />} />
            <Route path="products/edit/:id" element={<AdminProducts mode="edit" />} />
            <Route path="products/featured" element={<AdminProducts mode="featured" />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="categories/add" element={<AdminCategories mode="add" />} />
            <Route path="categories/edit/:id" element={<AdminCategories mode="edit" />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/create" element={<AdminCreateOrderPage />} />
            <Route path="orders/complete" element={<AdminOrders />} />
            <Route path="orders/incomplete" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="stock" element={<AdminStockManagement />} />
            <Route path="calculation" element={<AdminCalculation />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
            <Route path="seo" element={<AdminSeoMaster />} />
            <Route path="settings" element={<AdminSettings subTab="general" />} />
            <Route path="settings/profile" element={<AdminSettings subTab="profile" />} />
            <Route path="settings/security" element={<AdminSettings subTab="security" />} />
            <Route path="couriers" element={<AdminCourierManagement />} />
            <Route path="branding" element={<AdminBranding />} />
            <Route path="quick-links" element={<AdminQuickLinks />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="process" element={<AdminProcess />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
