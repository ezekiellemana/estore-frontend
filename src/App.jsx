import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import OAuth from './pages/OAuth';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAnalyticsCharts from './pages/admin/AdminAnalyticsCharts';
import AdminReviews from './pages/admin/AdminReviews';
import { ToastContainer } from 'react-toastify';
import useAuthStore from './store/useAuthStore';

// 1️⃣ Redirect logged-in admin users away from public routes
function RedirectIfAdmin({ children }) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  React.useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin/users', { replace: true });
    }
  }, [user, navigate]);
  return children;
}

// 2️⃣ Protect user-only routes
function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  // Fetch user on hydration if not set
  React.useEffect(() => {
    if (hydrated && !user) {
      fetchUser();
    }
  }, [hydrated, user, fetchUser]);

  if (!hydrated) {
    // You can style this however you want, or use a spinner!
    return (
      <div className="h-screen flex items-center justify-center text-lg text-neutral-500">
        Checking session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 3️⃣ App entry
export default function App() {
  // Fetch user session on startup for public pages as well (optional, more seamless)
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  React.useEffect(() => {
    if (hydrated && !user) {
      fetchUser();
    }
  }, [hydrated, user, fetchUser]);

  if (!hydrated) {
    return (
      <div className="h-screen flex items-center justify-center text-lg text-neutral-500">
        Checking session...
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* ========== ADMIN SECTION ========== */}
        <Route path="/admin/*" element={<AdminDashboard />}>
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="analytics/charts" element={<AdminAnalyticsCharts />} />
          <Route path="*" element={<Navigate to="users" replace />} />
        </Route>

        {/* ========== OAUTH CALLBACK ========== */}
        <Route path="/oauth" element={<OAuth />} />

        {/* ========== PUBLIC SHOP SECTION ========== */}
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <RedirectIfAdmin>
                <Home />
              </RedirectIfAdmin>
            }
          />
          <Route
            path="/products"
            element={
              <RedirectIfAdmin>
                <Products />
              </RedirectIfAdmin>
            }
          />
          <Route
            path="/products/:id"
            element={
              <RedirectIfAdmin>
                <ProductDetails />
              </RedirectIfAdmin>
            }
          />
          <Route
            path="/cart"
            element={
              <RequireAuth>
                <RedirectIfAdmin>
                  <Cart />
                </RedirectIfAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <RedirectIfAdmin>
                  <Checkout />
                </RedirectIfAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectIfAdmin>
                <Login />
              </RedirectIfAdmin>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectIfAdmin>
                <Signup />
              </RedirectIfAdmin>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <RedirectIfAdmin>
                <ForgotPassword />
              </RedirectIfAdmin>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <RedirectIfAdmin>
                  <Profile />
                </RedirectIfAdmin>
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      <ToastContainer position="bottom-right" />
    </>
  );
}
