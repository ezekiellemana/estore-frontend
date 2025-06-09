// src/pages/Products.jsx

import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter } from 'react-icons/fa';

export default function Products() {
  // Product list and pagination
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter & sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Toggle filter panel
  const [showFilters, setShowFilters] = useState(false);

  // Prevent double‐fetch categories
  const didFetchCategories = useRef(false);

  // Fetch categories once
  useEffect(() => {
    if (didFetchCategories.current) return;
    didFetchCategories.current = true;

    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        setCategoryOptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products whenever any filter/sort/page changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 12,
          sort: sortBy,
        };
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedCategory) params.category = selectedCategory;
        if (minPrice) params.minPrice = parseFloat(minPrice);
        if (maxPrice) params.maxPrice = parseFloat(maxPrice);
        if (discountedOnly) params.discounted = true;
        if (inStockOnly) params.inStock = true;

        const { data } = await api.get('/api/products', { params });
        setProducts(Array.isArray(data.products) ? data.products : []);
        setPages(data.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, searchTerm, selectedCategory, minPrice, maxPrice, discountedOnly, inStockOnly, sortBy]);

  // Handle search input (trigger on Enter)
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      setSearchTerm(e.target.value);
    }
  };

  // Apply filters button
  const applyFilters = () => {
    setPage(1);
    // Query will refresh automatically via useEffect
  };

  return (
    <div className="space-y-6">
      {/* Header with Search & Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <h2 className="text-2xl font-bold text-neutral-800">All Products</h2>

        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative w-full lg:w-1/3">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products..."
              onKeyPress={handleSearchKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-2xl bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors"
          >
            <FaFilter className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Animated Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-white rounded-2xl shadow-card p-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Select */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="mt-1 block w-full border border-neutral-300 rounded-2xl px-3 py-2 bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-neutral-700">
                  Min Price (Tsh)
                </label>
                <input
                  id="minPrice"
                  type="number"
                  step="0.01"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="mt-1 block w-full border border-neutral-300 rounded-2xl px-3 py-2 bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>

              {/* Max Price */}
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-neutral-700">
                  Max Price (Tsh)
                </label>
                <input
                  id="maxPrice"
                  type="number"
                  step="0.01"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="mt-1 block w-full border border-neutral-300 rounded-2xl px-3 py-2 bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col justify-end space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={discountedOnly}
                    onChange={(e) => {
                      setDiscountedOnly(e.target.checked);
                      setPage(1);
                    }}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Discounted only</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setPage(1);
                    }}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-neutral-700">In stock only</span>
                </label>
              </div>
            </div>

            {/* Sort & Apply */}
            <div className="flex items-center space-x-4 mt-6">
              <label htmlFor="sortBy" className="text-sm font-medium text-neutral-700">
                Sort by:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="mt-1 block w-40 border border-neutral-300 rounded-2xl px-3 py-2 bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Rating</option>
              </select>

              <button
                onClick={applyFilters}
                className="ml-auto px-6 py-2 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-neutral-500">Loading products…</p>
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-neutral-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-4 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-2xl hover:bg-neutral-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-neutral-600">
          Page {page} of {pages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, pages))}
          disabled={page === pages}
          className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-2xl hover:bg-neutral-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
