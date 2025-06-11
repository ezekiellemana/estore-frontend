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

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const blockNav = () => window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', blockNav);
    return () => window.removeEventListener('popstate', blockNav);
  }, []);

  const validate = () => {
    const errs = {};
    if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address';
    if (password.length < 6) errs.password = 'Password must be ≥6 chars';
    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    const val = validate();
    if (Object.keys(val).length) {
      setErrors(val);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await api.post('/api/users/login', { email, password });
      const { data: userData } = await api.get('/api/users/profile');
      setUser(userData);
      toast.success(userData.isAdmin ? `Welcome Admin, ${userData.name}!` : `Welcome back, ${userData.name}!`);
      navigate(userData.isAdmin ? '/admin' : '/profile', { replace: true });
    } catch (err) {
      console.error(err);
      setPassword('');
      const msg = err.response?.data?.error || 'Login failed';
      setErrors({ submit: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4">
      <motion.div className="w-full max-w-md" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} whileHover={{ scale: 1.02 }}>
        <Card className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-card">
          <CardHeader>
            <h2 className="text-3xl font-bold text-center text-neutral-800 dark:text-neutral-100 mb-4">Log In</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {errors.submit && <p className="text-red-500">{errors.submit}</p>}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div className="relative">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="mt-1 pr-10" />
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute top-9 right-3 text-neutral-500 hover:text-neutral-700">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
            <Link to="/forgot-password" className="block text-right text-sm text-accent-500 hover:underline">Forgot password?</Link>
            <AnimatedButton type="submit" className="w-full py-3" onClick={submit} disabled={loading}>
              {loading ? 'Logging in…' : 'Log In'}
            </AnimatedButton>
          </CardContent>
          <CardFooter className="text-center pt-4">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
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
