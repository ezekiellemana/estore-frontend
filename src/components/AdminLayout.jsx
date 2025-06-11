// src/components/AdminLayout.jsx
import React from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-900">
      {/* Sidebar always visible on md+; drawer trigger lives in AdminDashboard */}
      <div className="hidden md:flex md:w-64 lg:w-72">
        <AdminSidebar />
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
