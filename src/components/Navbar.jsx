// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ShoppingCart } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  'Clothing & Fashion',
  'Accessories & Lifestyle',
  'Gadgets & Mobile Accessories',
  'Electronics & Study Gear',
  'Student Essentials',
];

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartItems = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Confirm logout on back-nav
  useEffect(() => {
    if (!user) return;
    window.history.pushState(null, '', window.location.href);
    const onPop = (e) => {
      e.preventDefault();
      if (window.confirm('Log out?')) {
        logout();
        navigate('/');
      } else {
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [user]);

  const toggleMobile = () => setMobileOpen((o) => !o);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-gradient-to-r from-primary-600 to-primary-400 shadow-navbar text-neutral-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold">
          <span className="text-accent-300">e</span>Store
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'font-semibold underline'
                : 'hover:text-neutral-100 transition'
            }
          >
            Home
          </NavLink>

          {/* Products Dropdown */}
          <div className="relative group">
            <NavLink
              to="/products"
              className="flex items-center hover:text-neutral-100 transition"
            >
              Products
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </NavLink>
            <div className="absolute left-0 mt-2 w-48 bg-milk dark:bg-neutral-800 rounded-2xl shadow-dropdown opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  className="block px-4 py-2 hover:bg-primary-50 dark:hover:bg-neutral-700"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <NavLink
            to="/cart"
            className="flex items-center hover:text-neutral-100 transition"
          >
            <ShoppingCart size={18} className="mr-1" />
            Cart
            {cartItems.length > 0 && (
              <span className="ml-1 text-xs bg-accent-300 text-white rounded-full px-2">
                {cartItems.length}
              </span>
            )}
          </NavLink>

          {user ? (
            <button
              onClick={() => {
                if (window.confirm('Log out?')) {
                  logout();
                  navigate('/');
                }
              }}
              className="flex items-center hover:text-neutral-100 transition"
            >
              <LogOut size={18} className="mr-1" /> Logout
            </button>
          ) : (
            <>
              <NavLink
                to="/login"
                className="hover:text-neutral-100 transition"
              >
                Log In
              </NavLink>
              <NavLink
                to="/signup"
                className="hover:text-neutral-100 transition"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={toggleMobile}
          aria-label="Toggle menu"
          className="md:hidden focus:outline-none"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-primary-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 overflow-hidden"
          >
            <div className="flex flex-col space-y-2 px-4 py-4">
              <NavLink
                to="/"
                onClick={toggleMobile}
                className="py-2 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded transition"
              >
                Home
              </NavLink>
              {/* Products accordion */}
              <details className="group">
                <summary className="py-2 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded cursor-pointer">
                  Products
                </summary>
                <div className="pl-4 mt-1 space-y-1">
                  {CATEGORIES.map((cat) => (
                    <NavLink
                      key={cat}
                      to={`/products?category=${encodeURIComponent(cat)}`}
                      onClick={toggleMobile}
                      className="block py-1 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded transition"
                    >
                      {cat}
                    </NavLink>
                  ))}
                </div>
              </details>
              <NavLink
                to="/cart"
                onClick={toggleMobile}
                className="flex items-center py-2 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded transition"
              >
                <ShoppingCart size={18} className="mr-1" />
                Cart
                {cartItems.length > 0 && (
                  <span className="ml-1 text-xs bg-accent-300 text-white rounded-full px-2">
                    {cartItems.length}
                  </span>
                )}
              </NavLink>
              {user ? (
                <button
                  onClick={() => {
                    toggleMobile();
                    if (window.confirm('Log out?')) {
                      logout();
                      navigate('/');
                    }
                  }}
                  className="py-2 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded transition flex items-center"
                >
                  <LogOut size={18} className="mr-1" /> Logout
                </button>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={toggleMobile}
                    className="py-2 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded transition"
                  >
                    Log In
                  </NavLink>
                  <NavLink
                    to="/signup"
                    onClick={toggleMobile}
                    className="py-2 hover:bg-primary-100 dark:hover:bg-neutral-700 rounded transition"
                  >
                    Sign Up
                  </NavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
