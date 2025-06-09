// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword'; // ← import the ForgotPassword page
import OAuth from './pages/OAuth';

import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAnalyticsCharts from './pages/admin/AdminAnalyticsCharts';
import AdminReviews from './pages/admin/AdminReviews'; // ← import the new Reviews page

import { ToastContainer } from 'react-toastify';
import useAuthStore from './store/useAuthStore';

// If an admin user tries to visit a “shop” page, kick them to /admin
function RedirectIfAdmin({ children }) {
  const user = useAuthStore((s) => s.user);
  React.useEffect(() => {
    if (user?.isAdmin) {
      window.location.replace('/admin');
    }
  }, [user]);
  return children;
}

// Only allow logged‐in (non-admin) users to see certain routes
function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    // If no user, redirect to login
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        {/* ============================= */}
        {/* 1) ADMIN SECTION (FULL-WIDTH) */}
        {/* ============================= */}
        <Route path="/admin/*" element={<AdminDashboard />}>
          <Route index element={<AdminUsers />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />          {/* ← New Reviews route */}
          <Route path="analytics/charts" element={<AdminAnalyticsCharts />} />
          {/* Catch-all for any other /admin paths */}
          <Route path="*" element={<Navigate to="users" replace />} />
        </Route>

        {/* =============================== */}
        {/* 2) OAUTH CALLBACK (no layout)  */}
        {/* =============================== */}
        <Route path="/oauth" element={<OAuth />} />

        {/* =============================== */}
        {/* 3) SHOP / PUBLIC SECTION       */}
        {/* =============================== */}
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

          {/* ==== FORCE LOGIN FOR CART ==== */}
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

          {/* Login / Signup */}
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

          {/* Forgot Password */}
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
