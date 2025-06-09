// src/pages/Home.jsx

import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    // Fetch featured products (top-rated)
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/api/products', {
          params: { sort: 'rating_desc', limit: 4 },
        });
        const prods = Array.isArray(data.products) ? data.products : [];
        setFeatured(prods.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      } finally {
        setLoadingFeatured(false);
      }
    };

    // Fetch offer products (discounted)
    const fetchOffers = async () => {
      try {
        const { data } = await api.get('/api/products', {
          params: { discounted: true, sort: 'discount_desc', limit: 4 },
        });
        const prods = Array.isArray(data.products) ? data.products : [];
        setOffers(prods.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch offer products:', err);
      } finally {
        setLoadingOffers(false);
      }
    };

    fetchFeatured();
    fetchOffers();
  }, []);

  // Helper to compute discounted price rounded to two decimals
  const getDiscountedPrice = (price, discount) => {
    const raw = price * (1 - discount / 100);
    return Math.round(raw * 100) / 100;
  };

  // Common variants for 3D tilt effect
  const tiltVariants = {
    rest: { rotateX: 0, rotateY: 0, scale: 1 },
    hover: {
      rotateX: 5,
      rotateY: -5,
      scale: 1.03,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-100 to-primary-50 py-20 rounded-2xl shadow-card overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/hero-bg.svg')] bg-center bg-no-repeat"></div>
        <div className="relative max-w-3xl mx-auto text-center px-6 space-y-6">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-primary-800">
            Welcome to eStore
          </h1>
          <p className="text-xl sm:text-2xl text-primary-600">
            Discover our most popular products with exclusive deals and free shipping.
          </p>
          <Link to="/products">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedButton className="px-10 py-3 text-lg bg-gradient-to-r from-accent-500 to-accent-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition">
                Browse Products
              </AnimatedButton>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h2 className="text-3xl font-semibold text-neutral-800">Featured Products</h2>

        {loadingFeatured ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-neutral-500">Loading featured…</p>
          </div>
        ) : featured.length === 0 ? (
          <p className="text-center text-neutral-500">No featured products available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((product, idx) => {
              const hasDiscount = product.discount > 0;
              const discountedPrice = hasDiscount
                ? getDiscountedPrice(product.price, product.discount)
                : product.price;

              return (
                <Link to={`/products/${product._id}`} key={product._id} className="block">
                  <motion.div
                    style={{ perspective: 1000 }}
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                    variants={tiltVariants}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform-origin-center transition p-4 flex flex-col h-full"
                  >
                    <div className="overflow-hidden rounded-lg">
                      {Array.isArray(product.images) && product.images.length > 0 ? (
                        <motion.img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-neutral-100 flex items-center justify-center">
                          <span className="text-neutral-400">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-medium text-neutral-800 hover:text-accent-600 transition">
                        {product.name}
                      </h3>

                      <div className="mt-2 flex items-baseline space-x-2">
                        {hasDiscount ? (
                          <>
                            <span className="text-neutral-500 line-through">
                              Tsh.{product.price.toFixed(2)}
                            </span>
                            <span className="text-accent-600 font-semibold">
                              Tsh.{discountedPrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <p className="text-accent-600 font-semibold">
                            Tsh.{product.price.toFixed(2)}
                          </p>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-neutral-500">
                        {product.category?.name || 'Uncategorized'}
                      </p>

                      <div className="mt-2 flex items-center text-sm">
                        <FaStar className="text-yellow-500 mr-1" />
                        <span className="text-neutral-700">{product.avgRating.toFixed(1)}</span>
                        <span className="ml-2 text-neutral-500">({product.totalReviews})</span>
                      </div>

                      <div className="mt-auto pt-4">
                        {product.stock > 0 ? (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            In Stock ({product.stock})
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Offers & Discounts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h2 className="text-3xl font-semibold text-neutral-800">Offers & Discounts</h2>

        {loadingOffers ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-neutral-500">Loading offers…</p>
          </div>
        ) : offers.length === 0 ? (
          <p className="text-center text-neutral-500">No current offers available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {offers.map((product, idx) => {
              const hasDiscount = product.discount > 0;
              const discountedPrice = hasDiscount
                ? getDiscountedPrice(product.price, product.discount)
                : product.price;

              return (
                <Link to={`/products/${product._id}`} key={product._id} className="block">
                  <motion.div
                    style={{ perspective: 1000 }}
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                    variants={tiltVariants}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform-origin-center transition p-4 flex flex-col h-full"
                  >
                    <div className="overflow-hidden rounded-lg">
                      {Array.isArray(product.images) && product.images.length > 0 ? (
                        <motion.img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-neutral-100 flex items-center justify-center">
                          <span className="text-neutral-400">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-medium text-neutral-800 hover:text-accent-600 transition">
                        {product.name}
                      </h3>

                      <div className="mt-2 flex items-baseline space-x-2">
                        {hasDiscount ? (
                          <>
                            <span className="text-neutral-500 line-through">
                              Tsh.{product.price.toFixed(2)}
                            </span>
                            <span className="text-accent-600 font-semibold">
                              Tsh.{discountedPrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <p className="text-accent-600 font-semibold">
                            Tsh.{product.price.toFixed(2)}
                          </p>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-neutral-500">
                        {product.category?.name || 'Uncategorized'}
                      </p>

                      <div className="mt-2 flex items-center text-sm">
                        <FaStar className="text-yellow-500 mr-1" />
                        <span className="text-neutral-700">{product.avgRating.toFixed(1)}</span>
                        <span className="ml-2 text-neutral-500">({product.totalReviews})</span>
                      </div>

                      <div className="mt-auto pt-4 flex items-center justify-between">
                        {product.discount > 0 && (
                          <span className="inline-block px-2 py-1 bg-accent-100 text-accent-700 text-xs font-medium rounded-full">
                            {product.discount}% OFF
                          </span>
                        )}
                        {product.stock > 0 ? (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
