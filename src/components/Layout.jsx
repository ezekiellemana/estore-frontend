import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import Banner from './Banner';
import useAuthStore from '../store/useAuthStore';

export default function Layout() {
  const location = useLocation();
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const setSessionExpired = useAuthStore((s) => s.setSessionExpired);

  // Scroll to top on route change
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
      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 transition-colors">
        <Navbar />
        <main className="mt-16 flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence exitBeforeEnter initial={false}>
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
    </>
  );
}
