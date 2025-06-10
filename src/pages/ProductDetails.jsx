// src/pages/ProductDetails.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import useAuthStore from '../store/useAuthStore';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Pagination state
  const REVIEWS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // “Please log in or sign up” modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Prevent double‐fetch under StrictMode
  const didFetchProduct = useRef(false);
  const didFetchReviews = useRef(false);

  // Fetch product details
  useEffect(() => {
    if (didFetchProduct.current) return;
    didFetchProduct.current = true;

    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);

        // If there are images, default to index 0
        if (Array.isArray(data.images) && data.images.length > 0) {
          setSelectedImageIndex(0);
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 404) {
          toast.error('Product not found.');
          navigate('/products');
        } else if (err.response?.status !== 500) {
          toast.error('Failed to load product.');
        }
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Fetch reviews for this product
  useEffect(() => {
    if (didFetchReviews.current) return;
    didFetchReviews.current = true;

    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/api/reviews/${id}`);
        setReviews(data);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        toast.error('Could not load reviews.');
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-neutral-500">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  // Calculate discounted price if needed
  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  // handleAddToCart now prompts login/signup if user is not authenticated
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
      await api.post('/api/cart', {
        productId: product._id,
        quantity: 1,
      });
      toast.success('Added to cart.');
      navigate('/cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error('Failed to add to cart.');
      }
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const displayedReviews = reviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (newRating < 1 || newComment.trim() === '') {
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
      // Reload reviews and reset pagination
      setLoadingReviews(true);
      const { data } = await api.get(`/api/reviews/${product._id}`);
      setReviews(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to submit review:', err);
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error('Failed to submit review.');
      }
    } finally {
      setSubmittingReview(false);
      setLoadingReviews(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-card space-y-8"
      >
        {/* Product Summary */}
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
          {/* Image Gallery */}
          <div className="flex-1">
            {Array.isArray(product.images) && product.images.length > 0 ? (
              <div className="w-full">
                {/* Main Image */}
                <img
                  src={product.images[selectedImageIndex]}
                  alt={`${product.name} (view ${selectedImageIndex + 1})`}
                  className="w-full h-80 object-cover rounded-2xl border border-neutral-200"
                />

                {/* Thumbnails */}
                <div className="mt-4 flex space-x-2 overflow-x-auto">
                  {product.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 border-2 rounded-md overflow-hidden ${
                        idx === selectedImageIndex
                          ? 'border-accent-500'
                          : 'border-transparent hover:border-neutral-300'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="w-16 h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-80 bg-neutral-100 rounded-2xl flex items-center justify-center">
                <span className="text-neutral-500">No image</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-semibold text-neutral-800">
                {product.name}
              </h2>
              <Link to="/products" className="text-accent-500 hover:underline text-sm">
                ← Back to Products
              </Link>
            </div>

            {/* Price */}
            <div className="mt-4">
              {hasDiscount ? (
                <div className="flex items-baseline space-x-2">
                  <span className="text-neutral-500 line-through">
                    Tsh.{product.price.toFixed(2)}
                  </span>
                  <span className="text-accent-600 font-semibold">
                    Tsh.{discountedPrice.toFixed(2)}
                  </span>
                </div>
              ) : (
                <p className="text-2xl text-accent-600 font-semibold">
                  Tsh.{product.price.toFixed(2)}
                </p>
              )}
            </div>

            {/* Category & Rating */}
            <div className="mt-2 flex items-center space-x-4">
              <span className="text-sm text-neutral-500">
                Category: {product.category?.name || 'Uncategorized'}
              </span>
              <span className="text-sm text-yellow-500 flex items-center space-x-1">
                <FaStar className="inline-block" /> {product.avgRating.toFixed(1)}{' '}
                <span className="text-neutral-500">({product.totalReviews})</span>
              </span>
            </div>

            {/* Description */}
            <p className="mt-4 text-neutral-600">{product.description}</p>

            {/* Stock & Add to Cart */}
            <div className="mt-6 flex items-center space-x-4">
              {product.stock > 0 ? (
                <>
                  <span className="text-sm text-green-700">
                    In Stock ({product.stock})
                  </span>
                  <button
                    onClick={handleAddToCart}
                    className="px-6 py-2 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </>
              ) : (
                <span className="text-sm text-red-700">Out of Stock</span>
              )}
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-neutral-800">Customer Reviews</h3>

          {/* Loading indicator */}
          {loadingReviews ? (
            <p className="text-neutral-500">Loading reviews…</p>
          ) : (
            <>
              {/* Review List */}
              {reviews.length === 0 ? (
                <p className="text-neutral-500">No reviews yet. Be the first!</p>
              ) : (
                <ul className="space-y-4">
                  {displayedReviews.map((rev) => (
                    <li key={rev._id} className="border-b border-neutral-200 pb-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-neutral-800">
                          {rev.user?.name || 'Anonymous'}
                        </span>
                        <span className="flex items-center text-yellow-500 space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < rev.rating
                                  ? 'inline-block'
                                  : 'inline-block text-neutral-300'
                              }
                            />
                          ))}
                          <span className="text-neutral-500 text-sm">
                            {rev.rating}/5
                          </span>
                        </span>
                      </div>
                      {rev.comment && (
                        <p className="mt-1 text-neutral-600">{rev.comment}</p>
                      )}
                      <p className="mt-1 text-xs text-neutral-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Pagination Controls if more than REVIEWS_PER_PAGE */}
              {reviews.length > REVIEWS_PER_PAGE && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-2xl bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-neutral-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-2xl bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Submit New Review */}
              <div className="pt-6 border-t border-neutral-200">
                <h4 className="text-xl font-semibold text-neutral-800 mb-2">
                  Leave a Review
                </h4>
                <form onSubmit={submitReview} className="space-y-4">
                  <div className="flex items-center">
                    <label className="mr-2 text-sm font-medium text-neutral-700">
                      Your Rating:
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          onClick={() => setNewRating(star)}
                          className={
                            star <= newRating
                              ? 'text-yellow-500 cursor-pointer'
                              : 'text-neutral-300 cursor-pointer'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="comment"
                      className="block text-sm font-medium text-neutral-700"
                    >
                      Your Comment
                    </label>
                    <textarea
                      id="comment"
                      rows="3"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-2xl bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
                      placeholder="Write your thoughts…"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2 bg-accent-600 text-white rounded-2xl hover:bg-accent-700 transition-colors"
                  >
                    {submittingReview ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* “Please log in or sign up” Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            key="auth-modal-overlay"
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
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">
                Please Log In
              </h3>
              <p className="text-neutral-600 mb-6">
                You need to be logged in to add items to your cart.
              </p>
              <div className="flex justify-center space-x-4">
                <Link to="/login">
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition text-sm"
                  >
                    Log In
                  </button>
                </Link>
                <Link to="/signup">
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="px-4 py-2 bg-accent-600 text-white rounded-2xl hover:bg-accent-700 transition text-sm"
                  >
                    Sign Up
                  </button>
                </Link>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="mt-4 text-neutral-500 hover:text-neutral-700 text-sm focus:outline-none"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
