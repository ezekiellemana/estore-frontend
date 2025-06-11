// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartItems = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState(false);

  // Prompt logout on browser “back” if logged in
  useEffect(() => {
    if (!user) return;
    window.history.pushState(null, '', window.location.href);
    const onPop = (e) => {
      e.preventDefault();
      setConfirmModal(true);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [user]);

  const handleLogout = () => {
    setConfirmModal(false);
    logout();
    navigate('/');
  };
  const handleCancel = () => {
    setConfirmModal(false);
    window.history.pushState(null, '', window.location.href);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    {
      to: '/cart',
      label: 'Cart',
      icon: <ShoppingCart size={18} className="mr-1 inline" />,
      badge: cartItems.length,
    },
  ];
  const authLinks = user
    ? [{ to: '/profile', label: 'Profile', icon: <User size={18} className="mr-1 inline" /> }]
    : [
        { to: '/login', label: 'Log In' },
        { to: '/signup', label: 'Sign Up' },
      ];

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-x-0 top-0 bg-gradient-to-r from-primary-600 to-primary-400 text-white shadow-md z-50"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-accent">e</span>Store
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map(({ to, label, icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center transition ${
                    isActive
                      ? 'font-semibold underline underline-offset-4'
                      : 'hover:text-neutral-100'
                  }`
                }
              >
                {icon}
                {label}
                {badge > 0 && (
                  <span className="ml-1 text-xs bg-accent-300 text-white rounded-full px-2">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}

            {authLinks.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center transition ${
                    isActive
                      ? 'font-semibold underline underline-offset-4'
                      : 'hover:text-neutral-100'
                  }`
                }
              >
                {icon}
                {label}
              </NavLink>
            ))}

            {user && (
              <Button
                variant="ghost"
                onClick={() => setConfirmModal(true)}
                className="flex items-center"
              >
                <LogOut size={18} className="mr-1" />
                Logout
              </Button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button aria-label="Open menu">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="bg-white h-full w-64 p-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold">Menu</span>
                  <SheetClose asChild>
                    <Button aria-label="Close menu">
                      <X size={24} />
                    </Button>
                  </SheetClose>
                </div>

                <ScrollArea className="h-[calc(100%-4rem)]">
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map(({ to, label, icon, badge }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={() => window.history.pushState(null, '', window.location.href)}
                        className={({ isActive }) =>
                          `flex items-center px-2 py-2 rounded-lg transition ${
                            isActive
                              ? 'bg-primary-100 text-primary-700 font-semibold'
                              : 'hover:bg-primary-50'
                          }`
                        }
                      >
                        {icon}
                        {label}
                        {badge > 0 && (
                          <span className="ml-auto text-xs bg-accent-300 text-white rounded-full px-2">
                            {badge}
                          </span>
                        )}
                      </NavLink>
                    ))}

                    {authLinks.map(({ to, label, icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={() => window.history.pushState(null, '', window.location.href)}
                        className={({ isActive }) =>
                          `flex items-center px-2 py-2 rounded-lg transition ${
                            isActive
                              ? 'bg-primary-100 text-primary-700 font-semibold'
                              : 'hover:bg-primary-50'
                          }`
                        }
                      >
                        {icon}
                        {label}
                      </NavLink>
                    ))}

                    {user && (
                      <SheetClose asChild>
                        <Button
                          variant="outline"
                          onClick={() => setConfirmModal(true)}
                          className="mt-4 w-full flex items-center justify-center"
                        >
                          <LogOut size={18} className="mr-2" />
                          Logout
                        </Button>
                      </SheetClose>
                    )}
                  </nav>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.nav>

      {/* Logout Confirmation */}
      <Dialog open={confirmModal} onOpenChange={setConfirmModal}>
        <DialogContent className="max-w-sm mx-auto mt-24">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleLogout}>Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
