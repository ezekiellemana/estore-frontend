// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  X as CloseIcon,
  LogOut,
  User,
  ShoppingCart,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import useThemeStore from '../store/useThemeStore';
import LogoutConfirmationModal from './LogoutConfirmationModal';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartItems = useCartStore((s) => s.items);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Prevent back nav
  useEffect(() => {
    if (!user) return;
    window.history.pushState(null, '', window.location.href);
    const onPop = (e) => {
      e.preventDefault();
      setConfirmOpen(true);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [user]);

  const handleLogout = () => setConfirmOpen(true);
  const onConfirmLogout = () => {
    setConfirmOpen(false);
    logout();
    navigate('/');
  };
  const onCancelLogout = () => {
    setConfirmOpen(false);
    window.history.pushState(null, '', window.location.href);
  };

  const categories = [
    'Clothing & Fashion',
    'Accessories & Lifestyle',
    'Gadgets & Mobile Accessories',
    'Electronics & Study Gear',
    'Student Essentials',
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-x-0 top-0 z-50 bg-gradient-to-r from-primary-600 to-primary-400 text-white shadow-navbar"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-2xl font-extrabold hover:opacity-90 transition"
          >
            <span className="text-accent-300">e</span>Store
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-2 py-1 rounded-md ${
                  isActive ? 'font-semibold underline' : 'hover:bg-primary-500'
                }`
              }
            >
              Home
            </NavLink>

            <div className="relative group">
              <button className="flex items-center px-2 py-1 rounded-md hover:bg-primary-500 transition">
                Products
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-milk dark:bg-neutral-800 rounded-2xl shadow-dropdown opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    className="block px-4 py-2 hover:bg-primary-50 dark:hover:bg-neutral-700 transition"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `flex items-center px-2 py-1 rounded-md ${
                  isActive
                    ? 'font-semibold underline'
                    : 'hover:bg-primary-500'
                }`
              }
            >
              <ShoppingCart size={18} className="mr-1" /> Cart
              {cartItems.length > 0 && (
                <span className="ml-1 text-xs bg-accent-300 text-white rounded-full px-2">
                  {cartItems.length}
                </span>
              )}
            </NavLink>

            <button
              onClick={toggleTheme}
              className="p-1 rounded-md hover:bg-primary-500 transition"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center px-2 py-1 rounded-md hover:bg-primary-500 transition"
              >
                <LogOut size={18} className="mr-1" /> Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="px-2 py-1 rounded-md hover:bg-primary-500 transition"
                >
                  Log In
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-2 py-1 rounded-md hover:bg-primary-500 transition"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setDrawerOpen((o) => !o)}
            className="md:hidden p-1 rounded-md hover:bg-primary-500 transition"
          >
            {drawerOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-primary-50 dark:bg-neutral-900 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                <NavLink
                  to="/"
                  onClick={() => setDrawerOpen(false)}
                  className="block py-2 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded transition"
                >
                  Home
                </NavLink>
                <details className="group">
                  <summary className="py-2 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded cursor-pointer transition">
                    Products
                  </summary>
                  <div className="pl-4 mt-1 space-y-1">
                    {categories.map((cat) => (
                      <NavLink
                        key={cat}
                        to={`/products?category=${encodeURIComponent(cat)}`}
                        onClick={() => setDrawerOpen(false)}
                        className="block py-1 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded transition"
                      >
                        {cat}
                      </NavLink>
                    ))}
                  </div>
                </details>
                <NavLink
                  to="/cart"
                  onClick={() => setDrawerOpen(false)}
                  className="block py-2 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded transition"
                >
                  Cart
                </NavLink>
                {user ? (
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left py-2 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded transition"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      onClick={() => setDrawerOpen(false)}
                      className="block py-2 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded transition"
                    >
                      Log In
                    </NavLink>
                    <NavLink
                      to="/signup"
                      onClick={() => setDrawerOpen(false)}
                      className="block py-2 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded transition"
                    >
                      Sign Up
                    </NavLink>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <LogoutConfirmationModal
        open={confirmOpen}
        onConfirm={onConfirmLogout}
        onCancel={onCancelLogout}
      />
    </>
  );
}
