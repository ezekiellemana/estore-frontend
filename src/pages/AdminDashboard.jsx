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
  ChevronLeft,
  MessageCircle,
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user && user.isAdmin !== true) {
      toast.error('Admin access only. Please log in with admin credentials.');
      navigate('/login');
    } else if (user === null) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="w-64 bg-primary-700 text-white flex flex-col shadow-lg"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-800">
              <h1 className="text-2xl font-bold tracking-wide">eStore Admin</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:text-primary-300 focus:outline-none"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            <nav className="flex-grow px-4 py-6 space-y-2 overflow-y-auto">
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  isActive
                    ? 'group flex items-center px-4 py-3 bg-primary-800 rounded-lg transition'
                    : 'group flex items-center px-4 py-3 hover:bg-primary-800 rounded-lg transition'
                }
              >
                <User size={20} className="mr-3 text-white group-hover:text-white" />
                <span className="text-sm font-medium">User Management</span>
              </NavLink>

              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  isActive
                    ? 'group flex items-center px-4 py-3 bg-primary-800 rounded-lg transition'
                    : 'group flex items-center px-4 py-3 hover:bg-primary-800 rounded-lg transition'
                }
              >
                <FilePlus size={20} className="mr-3 text-white group-hover:text-white" />
                <span className="text-sm font-medium">Product Management</span>
              </NavLink>

              <NavLink
                to="/admin/categories"
                className={({ isActive }) =>
                  isActive
                    ? 'group flex items-center px-4 py-3 bg-primary-800 rounded-lg transition'
                    : 'group flex items-center px-4 py-3 hover:bg-primary-800 rounded-lg transition'
                }
              >
                <Tag size={20} className="mr-3 text-white group-hover:text-white" />
                <span className="text-sm font-medium">Category Management</span>
              </NavLink>

              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  isActive
                    ? 'group flex items-center px-4 py-3 bg-primary-800 rounded-lg transition'
                    : 'group flex items-center px-4 py-3 hover:bg-primary-800 rounded-lg transition'
                }
              >
                <ShoppingCart size={20} className="mr-3 text-white group-hover:text-white" />
                <span className="text-sm font-medium">Order Management</span>
              </NavLink>

              <NavLink
                to="/admin/reviews"
                className={({ isActive }) =>
                  isActive
                    ? 'group flex items-center px-4 py-3 bg-primary-800 rounded-lg transition'
                    : 'group flex items-center px-4 py-3 hover:bg-primary-800 rounded-lg transition'
                }
              >
                <MessageCircle size={20} className="mr-3 text-white group-hover:text-white" />
                <span className="text-sm font-medium">Review Management</span>
              </NavLink>

              <NavLink
                to="/admin/analytics/charts"
                className={({ isActive }) =>
                  isActive
                    ? 'group flex items-center px-4 py-3 bg-primary-800 rounded-lg transition'
                    : 'group flex items-center px-4 py-3 hover:bg-primary-800 rounded-lg transition'
                }
              >
                <BarChart2 size={20} className="mr-3 text-white group-hover:text-white" />
                <span className="text-sm font-medium">Analytics Charts</span>
              </NavLink>
            </nav>

            <div className="px-4 py-4 border-t border-primary-800 text-neutral-300 text-sm">
              Logged in as <span className="font-semibold text-white">{user?.name}</span>
            </div>
            <div className="px-4 py-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center bg-secondary hover:bg-secondary-600 text-white py-2 rounded-2xl transition-colors shadow-sm"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 bg-primary-700 text-white rounded-md hover:bg-indigo-700 focus:outline-none shadow-md"
              >
                <MenuIcon size={20} />
              </button>
            )}
            <h2 className="text-2xl font-semibold text-neutral-800">Admin Dashboard</h2>
          </div>
          <Breadcrumbs />
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto bg-neutral-50">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
