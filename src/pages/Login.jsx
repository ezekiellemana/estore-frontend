// src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Zustand store
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    await login(email, password);

    // Check if user is set
    const newUser = useAuthStore.getState().user;
    if (newUser) {
      if (newUser.isAdmin) {
        toast.success(`Welcome Admin, ${newUser.name}!`);
        navigate('/admin');
      } else {
        toast.success(`Welcome back, ${newUser.name}!`);
        navigate('/profile');
      }
    } else {
      toast.error('Login failed. Please check your email and password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4">
      <motion.div
        className="relative w-full max-w-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ rotateY: 4, rotateX: 2, transition: { duration: 0.3 } }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-300 to-primary-500 rounded-3xl blur-xl opacity-30 pointer-events-none"></div>
        <motion.div
          className="relative bg-white rounded-2xl shadow-lg p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-center text-neutral-800 mb-6">
            Log In
          </h2>
          <form onSubmit={submitHandler} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                className="peer w-full px-3 py-2 border border-neutral-300 rounded-2xl bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
              />
              <label
                htmlFor="email"
                className="absolute left-3 top-2 text-sm text-neutral-500 transition-all 
                           peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400
                           peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary-600"
              >
                Email
              </label>
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
                className="peer w-full px-3 py-2 pr-10 border border-neutral-300 rounded-2xl bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
              />
              <label
                htmlFor="password"
                className="absolute left-3 top-2 text-sm text-neutral-500 transition-all 
                           peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400
                           peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary-600"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-2 right-3 text-neutral-500 hover:text-neutral-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex justify-between items-center text-sm">
              <Link
                to="/forgot-password"
                className="text-accent-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <AnimatedButton
                type="submit"
                className="w-full text-center"
                disabled={loading}
              >
                {loading ? 'Logging in…' : 'Log In'}
              </AnimatedButton>
            </motion.div>
          </form>

          <p className="mt-6 text-center text-neutral-600 text-sm">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-accent-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
