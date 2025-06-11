// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, ShoppingCart, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartItems = useCartStore((s) => s.items);
  const navigate = useNavigate();

  // Theme logic
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navClasses = "bg-gradient-to-r from-primary-500 to-primary-300 dark:from-neutral-800 dark:to-neutral-900 text-white shadow-navbar sticky top-0 z-50";
  const adminNavClasses = "bg-gradient-to-r from-primary-600 to-primary-400 text-white shadow-navbar sticky top-0 z-50";

  if (user?.isAdmin) {
    return (
      <motion.nav initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className={adminNavClasses}>
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <Link to="/admin" className="text-2xl font-extrabold tracking-tight">
            <span className="text-accent-300">Admin</span> Panel
          </Link>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleLogout} className="flex items-center bg-neutral-200 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-2xl transition shadow-sm">
              <LogOut size={18} className="mr-1 text-white" />
              <span className="text-white font-medium">Logout</span>
            </button>
          </div>
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.nav initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className={navClasses}>
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="text-accent">e</span>Store
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 items-center">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-white font-semibold underline underline-offset-4' : 'hover:text-neutral-100'}>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'text-white font-semibold underline underline-offset-4' : 'hover:text-neutral-100'}>
            Products
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => isActive ? 'text-white font-semibold flex items-center' : 'hover:text-neutral-100 flex items-center'}>
            <ShoppingCart size={18} className="mr-1" />
            Cart
            {cartItems.length > 0 && <span className="ml-1 text-xs bg-accent-300 text-white rounded-full px-2">{cartItems.length}</span>}
          </NavLink>

          {user ? (
            <>
              <NavLink to="/profile" className={({ isActive }) => isActive ? 'text-white font-semibold flex items-center' : 'hover:text-neutral-100 flex items-center'}>
                <User size={18} className="mr-1" />
                Profile
              </NavLink>
              <button onClick={handleLogout} className="flex items-center bg-neutral-200 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-2xl transition shadow-sm">
                <LogOut size={18} className="mr-1 text-white" />
                <span className="text-white font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'text-white font-semibold underline underline-offset-4' : 'hover:text-neutral-100'}>
                Log In
              </NavLink>
              <NavLink to="/signup" className={({ isActive }) => isActive ? 'text-white font-semibold underline underline-offset-4' : 'hover:text-neutral-100'}>
                Sign Up
              </NavLink>
            </>
          )}

          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden focus:outline-none" onClick={() => setIsOpen((prev) => !prev)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && !user?.isAdmin && (
        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} transition={{ duration: 0.3 }} className="md:hidden bg-gradient-to-b from-primary-500 to-primary-400">
          <NavLink to="/" onClick={() => setIsOpen(false)} className="block px-6 py-3 hover:bg-primary-600 transition">
            Home
          </NavLink>
          <NavLink to="/products" onClick={() => setIsOpen(false)} className="block px-6 py-3 hover:bg-primary-600 transition">
            Products
          </NavLink>
          <NavLink to="/cart" onClick={() => setIsOpen(false)} className="block px-6 py-3 hover:bg-primary-600 transition flex items-center">
            <ShoppingCart size={18} className="mr-1" /> Cart
            {cartItems.length > 0 && <span className="ml-1 text-xs bg-accent-300 text-white rounded-full px-2">{cartItems.length}</span>}
          </NavLink>

          {user ? (
            <>
              <NavLink to="/profile" onClick={() => setIsOpen(false)} className="block px-6 py-3 hover:bg-primary-600 transition flex items-center">
                <User size={18} className="mr-1" /> Profile
              </NavLink>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left px-6 py-3 hover:bg-primary-600 transition flex items-center bg-neutral-200 bg-opacity-20 rounded-b-lg">
                <LogOut size={18} className="mr-1 text-white" /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setIsOpen(false)} className="block px-6 py-3 hover:bg-primary-600 transition">Log In</NavLink>
              <NavLink to="/signup" onClick={() => setIsOpen(false)} className="block px-6 py-3 hover:bg-primary-600 transition">Sign Up</NavLink>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}
