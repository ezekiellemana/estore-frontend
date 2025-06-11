// src/components/RedirectIfAdmin.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

/**
 * Wrap public routes to auto-redirect admins.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children – the wrapped public page
 * @param {string} [props.to='/admin/users'] – override redirect target
 */
export default function RedirectIfAdmin({ children, to = '/admin/users' }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const navigate = useNavigate();

  useEffect(() => {
    // only redirect once auth state is known
    if (hydrated && user?.isAdmin) {
      navigate(to, { replace: true });
    }
  }, [hydrated, user, navigate, to]);

  return children;
}
