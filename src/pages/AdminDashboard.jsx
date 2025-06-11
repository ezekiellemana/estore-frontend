// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout';
import Breadcrumbs from '../components/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu as MenuIcon } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // redirect non-admins
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error('Admin access only.');
      navigate('/login', { replace: true });
    } else if (user === null) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  return (
    <AdminLayout>
      {/* mobile menu button */}
      <header className="md:hidden flex items-center justify-between bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" onClick={() => setDrawerOpen(true)}>
              <MenuIcon size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
      </header>

      {/* breadcrumb & page content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
          <Breadcrumbs />
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-900">
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
    </AdminLayout>
  );
}
