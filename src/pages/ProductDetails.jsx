// All your imports remain unchanged
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import useAuthStore from '../store/useAuthStore';

const currency = new Intl.NumberFormat('en-TZ', {
  style: 'currency',
  currency: 'TZS',
  minimumFractionDigits: 2,
});

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

  const REVIEWS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const didFetchProduct = useRef(false);
  const didFetchReviews = useRef(false);

  useEffect(() => {
    if (didFetchProduct.current) return;
    didFetchProduct.current = true;

    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);
        if (Array.isArray(data.images) && data.images.length > 0) {
          setSelectedImageIndex(0);
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 404) {
          toast.error('Product not found.');
          navigate('/products');
        } else {
          toast.error('Failed to load product.');
        }
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

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

  if (!product) return null;

  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleAddToCart = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (product.stock < 1) {
      toast.error('Out of stock.');
      return;
    }

    try {
      await api.post('/api/cart', { productId: product._id, quantity: 1 });
      toast.success('Added to cart.');
      navigate('/cart');
    } catch (err) {
      console.error('Add to cart failed:', err);
      toast.error(err.response?.data?.error || 'Failed to add to cart.');
    }
  };

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const displayedReviews = reviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (newRating < 1 || !newComment.trim()) {
      toast.error('Please provide both rating and comment.');
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
      const { data } = await api.get(`/api/reviews/${product._id}`);
      setReviews(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Review failed:', err);
      toast.error(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-card space-y-8"
      >
        {/* PRODUCT SUMMARY */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* IMAGE GALLERY */}
          <div className="flex-1">
            {product.images?.length > 0 ? (
              <>
                <img
                  loading="lazy"
                  src={product.images[selectedImageIndex]}
                  alt={`${product.name} - View ${selectedImageIndex + 1}`}
                  className="w-full h-80 object-cover rounded-2xl border"
                />
                <div className="mt-4 flex space-x-2 overflow-x-auto">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                        idx === selectedImageIndex
                          ? 'border-accent-500'
                          : 'border-transparent hover:border-neutral-300'
                      }`}
                    >
                      <img
                        loading="lazy"
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="object-cover w-full h-full"
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

          {/* PRODUCT DETAILS */}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-bold">{product.name}</h2>
              <Link to="/products" className="text-accent-500 text-sm hover:underline">
                ← Back
              </Link>
            </div>

            <div className="text-xl">
              {hasDiscount ? (
                <div className="flex gap-2 items-baseline">
                  <span className="line-through text-neutral-500">
                    {currency.format(product.price)}
                  </span>
                  <span className="font-semibold text-accent-600">
                    {currency.format(discountedPrice)}
                  </span>
                </div>
              ) : (
                <span className="font-semibold text-accent-600">
                  {currency.format(product.price)}
                </span>
              )}
            </div>

            <p className="text-sm text-neutral-500">
              Category: {product.category?.name || 'Uncategorized'}
            </p>

            <div className="flex items-center text-sm text-yellow-600 gap-1">
              <FaStar />
              {product.avgRating.toFixed(1)}
              <span className="text-neutral-500">({product.totalReviews})</span>
            </div>

            <p className="text-neutral-600">{product.description}</p>

            <div className="flex items-center gap-4 pt-4">
              {product.stock > 0 ? (
                <>
                  <span className="text-green-600 text-sm">In Stock ({product.stock})</span>
                  <button
                    onClick={handleAddToCart}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-2xl"
                  >
                    Add to Cart
                  </button>
                </>
              ) : (
                <span className="text-red-600 text-sm">Out of Stock</span>
              )}
            </div>
          </div>
        </div>

        {/* REVIEW SECTION */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Customer Reviews</h3>

          {loadingReviews ? (
            <p className="text-neutral-500">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="text-neutral-500">No reviews yet. Be the first!</p>
          ) : (
            <>
              <ul className="space-y-4">
                {displayedReviews.map((rev) => (
                  <li key={rev._id} className="border-b pb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rev.user?.name || 'Anonymous'}</span>
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < rev.rating ? '' : 'text-neutral-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-neutral-500 ml-2">{rev.rating}/5</span>
                    </div>
                    {rev.comment && <p className="mt-1">{rev.comment}</p>}
                    <p className="text-xs text-neutral-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                    className="px-3 py-1 bg-neutral-200 rounded-2xl disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                    className="px-3 py-1 bg-neutral-200 rounded-2xl disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* SUBMIT REVIEW FORM */}
          <form onSubmit={submitReview} className="pt-6 border-t space-y-4">
            <h4 className="text-xl font-semibold">Leave a Review</h4>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  onClick={() => setNewRating(star)}
                  className={`cursor-pointer ${
                    star <= newRating ? 'text-yellow-500' : 'text-neutral-300'
                  }`}
                />
              ))}
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your thoughts…"
              className="w-full border rounded-2xl p-3 bg-neutral-50"
              rows={3}
              required
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2 bg-accent-600 text-white rounded-2xl hover:bg-accent-700"
            >
              {submittingReview ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        </div>
      </motion.div>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 text-center shadow-lg w-80"
            >
              <h3 className="text-xl font-bold mb-2">Please Log In</h3>
              <p className="text-neutral-600 mb-4">You need to be logged in to add items to your cart.</p>
              <div className="flex justify-center gap-4">
                <Link to="/login">
                  <button
                    className="bg-primary-600 text-white px-4 py-2 rounded-2xl hover:bg-primary-700 text-sm"
                  >
                    Log In
                  </button>
                </Link>
                <Link to="/signup">
                  <button
                    className="bg-accent-600 text-white px-4 py-2 rounded-2xl hover:bg-accent-700 text-sm"
                  >
                    Sign Up
                  </button>
                </Link>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="mt-4 text-sm text-neutral-500 hover:text-neutral-700"
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
