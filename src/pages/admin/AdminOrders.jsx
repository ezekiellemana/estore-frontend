// src/pages/admin/AdminOrders.jsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '../../components/AnimatedButton';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // For custom confirmation modals
  const [confirmCompleteId, setConfirmCompleteId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Fetch orders with items.product populated
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/orders', {
        params: { limit: 20, sort: 'createdAt_desc' },
      });
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Trigger complete confirmation
  const confirmComplete = (orderId) => {
    setConfirmCompleteId(orderId);
  };
  const cancelComplete = () => {
    setConfirmCompleteId(null);
  };

  // Mark order as completed
  const handleMarkCompleted = async () => {
    const orderId = confirmCompleteId;
    if (!orderId) return;

    setUpdatingId(orderId);
    try {
      await api.put(`/api/admin/orders/${orderId}`, { status: 'completed' });
      toast.success('Order marked as completed.');
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      toast.error('Could not update this order.');
    } finally {
      setUpdatingId(null);
      setConfirmCompleteId(null);
    }
  };

  // Trigger delete confirmation
  const confirmDelete = (orderId) => {
    setConfirmDeleteId(orderId);
  };
  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  // Delete order
  const handleDeleteOrder = async () => {
    const orderId = confirmDeleteId;
    if (!orderId) return;

    setDeletingId(orderId);
    try {
      await api.delete(`/api/admin/orders/${orderId}`);
      toast.success('Order deleted.');
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      console.error('Failed to delete order:', err);
      toast.error('Could not delete this order.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-neutral-800">Manage Orders</h2>

      {loading ? (
        <p className="text-neutral-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-neutral-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="bg-white rounded-2xl shadow-card p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-semibold text-neutral-800">
                    {order.user.name} ({order.user.email})
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Order ID: {order._id}
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Date:{' '}
                    {new Date(order.createdAt).toLocaleDateString()}{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
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
                    Total:{' '}
                    <span className="font-semibold">
                      Tsh.{order.total.toFixed(2)}
                    </span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <AnimatedButton
                      onClick={() => confirmComplete(order._id)}
                      disabled={updatingId === order._id}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-2xl text-sm"
                    >
                      {updatingId === order._id ? 'Updating…' : 'Mark Completed'}
                    </AnimatedButton>
                  )}
                  <AnimatedButton
                    onClick={() => confirmDelete(order._id)}
                    disabled={deletingId === order._id}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-2xl text-sm"
                  >
                    {deletingId === order._id ? 'Deleting…' : 'Delete'}
                  </AnimatedButton>
                </div>
              </div>

              {/* List products in this order */}
              <div className="mt-4 border-t border-neutral-200 pt-4">
                <h3 className="text-neutral-700 font-medium mb-2">
                  Products:
                </h3>
                <ul className="space-y-1">
                  {order.items.map((item) => (
                    <li
                      key={item.product._id}
                      className="flex justify-between text-neutral-600 text-sm"
                    >
                      <span>
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>
                        Tsh.{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for “Mark Completed” */}
      {confirmCompleteId &&
        ReactDOM.createPortal(
          <AnimatePresence>
            <motion.div
              key="overlay-complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-6 w-80 text-center shadow-lg"
              >
                <p className="text-neutral-800 text-lg mb-4">
                  Mark this order as completed?
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={cancelComplete}
                    className="px-4 py-2 bg-neutral-200 rounded-2xl hover:bg-neutral-300 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMarkCompleted}
                    disabled={updatingId === confirmCompleteId}
                    className="px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition text-sm"
                  >
                    {updatingId === confirmCompleteId ? 'Updating…' : 'Confirm'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}

      {/* Confirmation Modal for “Delete Order” */}
      {confirmDeleteId &&
        ReactDOM.createPortal(
          <AnimatePresence>
            <motion.div
              key="overlay-delete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-6 w-80 text-center shadow-lg"
              >
                <p className="text-neutral-800 text-lg mb-4">
                  Delete this order permanently?
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 bg-neutral-200 rounded-2xl hover:bg-neutral-300 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteOrder}
                    disabled={deletingId === confirmDeleteId}
                    className="px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition text-sm"
                  >
                    {deletingId === confirmDeleteId ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
