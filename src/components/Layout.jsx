// src/components/Layout.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { Sun, Moon } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const [theme, setTheme] = useState('light');

  // On mount, read preferred theme
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
    }
  }, []);

  // Apply theme class and persist
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 transition-colors duration-300 ease-in-out">
      <Navbar />

      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-neutral-800 shadow-md hover:scale-105 transition-transform"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
