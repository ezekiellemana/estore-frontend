// src/pages/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { toast } from 'react-toastify';
import AdminSidebar from '../components/AdminSidebar';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error('Admin access only.');
      navigate('/login', { replace: true });
    } else if (user === null) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)]"> 
        {/* calc deducts Layout’s navbar height (4rem) */}
        <AdminSidebar />

        <main className="flex-1 overflow-auto p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-800">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </Layout>
  );
}
