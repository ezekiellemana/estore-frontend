import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, ShoppingCart } from 'lucide-react';
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
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartItems = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const [openLogoutModal, setOpenLogoutModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    window.history.pushState(null, '', window.location.href);
    const onPop = (e) => {
      e.preventDefault();
      setOpenLogoutModal(true);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [user]);

  const confirmLogout = () => {
    setOpenLogoutModal(false);
    logout();
    navigate('/');
  };

  const cancelLogout = () => {
    setOpenLogoutModal(false);
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
        className="bg-gradient-to-r from-primary-600 to-primary-400 text-white sticky top-0 z-50 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-accent">e</span>Store
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map(({ to, label, icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center hover:text-neutral-100 transition ${
                    isActive ? 'font-semibold underline underline-offset-4' : ''
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
                  `flex items-center hover:text-neutral-100 transition ${
                    isActive ? 'font-semibold underline underline-offset-4' : ''
                  }`
                }
              >
                {icon}
                {label}
              </NavLink>
            ))}
            {user && (
              <Button variant="ghost" onClick={confirmLogout} className="flex items-center">
                <LogOut size={18} className="mr-1" />
                Logout
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-60 p-4 bg-gradient-to-b from-primary-600 to-primary-400 text-white"
              >
                <ScrollArea className="h-full">
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map(({ to, label, icon, badge }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          `flex items-center px-2 py-2 rounded-lg transition ${
                            isActive
                              ? 'bg-primary-500 text-white font-semibold'
                              : 'hover:bg-primary-500 text-white'
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
                        className={({ isActive }) =>
                          `flex items-center px-2 py-2 rounded-lg transition ${
                            isActive
                              ? 'bg-primary-500 text-white font-semibold'
                              : 'hover:bg-primary-500 text-white'
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
                          variant="ghost"
                          onClick={confirmLogout}
                          className="flex items-center px-2 py-2 rounded-lg hover:bg-primary-500 transition"
                        >
                          <LogOut size={18} className="mr-1" />
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

      {/* Logout Confirmation Modal */}
      <Dialog open={openLogoutModal} onOpenChange={(o) => setOpenLogoutModal(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to log out?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelLogout}>
              Cancel
            </Button>
            <Button onClick={confirmLogout}>Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
