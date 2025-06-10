// src/pages/Signup.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import { Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error('Name, email, and password are required.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/users/register', { name, email, password });
      // After successful signup, immediately log them in (session cookie set)
      await api.post('/api/users/login', { email, password });
      // Get user profile
      const { data: userData } = await api.get('/api/users/profile');
      setUser(userData);

      toast.success('Account created! You are now logged in.');
      navigate('/profile');
    } catch (err) {
      console.error('Signup error:', err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.errors?.map((v) => v.msg).join(', ') ||
        'Registration failed. Please check your info.';
      toast.error(message);
    } finally {
      setLoading(false);
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
            Sign Up
          </h2>
          <form onSubmit={submitHandler} className="space-y-6">
            {/* Name Field */}
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder=" "
                className="peer w-full px-3 py-2 border border-neutral-300 rounded-2xl bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
              />
              <label
                htmlFor="name"
                className="absolute left-3 top-2 text-sm text-neutral-500 transition-all 
                           peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400
                           peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary-600"
              >
                Name
              </label>
            </div>

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

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder=" "
                className="peer w-full px-3 py-2 pr-10 border border-neutral-300 rounded-2xl bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
              />
              <label
                htmlFor="confirm"
                className="absolute left-3 top-2 text-sm text-neutral-500 transition-all 
                           peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-400
                           peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary-600"
              >
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute top-2 right-3 text-neutral-500 hover:text-neutral-700 focus:outline-none"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <AnimatedButton
                type="submit"
                className="w-full text-center"
                disabled={loading}
              >
                {loading ? 'Signing Up…' : 'Sign Up'}
              </AnimatedButton>
            </motion.div>
          </form>

          <p className="mt-6 text-center text-neutral-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-500 hover:underline">
              Log In
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
