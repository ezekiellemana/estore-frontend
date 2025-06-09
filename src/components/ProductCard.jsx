// src/components/ProductCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

export default function ProductCard({ product }) {
  // Calculate discounted price if applicable
  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discount / 100) * 100) / 100
    : product.price;

  return (
    <Link to={`/products/${product._id}`} className="block">
      <div className="relative bg-white rounded-2xl shadow-card overflow-hidden flex flex-col h-full">
        {/* FEATURED STAR */}
        {product.isFeatured && (
          <div className="absolute top-2 right-2 z-10">
            <FaStar className="w-6 h-6 text-yellow-500" />
          </div>
        )}

        {/* Image */}
        {Array.isArray(product.images) && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-48 bg-neutral-100 flex items-center justify-center">
            <span className="text-neutral-400">No Image</span>
          </div>
        )}

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Name */}
          <h3 className="text-lg font-medium text-neutral-800 hover:text-accent-600 transition">
            {product.name}
          </h3>

          {/* Price / Discount */}
          <div className="mt-2">
            {hasDiscount ? (
              <div className="flex items-baseline space-x-2">
                <span className="text-neutral-500 line-through text-sm">
                  Tsh.{product.price.toFixed(2)}
                </span>
                <span className="text-accent-600 font-semibold">
                  Tsh.{discountedPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <p className="text-accent-600 font-semibold">
                Tsh.{product.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Category */}
          <p className="mt-1 text-sm text-neutral-500">
            {product.category?.name || 'Uncategorized'}
          </p>

          {/* Rating */}
          <div className="mt-2 flex items-center space-x-1">
            <span className="text-sm text-yellow-500">
              ⭐ {product.avgRating.toFixed(1)}
            </span>
            <span className="text-sm text-neutral-500">
              ({product.totalReviews})
            </span>
          </div>

          {/* Stock Badge */}
          <div className="mt-auto pt-4">
            {product.stock > 0 ? (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                In Stock ({product.stock})
              </span>
            ) : (
              <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
