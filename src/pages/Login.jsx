// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  // BLOCK BACK/FORWARD WHEN ON LOGIN
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const blockNav = () => window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', blockNav);
    return () => window.removeEventListener('popstate', blockNav);
  }, []);

  const validate = () => {
    const errs = {};
    if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Perform login (sets cookie)
      await api.post('/api/users/login', { email, password });

      // Fetch profile
      const { data: userData } = await api.get('/api/users/profile');
      setUser(userData);

      // Redirect based on role
      if (userData.isAdmin) {
        toast.success(`Welcome Admin, ${userData.name}!`);
        navigate('/admin/users', { replace: true });
      } else {
        toast.success(`Welcome back, ${userData.name}!`);
        navigate('/profile', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setPassword('');
      const msg = err.response?.data?.error || 'Login failed. Check email/password.';
      setErrors({ submit: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card className="relative bg-white rounded-2xl shadow-lg p-6">
          <CardHeader>
            <h2 className="text-3xl font-bold text-center text-neutral-800 mb-4">Log In</h2>
          </CardHeader>
          <CardContent>
            {errors.submit && <p className="text-red-500 text-sm mb-4">{errors.submit}</p>}
            <form onSubmit={submitHandler} className="space-y-6">
              {/* Email Field */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
              </div>
              {/* Password Field */}
              <div className="relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute top-10 right-3 text-neutral-500 hover:text-neutral-700 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
              </div>
              <div className="flex justify-between items-center text-sm">
                <Link to="/forgot-password" className="text-accent-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <AnimatedButton type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in…' : 'Log In'}
              </AnimatedButton>
            </form>
          </CardContent>
          <CardFooter className="text-center pt-4">
            <p className="text-neutral-600 text-sm">
              Don’t have an account?{' '}
              <Link to="/signup" className="text-accent-500 hover:underline">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
