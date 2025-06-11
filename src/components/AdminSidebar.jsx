// src/components/AdminSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  User,
  FilePlus,
  BarChart2,
  Tag,
  ShoppingCart,
  LogOut,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { Button } from '@/components/ui/button';

const LINKS = [
  { to: '/admin/users', label: 'Users', icon: <User size={20}/> },
  { to: '/admin/products', label: 'Products', icon: <FilePlus size={20}/> },
  { to: '/admin/categories', label: 'Categories', icon: <Tag size={20}/> },
  { to: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={20}/> },
  { to: '/admin/reviews', label: 'Reviews', icon: <FilePlus size={20}/> },
  { to: '/admin/analytics/charts', label: 'Analytics', icon: <BarChart2 size={20}/> },
];

export default function AdminSidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="w-64 bg-primary-700 text-white flex-shrink-0 shadow-navbar">
      <div className="px-6 py-4 border-b border-primary-800">
        <h1 className="text-xl font-bold">eStore Admin</h1>
      </div>
      <nav className="px-4 py-6 space-y-2 overflow-y-auto">
        {LINKS.map(({to,label,icon}) => (
          <NavLink
            key={to}
            to={to}
            className={({isActive}) =>
              `flex items-center px-4 py-2 rounded-lg transition ${
                isActive ? 'bg-primary-800' : 'hover:bg-primary-600'
              }`
            }
          >
            <span className="mr-3">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-6 py-4 border-t border-primary-800">
        <p className="text-sm">Signed in as</p>
        <p className="font-medium">{user?.name}</p>
        <Button
          variant="default"
          className="mt-3 w-full flex items-center justify-center"
          onClick={() => { logout(); }}
        >
          <LogOut size={18} className="mr-2"/> Logout
        </Button>
      </div>
    </aside>
  );
}
