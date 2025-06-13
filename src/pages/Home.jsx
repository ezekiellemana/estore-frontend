// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AnimatedButton from '../components/AnimatedButton';

// Helper to format prices like "Tsh.2,250,000.00/="
const formatPrice = (price) =>
  `Tsh.${price.toLocaleString('en-TZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}/=`;

// Skeleton placeholder
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 animate-pulse flex flex-col h-full">
      <div className="w-full h-48 bg-neutral-200 rounded-lg" />
      <div className="h-5 bg-neutral-200 rounded mt-4 w-2/3" />
      <div className="h-4 bg-neutral-100 rounded mt-2 w-1/3" />
      <div className="h-4 bg-neutral-100 rounded mt-2 w-1/2" />
      <div className="mt-auto pt-4 h-6 bg-neutral-100 rounded w-1/3" />
    </div>
  )
}

// Product card
function ProductCard({ product }) {
  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discount / 100) * 100) / 100
    : product.price;

  return (
    <Link to={`/products/${product._id}`} className="block group" aria-label={product.name}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="bg-white rounded-2xl shadow-lg p-4 flex flex-col h-full transition"
      >
        <div className="relative overflow-hidden rounded-lg">
          {hasDiscount && (
            <span className="absolute top-2 right-2 bg-accent-600 text-white text-xs px-2 py-1 rounded-full z-10">
              {product.discount}% OFF
            </span>
          )}
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 bg-neutral-100 flex items-center justify-center">
              <span className="text-neutral-400">No Image</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-col flex-grow">
          <h3 className="text-lg font-medium text-neutral-800 group-hover:text-accent-600 transition">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline space-x-2">
            {hasDiscount ? (
              <>
                <span className="text-neutral-500 line-through text-sm">
                  {formatPrice(product.price)}
                </span>
                <span className="text-accent-600 font-semibold text-sm">
                  {formatPrice(discountedPrice)}
                </span>
              </>
            ) : (
              <span className="text-accent-600 font-semibold text-sm">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {product.category?.name || 'Uncategorized'}
          </p>
          <div className="mt-2 flex items-center text-sm">
            <FaStar className="text-yellow-500 mr-1" />
            <span className="text-neutral-700">{(product.avgRating ?? 0).toFixed(1)}</span>
            <span className="ml-2 text-neutral-500">({product.totalReviews ?? 0})</span>
          </div>
          <div className="mt-auto pt-4 flex justify-between items-center">
            {hasDiscount && (
              <span className="inline-block px-2 py-1 bg-accent-100 text-accent-700 text-xs font-medium rounded-full">
                {product.discount}% OFF
              </span>
            )}
            <span
              className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const offersRef = useRef([]);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // fetch data
  useEffect(() => {
    api.get('/api/products', { params: { sort: 'createdAt_desc', limit: 4 } })
      .then(r => setFeatured(r.data.products || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));

    api.get('/api/products', { params: { discounted: true, limit: 8 } })
      .then(r => {
        const arr = r.data.products || [];
        // shuffle
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        offersRef.current = arr;
        setOffers(arr.slice(0, 4));
      })
      .catch(() => setOffers([]))
      .finally(() => setLoadingOffers(false));
  }, []);

  // auto-swipe
  useEffect(() => {
    if (offersRef.current.length <= 4) return;
    const iv = setInterval(() => {
      if (isPaused) return;
      goNext();
    }, 3000);
    return () => clearInterval(iv);
  }, [index, isPaused]);

  const goPrev = () => {
    const len = offersRef.current.length;
    const next = (index - 1 + len) % len;
    setIndex(next);
    setOffers([
      ...offersRef.current.slice(next, next + 4),
      ...offersRef.current.slice(0, Math.max(0, next + 4 - len))
    ]);
  };

  const goNext = () => {
    const len = offersRef.current.length;
    const next = (index + 1) % len;
    setIndex(next);
    setOffers([
      ...offersRef.current.slice(next, next + 4),
      ...offersRef.current.slice(0, Math.max(0, next + 4 - len))
    ]);
  };

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-primary-100 to-primary-50 py-20 rounded-2xl shadow-card overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/hero-bg.svg')] bg-center bg-no-repeat" />
        <div className="relative max-w-3xl mx-auto text-center px-6 space-y-6">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-primary-800">
            Welcome to eStore
          </h1>
          <p className="text-xl sm:text-2xl text-primary-600">
            Discover our most popular products with exclusive deals and free shipping.
          </p>
          <Link to="/products" aria-label="Browse all products">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
              <AnimatedButton className="px-10 py-3 text-lg bg-gradient-to-r from-accent-500 to-accent-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition">
                Browse Products
              </AnimatedButton>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-3xl font-semibold text-neutral-800">Featured Products</h2>
        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.length
              ? featured.map(p => <ProductCard key={p._id} product={p} />)
              : <p className="text-center text-neutral-500 col-span-4">No featured products.</p>}
          </div>
        )}
      </section>

      {/* Offers carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative">
        <h2 className="text-3xl font-semibold text-neutral-800">Offers & Discounts</h2>
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {loadingOffers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : offers.length ? (
            <>
              {/* slides */}
              <AnimatePresence initial={false} exitBeforeEnter>
                <motion.div
                  key={index}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                  {offers.map(p => <ProductCard key={p._id} product={p} />)}
                </motion.div>
              </AnimatePresence>

              {/* arrows */}
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-neutral-100"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-neutral-100"
              >
                <FaChevronRight />
              </button>

              {/* indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {offersRef.current.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIndex(i);
                      const len = offersRef.current.length;
                      const start = i;
                      setOffers([
                        ...offersRef.current.slice(start, start + 4),
                        ...offersRef.current.slice(
                          0,
                          Math.max(0, start + 4 - len)
                        )
                      ]);
                    }}
                    className={`w-2 h-2 rounded-full ${
                      i === index ? 'bg-accent-600' : 'bg-neutral-300'
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-neutral-500">No current offers.</p>
          )}
        </div>
      </section>
    </div>
  );
}
