// src/App.jsx
import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import RedirectIfAdmin from './components/RedirectIfAdmin';

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

import useAuthStore from './store/useAuthStore';
import { useIdleSession } from './hooks/useIdleSession';
import IdleWarningModal from './components/IdleWarningModal';

export default function App() {
  const logout = useAuthStore((s) => s.logout);
  const setSessionExpired = useAuthStore((s) => s.setSessionExpired);
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  const [showWarning, setShowWarning] = React.useState(false);

  // Fetch session on app load
  useEffect(() => {
    if (hydrated && !user) {
      fetchUser();
    }
  }, [hydrated, user, fetchUser]);

  // Idle session management
  useIdleSession({
    timeout: 10 * 60 * 1000,
    warningTime: 60 * 1000,
    onWarning: () => {
      if (!useAuthStore.getState().skipIdleWarning) {
        setShowWarning(true);
      }
    },
    onLogout: () => {
      setShowWarning(false);
      logout();
      setSessionExpired(true);
    },
  });

  // Show loading until auth is ready
  if (!hydrated) {
    return (
      <div className="h-screen flex items-center justify-center text-lg text-neutral-500">
        Checking session…
      </div>
    );
  }

  // Guard for authenticated routes
  function RequireAuth({ children }) {
    const usr = useAuthStore((s) => s.user);
    const hyd = useAuthStore((s) => s.hydrated);
    const fetch = useAuthStore((s) => s.fetchUser);

    useEffect(() => {
      if (hyd && !usr) fetch();
    }, [hyd, usr, fetch]);

    if (!hyd) {
      return (
        <div className="h-screen flex items-center justify-center text-lg text-neutral-500">
          Checking session…
        </div>
      );
    }
    return usr ? children : <Navigate to="/login" replace />;
  }

  return (
    <>
      {/* Idle-timeout warning */}
      <IdleWarningModal
        isOpen={showWarning}
        warningDurationSec={60}
        onStayLoggedIn={() => setShowWarning(false)}
        onForceLogout={() => {
          setShowWarning(false);
          logout();
          setSessionExpired(true);
        }}
      />

      <Routes>
        {/* ===== ADMIN ===== */}
        <Route path="/admin/*" element={<AdminDashboard />}>
          {/* default /admin → /admin/users */}
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="analytics/charts" element={<AdminAnalyticsCharts />} />
        </Route>

        {/* ===== OAUTH CALLBACK ===== */}
        <Route path="/oauth" element={<OAuth />} />

        {/* ===== PUBLIC SHOP ===== */}
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
