// src/components/Layout.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const [theme, setTheme] = useState('milk');

  // Initialize theme from localStorage or default to 'milk'
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
    else setTheme('milk');
  }, []);

  // Apply theme classes to <html> and persist changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('milk', theme === 'milk');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Cycle themes: milk → dark → light → milk...
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : theme === 'light' ? 'milk' : 'dark';
    setTheme(next);
  };

  // Determine background/text classes based on theme
  const themeClasses =
    theme === 'dark'
      ? 'bg-neutral-900 text-neutral-100'
      : theme === 'light'
      ? 'bg-neutral-50 text-neutral-800'
      : 'bg-milk text-neutral-800';

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ease-in-out ${themeClasses}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
