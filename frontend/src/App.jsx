import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import useAuthStore from './store/useAuthStore';
// import SEO from './components/SEO';
import useSiteMetadata from './hooks/useSiteMetadata';
import ScrollToTop from './components/ScrollToTop';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import OrderFailed from './pages/OrderFailed';
import OrderCancelled from './pages/OrderCancelled';
import TamaraCallback from './pages/TamaraCallback';
import Deals from './pages/Deals';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import ReturnPolicy from './pages/ReturnPolicy';
import SearchResults from './pages/SearchResults';
import CustomerAnalytics from './pages/CustomerAnalytics';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

import OrderDetails from './pages/OrderDetails';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminCustomers from './pages/admin/Customers';
import AdminSettings from './pages/admin/Settings';
import AdminAddProduct from './pages/admin/AddProduct';
import AdminEditProduct from './pages/admin/EditProduct';
import AdminHomepageBuilder from './pages/admin/HomepageBuilder';
import AdminOrderDetails from './pages/admin/OrderDetails';
import AdminCategories from './pages/admin/Categories';
import AdminDeals from './pages/admin/Deals';
import TapPaymentSettings from './pages/admin/TapPaymentSettings';
import TamaraPaymentSettings from './pages/admin/TamaraPaymentSettings';

import ThemeSettings from './pages/admin/ThemeSettings';
import FooterSettings from './pages/admin/FooterSettings';
import LegalPages from './pages/admin/LegalPages';
import SEOManager from './pages/admin/SEOManager';
import Analytics from './pages/admin/Analytics';
import BlogManager from './pages/admin/BlogManager';

function App() {
  const { i18n } = useTranslation();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const { siteMetadata, loading: metadataLoading } = useSiteMetadata();

  useEffect(() => {
    // Set document direction based on language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    // Initialize auth from localStorage
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      {/* مكون التمرير إلى أعلى الصفحة */}
      <ScrollToTop />
      
      {/* SEO will be handled by individual pages */}
      <Toaster 
        position={i18n.language === 'ar' ? 'top-left' : 'top-right'}
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'Cairo, sans-serif',
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:orderId" element={<OrderSuccess />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="order-failed" element={<OrderFailed />} />
          <Route path="order-cancelled" element={<OrderCancelled />} />
          <Route path="tamara-callback" element={<TamaraCallback />} />
          
          {/* Auth */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* User Account */}
          <Route path="account" element={<Account />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="my-analytics" element={<CustomerAnalytics />} />
          
          {/* Deals */}
          <Route path="deals" element={<Deals />} />
          
          {/* Blog */}
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          
          {/* Info Pages */}
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsConditions />} />
          <Route path="return-policy" element={<ReturnPolicy />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add" element={<AdminAddProduct />} />
          <Route path="products/edit/:id" element={<AdminEditProduct />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="blog" element={<BlogManager />} />
          <Route path="homepage-builder" element={<AdminHomepageBuilder />} />
          <Route path="distribution" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">التوزيع - قريباً</h1></div>} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="theme-settings" element={<ThemeSettings />} />
          <Route path="footer-settings" element={<FooterSettings />} />
          <Route path="legal-pages" element={<LegalPages />} />
          <Route path="tap-payment-settings" element={<TapPaymentSettings />} />
          <Route path="tamara-payment-settings" element={<TamaraPaymentSettings />} />

          <Route path="seo" element={<SEOManager />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
