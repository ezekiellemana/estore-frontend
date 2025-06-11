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
  { to: '/admin/users', label: 'User Management', icon: <User size={20}/> },
  { to: '/admin/products', label: 'Product Management', icon: <FilePlus size={20}/> },
  { to: '/admin/categories', label: 'Category Management', icon: <Tag size={20}/> },
  { to: '/admin/orders', label: 'Order Management', icon: <ShoppingCart size={20}/> },
  { to: '/admin/reviews', label: 'Review Management', icon: <FilePlus size={20}/> },
  { to: '/admin/analytics/charts', label: 'Analytics Charts', icon: <BarChart2 size={20}/> },
];

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // redirect non-admins
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error('Admin access only. Please log in with admin credentials.');
      navigate('/login', { replace: true });
    } else if (user === null) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-primary-700 text-white shadow-navbar">
      <div className="flex items-center justify-between px-6 py-4 border-b border-primary-800">
        <h1 className="text-2xl font-bold tracking-wide">eStore Admin</h1>
        <SheetClose asChild>
          <Button variant="ghost" className="p-2 hover:bg-primary-600 md:hidden">
            <MenuIcon size={20} />
          </Button>
        </SheetClose>
      </div>
      <ScrollArea className="flex-grow px-4 py-6 space-y-2">
        {LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 rounded-lg transition ${
                isActive ? 'bg-primary-800' : 'hover:bg-primary-800'
              }`
            }
          >
            <span className="mr-3 text-white">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </ScrollArea>
      <div className="px-4 py-4 border-t border-primary-800">
        <p className="text-xs text-neutral-300">Logged in as</p>
        <p className="font-semibold">{user?.name}</p>
      </div>
      <div className="px-4 py-4">
        <Button
          variant="default"
          className="w-full flex items-center justify-center"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64">
        <SidebarContent />
      </div>

      {/* Mobile Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden fixed top-4 left-4 z-50 bg-primary-600 text-white p-2 rounded-full shadow-md"
          >
            <MenuIcon size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
          <div className="flex items-center space-x-4">
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden p-2">
                <MenuIcon size={20} />
              </Button>
            </SheetTrigger>
            <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
              Admin Dashboard
            </h2>
          </div>
          <Breadcrumbs />
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
