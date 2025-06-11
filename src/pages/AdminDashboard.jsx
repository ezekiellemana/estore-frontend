// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  User,
  FilePlus,
  BarChart2,
  Tag,
  ShoppingCart,
  LogOut,
  Menu as MenuIcon,
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const LINKS = [
  { to: '/admin/users', label: 'Users', icon: <User size={20}/> },
  { to: '/admin/products', label: 'Products', icon: <FilePlus size={20}/> },
  { to: '/admin/categories', label: 'Categories', icon: <Tag size={20}/> },
  { to: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={20}/> },
  { to: '/admin/reviews', label: 'Reviews', icon: <FilePlus size={20}/> },
  { to: '/admin/analytics/charts', label: 'Analytics', icon: <BarChart2 size={20}/> },
];

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error('Admin access only.');
      navigate('/login', { replace: true });
    } else if (user === null) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Sidebar content extracted
  const Sidebar = () => (
    <div className="h-full flex flex-col bg-primary-700 text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary-800">
        <h1 className="text-lg font-bold">eStore Admin</h1>
        <SheetClose asChild>
          <Button variant="ghost" className="md:hidden p-1">
            <MenuIcon size={20}/>
          </Button>
        </SheetClose>
      </div>
      <ScrollArea className="flex-grow px-2 py-4 space-y-1">
        {LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg transition ${
                isActive ? 'bg-primary-800' : 'hover:bg-primary-600'
              }`
            }
          >
            <span className="mr-2">{icon}</span>
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </ScrollArea>
      <div className="px-3 py-3 border-t border-primary-800 text-sm">
        Signed in as <strong>{user?.name}</strong>
      </div>
      <div className="px-3 py-4">
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center"
        >
          <LogOut size={18} className="mr-2"/> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50 dark:bg-neutral-900">
      {/* Mobile drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="fixed top-4 left-4 z-50 md:hidden p-2 bg-primary-600 text-white rounded"
          >
            <MenuIcon size={20}/>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar/>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 lg:w-72">
        <Sidebar/>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 md:px-6">
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* mobile menu toggle visible in header on md+ */}
            <Button
              variant="ghost"
              className="md:hidden p-1"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon size={20}/>
            </Button>
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
              Admin Dashboard
            </h2>
          </div>
          <Breadcrumbs/>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Outlet/>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
