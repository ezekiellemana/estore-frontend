// src/pages/ProductDetails.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import { HiCheckCircle } from 'react-icons/hi2';
import { useSwipeable } from 'react-swipeable';
import useAuthStore from '../store/useAuthStore';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Product and review state
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Review submission state
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Pagination for reviews
  const REVIEWS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);

  // Gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Modal for auth
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Star breakdown
  const [starCounts, setStarCounts] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  // StrictMode double-fetch prevention
  const didFetchProduct = useRef(false);
  const didFetchReviews = useRef(false);

  // Fetch product
  useEffect(() => {
    if (didFetchProduct.current) return;
    didFetchProduct.current = true;
    setLoadingProduct(true);
    api.get(`/api/products/${id}`)
      .then(({ data }) => {
        setProduct(data);
        if (data.images?.length) setSelectedImageIndex(0);
      })
      .catch(err => {
        if (err.response?.status === 404) {
          toast.error('Product not found.');
          navigate('/products');
        } else {
          toast.error('Failed to load product.');
        }
      })
      .finally(() => setLoadingProduct(false));
  }, [id, navigate]);

  // Fetch reviews
  useEffect(() => {
    if (didFetchReviews.current) return;
    didFetchReviews.current = true;
    setLoadingReviews(true);
    api.get(`/api/reviews/${id}`)
      .then(({ data }) => {
        setReviews(data);
        const stars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.forEach(r => (stars[r.rating] = (stars[r.rating] || 0) + 1));
        setStarCounts(stars);
      })
      .catch(err => {
        toast.error('Could not load reviews.');
      })
      .finally(() => setLoadingReviews(false));
  }, [id]);

  // Discounted price calculation
  const hasDiscount = product?.discount > 0;
  const discountedPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product?.price;

  // Swiping gallery handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      setSelectedImageIndex(i => (product.images && i < product.images.length - 1 ? i + 1 : i)),
    onSwipedRight: () =>
      setSelectedImageIndex(i => (i > 0 ? i - 1 : i)),
    trackMouse: true,
  });

  // Add to cart logic
  const handleAddToCart = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (product.stock < 1) {
      toast.error('Cannot add to cart: out of stock.');
      return;
    }
    try {
      await api.post('/api/cart', { productId: product._id, quantity: 1 });
      toast.success('Added to cart. 🛒');
      navigate('/cart');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart.');
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const displayedReviews = reviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );
  const goToPage = pageNum => pageNum >= 1 && pageNum <= totalPages && setCurrentPage(pageNum);

  // Review submission logic
  const submitReview = async e => {
    e.preventDefault();
    if (newRating < 1 || !newComment.trim()) {
      toast.error('Please provide a rating and comment.');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/api/products/${product._id}/reviews`, {
        rating: newRating,
        comment: newComment.trim(),
      });
      toast.success('Review submitted.');
      setNewRating(0);
      setNewComment('');
      setLoadingReviews(true);
      const { data } = await api.get(`/api/reviews/${product._id}`);
      setReviews(data);
      const stars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      data.forEach(r => (stars[r.rating] = (stars[r.rating] || 0) + 1));
      setStarCounts(stars);
      setCurrentPage(1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
      setLoadingReviews(false);
    }
  };

  // Star percentage helper
  const totalReviews = Object.values(starCounts).reduce((a, b) => a + b, 0);
  const starPercent = n =>
    totalReviews ? ((starCounts[n] / totalReviews) * 100).toFixed(1) : 0;

  // Loading state
  if (loadingProduct)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-neutral-500">Loading product…</p>
      </div>
    );
  if (!product) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6 md:p-8 bg-white rounded-2xl shadow-card space-y-8"
      >
        {/* --- Product Section --- */}
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
          {/* --- Gallery --- */}
          <div className="flex-1 select-none" {...swipeHandlers}>
            {product.images?.length ? (
              <>
                <motion.img
                  key={product.images[selectedImageIndex]}
                  src={product.images[selectedImageIndex]}
                  alt={`${product.name} (${selectedImageIndex + 1})`}
                  className="w-full h-80 object-cover rounded-2xl border border-neutral-200"
                  initial={{ opacity: 0.7, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                />
                <div className="mt-4 flex space-x-2 overflow-x-auto">
                  {product.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 border-2 rounded-md overflow-hidden w-16 h-16 ${
                        selectedImageIndex === idx
                          ? 'border-primary'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-80 bg-neutral-100 rounded-2xl flex items-center justify-center">
                <span className="text-neutral-500">No image</span>
              </div>
            )}
          </div>

          {/* --- Details --- */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-800">
                {product.name}
              </h1>
              <Link
                to="/products"
                className="text-primary underline text-sm"
              >
                ← Back
              </Link>
            </div>
            <div className="text-xl font-semibold">
              {hasDiscount ? (
                <>
                  <span className="text-red-500">
                    Tsh.{discountedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="line-through text-sm ml-2 text-neutral-400">
                    Tsh.{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </>
              ) : (
                <>Tsh.{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</>
              )}
            </div>
            <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-neutral-500 text-sm">
                Category: {product.category?.name || 'Uncategorized'}
              </span>
              <span className="text-sm flex items-center text-yellow-500">
                <FaStar className="mr-1" /> {product.avgRating?.toFixed(1) || 0}
                <span className="text-neutral-400 ml-1">({product.totalReviews || 0})</span>
              </span>
            </div>
            <p className="text-neutral-600">{product.description}</p>
            <button
              onClick={handleAddToCart}
              disabled={product.stock < 1}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:shadow-md transition disabled:opacity-50"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* --- Star Breakdown --- */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Customer Ratings</h2>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center space-x-2">
                <span className="w-10 text-sm">{star}★</span>
                <div className="flex-1 bg-neutral-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full rounded-full"
                    style={{ width: `${starPercent(star)}%` }}
                  />
                </div>
                <span className="w-10 text-sm text-right">
                  {starCounts[star] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Reviews Section --- */}
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Reviews</h2>
          {loadingReviews ? (
            <p className="text-sm text-neutral-400">Loading…</p>
          ) : displayedReviews.length === 0 ? (
            <p className="text-sm text-neutral-400">No reviews yet.</p>
          ) : (
            displayedReviews.map(r => (
              <div key={r._id} className="bg-neutral-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {[...Array(r.rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-sm" />
                    ))}
                    <span className="text-sm text-neutral-500">| {r.user?.name}</span>
                  </div>
                  {r.isVerified && (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <HiCheckCircle className="text-lg" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-700">{r.comment}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={`w-8 h-8 rounded-full text-sm ${
                    currentPage === i + 1
                      ? 'bg-primary text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
          {/* Review Submission */}
          {user ? (
            <form onSubmit={submitReview} className="mt-10 space-y-4">
              <h3 className="text-lg font-semibold">Leave a Review</h3>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewRating(s)}
                    className={`text-2xl ${
                      newRating >= s ? 'text-yellow-400' : 'text-neutral-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full p-3 border border-neutral-300 rounded-lg resize-none"
                rows={3}
                placeholder="Write your review here..."
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:shadow-md transition disabled:opacity-50"
              >
                {submittingReview ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="text-center text-sm mt-10 text-neutral-500">
              <p>
                Please <Link to="/login" className="text-primary underline">log in</Link> to write a review.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* --- Auth Modal --- */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          >
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
              <p className="text-lg font-semibold mb-4">Please log in to continue</p>
              <div className="flex justify-around space-x-4">
                <Link to="/login" className="text-primary underline">Login</Link>
                <Link to="/signup" className="text-primary underline">Sign Up</Link>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="mt-6 text-sm text-neutral-500 hover:underline"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
