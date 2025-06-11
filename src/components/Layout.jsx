// src/components/Layout.jsx
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import Banner from './Banner';
import useAuthStore from '../store/useAuthStore';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in:      { opacity: 1, y: 0 },
  out:     { opacity: 0, y: -20 },
};
const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

export default function Layout() {
  const location = useLocation();
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const setSessionExpired = useAuthStore((s) => s.setSessionExpired);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <>
      {sessionExpired && (
        <Banner
          message="You were logged out for inactivity."
          onClose={() => setSessionExpired(false)}
        />
      )}

      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-gray-900 text-neutral-800 dark:text-neutral-200 transition-colors">
        <Navbar />

        {/* main offset so it never sits under the fixed navbar */}
        <main className="mt-16 flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </>
  );
}
