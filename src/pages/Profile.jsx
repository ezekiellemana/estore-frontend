// src/pages/Profile.jsx

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

function ConfirmModal({ visible, message, onConfirm, onCancel }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full"
      >
        <p className="text-neutral-800 mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-2xl hover:bg-neutral-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Profile() {
  // User info
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    address: { street: '', city: '', country: '', postalCode: '' },
  });
  const [loadingUser, setLoadingUser] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // 1) Load user profile
  const fetchUser = async () => {
    setLoadingUser(true);
    try {
      const { data } = await api.get('/api/users/profile');
      setUserInfo({
        name: data.name || '',
        email: data.email || '',
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          country: data.address?.country || '',
          postalCode: data.address?.postalCode || '',
        },
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Could not load your profile.');
    } finally {
      setLoadingUser(false);
    }
  };

  // 2) Load user’s orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await api.get('/api/orders/my');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('Could not load your orders.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchOrders();
  }, []);

  // 3) Handle changes in the profile form fields
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setUserInfo((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setUserInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 4) Submit updated profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/api/users/profile', {
        name: userInfo.name,
        email: userInfo.email,
        address: userInfo.address,
      });
      toast.success('Profile updated successfully.');
      fetchUser();
    } catch (err) {
      console.error('Failed to update profile:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        'Could not update profile.';
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // 5) Handle password form field changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // 6) Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }
    setChangingPassword(true);
    try {
      await api.put('/api/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Failed to change password:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        'Could not change password.';
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  // 7) Prompt delete confirmation
  const confirmDeleteOrder = (orderId) => {
    setOrderToDelete(orderId);
  };

  // 8) Handle confirmed delete
  const handleConfirmDelete = async () => {
    const orderId = orderToDelete;
    setDeletingId(orderId);
    setOrderToDelete(null);
    try {
      await api.delete(`/api/orders/${orderId}`);
      toast.success('Order removed from history.');
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      console.error('Failed to delete order:', err);
      toast.error('Could not delete the order.');
    } finally {
      setDeletingId(null);
    }
  };

  // 9) Cancel delete
  const handleCancelDelete = () => {
    setOrderToDelete(null);
  };

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-neutral-500">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* Grid: Profile Info & Change Password side by side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info Form */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">My Profile</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-neutral-700">Name</label>
              <input
                type="text"
                name="name"
                value={userInfo.name}
                onChange={handleProfileChange}
                className="mt-1 w-full border border-neutral-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>

            <div>
              <label className="block text-neutral-700">Email</label>
              <input
                type="email"
                name="email"
                value={userInfo.email}
                onChange={handleProfileChange}
                className="mt-1 w-full border border-neutral-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>

            <fieldset className="mt-4">
              <legend className="text-neutral-700 font-medium">Address</legend>

              <div className="mt-2">
                <label className="block text-neutral-700">Street</label>
                <input
                  type="text"
                  name="address.street"
                  value={userInfo.address.street}
                  onChange={handleProfileChange}
                  className="mt-1 w-full border border-neutral-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="block text-neutral-700 mt-2">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={userInfo.address.city}
                  onChange={handleProfileChange}
                  className="mt-1 w-full border border-neutral-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="block text-neutral-700 mt-2">Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={userInfo.address.country}
                  onChange={handleProfileChange}
                  className="mt-1 w-full border border-neutral-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="block text-neutral-700 mt-2">Postal Code</label>
                <input
                  type="text"
                  name="address.postalCode"
                  value={userInfo.address.postalCode}
                  onChange={handleProfileChange}
                  className="mt-1 w-full border border-neutral-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={savingProfile}
              className={`mt-4 w-full text-white py-2 rounded-2xl shadow-sm transition-colors ${
                savingProfile ? 'bg-neutral-400' : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {savingProfile ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-neutral-700">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="mt-1 w-full border border-neutral-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div>
              <label className="block text-neutral-700">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 w-full border border-neutral-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div>
              <label className="block text-neutral-700">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 w-full border border-neutral-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className={`mt-4 w-full text-white py-2 rounded-2xl shadow-sm transition-colors ${
                changingPassword ? 'bg-neutral-400' : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {changingPassword ? 'Updating…' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* My Orders in full width */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">My Orders</h2>

        {loadingOrders ? (
          <p className="text-neutral-500">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-neutral-500">You have no orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="border border-neutral-200 rounded-2xl p-4 flex flex-col md:flex-row md:justify-between md:items-start space-y-3 md:space-y-0"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-neutral-800">
                    Order ID: {order._id}
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Status:{' '}
                    <span
                      className={`font-medium ${
                        order.status === 'completed'
                          ? 'text-green-600'
                          : order.status === 'cancelled'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Date:{' '}
                    {new Date(order.createdAt).toLocaleDateString()}{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                  <p className="text-neutral-600 text-sm mt-1">
                    Total:{' '}
                    <span className="font-semibold">
                      Tsh.{order.total.toFixed(2)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => confirmDeleteOrder(order._id)}
                  disabled={deletingId === order._id}
                  className={`self-end md:self-center text-white text-sm font-medium px-4 py-2 rounded-2xl transition-colors ${
                    deletingId === order._id
                      ? 'bg-neutral-400'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {deletingId === order._id ? 'Deleting…' : 'Delete'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        visible={Boolean(orderToDelete)}
        message="Are you sure you want to delete this order permanently?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
