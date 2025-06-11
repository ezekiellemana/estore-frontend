// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ShoppingCart, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import useThemeStore from '../store/useThemeStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

const CATEGORIES = [
  'Clothing & Fashion',
  'Accessories & Lifestyle',
  'Gadgets & Mobile Accessories',
  'Electronics & Study Gear',
  'Student Essentials',
];
const BRANDS = ['Nike', 'Adidas', 'Apple', 'Samsung'];
const SALES = ['Clearance', 'Black Friday', 'Cyber Monday'];

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartItems = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState(false);

  // theming
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);

  // back-nav logout
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

  const linkMotion = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } };

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed inset-x-0 top-0 bg-gradient-to-r from-primary-600 to-primary-400 text-white shadow-md z-50"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
          {/* Logo */}
          <motion.div {...linkMotion}>
            <Link to="/" className="text-2xl font-extrabold tracking-tight">
              <span className="text-accent">e</span>Store
            </Link>
          </motion.div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <motion.div {...linkMotion}>
              <NavLink to="/">Home</NavLink>
            </motion.div>

            {/* Products + submenu */}
            <div className="relative group">
              <motion.div {...linkMotion}>
                <NavLink to="/products" className="flex items-center">
                  Products
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </NavLink>
              </motion.div>
              <div className="absolute left-0 mt-2 w-48 bg-white text-neutral-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    className="block px-4 py-2 hover:bg-primary-50"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Brands deeper submenu */}
            <div className="relative group">
              <motion.div {...linkMotion}>
                <NavLink to="/brands" className="flex items-center">
                  Brands
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </NavLink>
              </motion.div>
              <div className="absolute left-0 mt-2 w-48 bg-white text-neutral-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                {BRANDS.map((b) => (
                  <Link key={b} to={`/brands/${b.toLowerCase()}`} className="block px-4 py-2 hover:bg-primary-50">
                    {b}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sales submenu */}
            <div className="relative group">
              <motion.div {...linkMotion}>
                <NavLink to="/sales" className="flex items-center">
                  Sales
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </NavLink>
              </motion.div>
              <div className="absolute left-0 mt-2 w-48 bg-white text-neutral-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                {SALES.map((s) => (
                  <Link key={s} to={`/sales/${s.toLowerCase().replace(/\s+/g, '-')}`} className="block px-4 py-2 hover:bg-primary-50">
                    {s}
                  </Link>
                ))}
              </div>
            </div>

            {/* Cart */}
            <motion.div {...linkMotion}>
              <NavLink to="/cart" className="flex items-center">
                <ShoppingCart size={18} className="mr-1" />
                Cart
                {cartItems.length > 0 && (
                  <span className="ml-1 text-xs bg-accent-300 text-white rounded-full px-2">
                    {cartItems.length}
                  </span>
                )}
              </NavLink>
            </motion.div>

            {/* Theme toggle */}
            <motion.div {...linkMotion} className="flex items-center">
              {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </motion.div>

            {/* Auth */}
            {user ? (
              <motion.div {...linkMotion}>
                <Button variant="ghost" onClick={() => setConfirmModal(true)}>
                  <LogOut size={18} className="mr-1" />
                  Logout
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div {...linkMotion}>
                  <NavLink to="/login">Log In</NavLink>
                </motion.div>
                <motion.div {...linkMotion}>
                  <NavLink to="/signup">Sign Up</NavLink>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button aria-label="Open menu" {...linkMotion}>
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
                    <NavLink to="/" className="px-2 py-1 rounded hover:bg-primary-50">Home</NavLink>

                    {/* Products */}
                    <details className="group">
                      <summary className="px-2 py-1 rounded hover:bg-primary-50 cursor-pointer">Products</summary>
                      <div className="pl-4 mt-1 space-y-1">
                        {CATEGORIES.map((cat) => (
                          <NavLink
                            key={cat}
                            to={`/products?category=${encodeURIComponent(cat)}`}
                            className="block px-2 py-1 rounded hover:bg-primary-100"
                          >
                            {cat}
                          </NavLink>
                        ))}
                      </div>
                    </details>

                    {/* Brands */}
                    <details className="group">
                      <summary className="px-2 py-1 rounded hover:bg-primary-50 cursor-pointer">Brands</summary>
                      <div className="pl-4 mt-1 space-y-1">
                        {BRANDS.map((b) => (
                          <NavLink
                            key={b}
                            to={`/brands/${b.toLowerCase()}`}
                            className="block px-2 py-1 rounded hover:bg-primary-100"
                          >
                            {b}
                          </NavLink>
                        ))}
                      </div>
                    </details>

                    {/* Sales */}
                    <details className="group">
                      <summary className="px-2 py-1 rounded hover:bg-primary-50 cursor-pointer">Sales</summary>
                      <div className="pl-4 mt-1 space-y-1">
                        {SALES.map((s) => (
                          <NavLink
                            key={s}
                            to={`/sales/${s.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block px-2 py-1 rounded hover:bg-primary-100"
                          >
                            {s}
                          </NavLink>
                        ))}
                      </div>
                    </details>

                    <NavLink to="/cart" className="flex items-center px-2 py-1 rounded hover:bg-primary-50">
                      <ShoppingCart size={18} className="mr-1" /> Cart
                      {cartItems.length > 0 && (
                        <span className="ml-auto text-xs bg-accent-300 text-white rounded-full px-2">
                          {cartItems.length}
                        </span>
                      )}
                    </NavLink>

                    <div className="flex items-center space-x-2">
                      {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                      <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                    </div>

                    {user ? (
                      <SheetClose asChild>
                        <Button variant="outline" onClick={() => setConfirmModal(true)}>
                          <LogOut size={18} className="mr-1" /> Logout
                        </Button>
                      </SheetClose>
                    ) : (
                      <>
                        <NavLink to="/login" className="px-2 py-1 rounded hover:bg-primary-50">Log In</NavLink>
                        <NavLink to="/signup" className="px-2 py-1 rounded hover:bg-primary-50">Sign Up</NavLink>
                      </>
                    )}
                  </nav>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.nav>

      {/* Logout confirmation */}
      <Dialog open={confirmModal} onOpenChange={setConfirmModal}>
        <DialogContent className="max-w-sm mx-auto mt-24">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to log out?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleLogout}>Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
