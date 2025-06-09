// src/pages/admin/AdminReviews.jsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FaTrash, FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // 1) Fetch all reviews
  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/reviews');
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      toast.error('Could not load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  // 2) Ask to confirm deletion
  const confirmDeletion = (reviewId) => {
    setConfirmDeleteId(reviewId);
  };

  const cancelDeletion = () => {
    setConfirmDeleteId(null);
  };

  // 3) Actually delete after confirmation
  const handleDelete = async () => {
    const reviewId = confirmDeleteId;
    if (!reviewId) return;

    setDeletingId(reviewId);
    try {
      await api.delete(`/api/reviews/${reviewId}`);
      toast.success('Review deleted.');
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error('Failed to delete review:', err);
      toast.error('Could not delete review.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return <p className="text-neutral-500">Loading reviews…</p>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 space-y-4 relative z-10">
      <h3 className="text-2xl font-semibold text-neutral-800">Review Management</h3>

      {reviews.length === 0 ? (
        <p className="text-neutral-500">No reviews found.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((rev) => (
            <li
              key={rev._id}
              className="flex items-start justify-between border-b border-neutral-200 pb-4"
            >
              <div>
                <p className="font-medium text-neutral-800">
                  {rev.user?.name || 'Anonymous'}{' '}
                  <span className="text-neutral-500 text-sm">
                    ({new Date(rev.createdAt).toLocaleDateString()})
                  </span>
                </p>
                <div className="flex items-center text-yellow-500 space-x-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < rev.rating ? 'inline-block' : 'inline-block text-neutral-300'
                      }
                    />
                  ))}
                  <span className="ml-2 text-neutral-500">{rev.rating}/5</span>
                </div>
                {rev.comment && (
                  <p className="mt-1 text-neutral-600">{rev.comment}</p>
                )}
              </div>
              <button
                onClick={() => confirmDeletion(rev._id)}
                disabled={deletingId === rev._id}
                className="text-red-500 hover:text-red-700 ml-4 focus:outline-none"
              >
                <FaTrash size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Confirmation Modal via React Portal */}
      {confirmDeleteId &&
        ReactDOM.createPortal(
          <AnimatePresence>
            <motion.div
              key="overlay"
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
                  Are you sure you want to delete this review?
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={cancelDeletion}
                    className="px-4 py-2 bg-neutral-200 rounded-2xl hover:bg-neutral-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deletingId === confirmDeleteId}
                    className="px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition"
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
