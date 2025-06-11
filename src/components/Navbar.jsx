// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, ShoppingCart, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';

export default function Navbar({ theme, toggleTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const cartItems = useCartStore(s => s.items);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const baseNav = "bg-gradient-to-r from-primary-500 to-primary-300 dark:from-neutral-800 dark:to-neutral-900 text-white sticky top-0 z-50 shadow-navbar";

  // Admin vs. normal users…
  if (user?.isAdmin) {
    return (
      <motion.nav initial={{ y:-50, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{duration:0.5}} className={baseNav.replace('primary-500','primary-600')}>
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <Link to="/admin" className="text-2xl font-extrabold">
            <span className="text-accent-300">Admin</span> Panel
          </Link>
          <div className="flex items-center space-x-4">
            {/* theme toggle */}
            <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30">
              {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            {/* logout */}
            <button onClick={handleLogout} className="flex items-center bg-neutral-200 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-2xl">
              <LogOut size={18} className="mr-1"/> Logout
            </button>
          </div>
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.nav initial={{ y:-50, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{duration:0.5}} className={baseNav}>
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <Link to="/" className="text-2xl font-bold">
          <span className="text-accent">e</span>Store
        </Link>

        {/* desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={({isActive}) => isActive ? 'underline' : 'hover:text-neutral-100'}>Home</NavLink>
          <NavLink to="/products" className={({isActive}) => isActive ? 'underline' : 'hover:text-neutral-100'}>Products</NavLink>
          <NavLink to="/cart" className="flex items-center hover:text-neutral-100">
            <ShoppingCart size={18} className="mr-1"/>
            Cart
            {cartItems.length > 0 && <span className="ml-1 text-xs bg-accent-300 text-white rounded-full px-2">{cartItems.length}</span>}
          </NavLink>

          {user ? (
            <>
              <NavLink to="/profile" className="flex items-center hover:text-neutral-100">
                <User size={18} className="mr-1"/>Profile
              </NavLink>
              <button onClick={handleLogout} className="flex items-center bg-neutral-200 bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-2xl">
                <LogOut size={18} className="mr-1"/>Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="hover:text-neutral-100">Log In</NavLink>
              <NavLink to="/signup" className="hover:text-neutral-100">Sign Up</NavLink>
            </>
          )}

          {/* theme toggle always visible on desktop */}
          <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30">
            {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </div>

        {/* mobile hamburger */}
        <button className="md:hidden" onClick={() => setIsOpen(o => !o)}><Menu size={24}/></button>
      </div>

      {/* mobile menu */}
      {isOpen && (
        <motion.div initial={{height:0}} animate={{height:'auto'}} transition={{duration:0.3}} className="md:hidden bg-gradient-to-b from-primary-500 to-primary-400">
          {['/','/products','/cart'].map((path, i) => (
            <NavLink key={i} to={path} onClick={()=>setIsOpen(false)} className="block px-6 py-3 hover:bg-primary-600">
              {path === '/' ? 'Home' : path.replace('/','').charAt(0).toUpperCase() + path.slice(2)}
            </NavLink>
          ))}

          {user
            ? <>
                <NavLink to="/profile" onClick={()=>setIsOpen(false)} className="block px-6 py-3 hover:bg-primary-600">Profile</NavLink>
                <button onClick={()=>{ handleLogout(); setIsOpen(false); }} className="w-full text-left px-6 py-3 hover:bg-primary-600 bg-neutral-200 bg-opacity-20">Logout</button>
              </>
            : <>
                <NavLink to="/login" onClick={()=>setIsOpen(false)} className="block px-6 py-3 hover:bg-primary-600">Log In</NavLink>
                <NavLink to="/signup" onClick={()=>setIsOpen(false)} className="block px-6 py-3 hover:bg-primary-600">Sign Up</NavLink>
              </>
          }
        </motion.div>
      )}
    </motion.nav>
  );
}
