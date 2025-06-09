// src/pages/admin/AdminProducts.jsx

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import AnimatedButton from '../../components/AnimatedButton';
import { Trash2, Edit3 } from 'lucide-react';

const CLOUDINARY_UPLOAD_URL =
  'https://api.cloudinary.com/v1_1/dhubit7vj/upload';
const UPLOAD_PRESET = 'estore';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form state
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    discount: '',
    isFeatured: false,
    images: [''],
  });
  const [loading, setLoading] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/api/products', {
        params: { page: 1, limit: 1000 },
      });
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products.');
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories.');
    }
  };

  // Prompt deletion
  const confirmDeletion = (id) => {
    setConfirmDeleteId(id);
  };
  const cancelDeletion = () => {
    setConfirmDeleteId(null);
  };
  // Actually delete
  const handleDelete = async () => {
    const id = confirmDeleteId;
    if (!id) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/products/${id}`);
      toast.success('Product deleted.');
      await fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // Start editing
  const startEdit = (prod) => {
    setEditingProduct(prod._id);
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price?.toString() || '',
      stock: prod.stock?.toString() || '',
      category: prod.category?._id || '',
      discount: prod.discount?.toString() || '',
      isFeatured: prod.isFeatured || false,
      images: prod.images && prod.images.length > 0 ? prod.images : [''],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      discount: '',
      isFeatured: false,
      images: [''],
    });
  };

  const handleChange = (e, idx = null) => {
    const { name, value, type, checked } = e.target;
    if (name === 'images') {
      const newImages = [...formData.images];
      newImages[idx] = value;
      setFormData((prev) => ({ ...prev, images: newImages }));
    } else if (name === 'isFeatured') {
      setFormData((prev) => ({ ...prev, isFeatured: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (idx) => {
    const newImages = formData.images.filter((_, i) => i !== idx);
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async (file, slotIdx) => {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);

    try {
      setUploadingIdx(slotIdx);
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error.message || 'Upload failed');
      }
      return data.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      throw err;
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleFileInput = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file, idx);
      const newImages = [...formData.images];
      newImages[idx] = url;
      setFormData((prev) => ({ ...prev, images: newImages }));
      toast.success('Image uploaded.');
    } catch {
      toast.error('Image upload failed.');
    }
  };

  // Toggle featured status inline
  const toggleFeaturedInline = async (prod) => {
    const newFlag = !prod.isFeatured;
    try {
      await api.put(`/api/products/${prod._id}`, { isFeatured: newFlag });
      toast.success(
        `Product ${newFlag ? 'marked' : 'unmarked'} as featured.`
      );
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update featured status.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.category
    ) {
      toast.error('Name, price, stock, and category are required.');
      return;
    }

    // Process discount to ensure it’s numeric ≥ 0
    const parsedDiscount = parseFloat(formData.discount);
    const discountNumeric =
      isNaN(parsedDiscount) || parsedDiscount < 0 ? 0 : parsedDiscount;

    const validImages = formData.images.filter((url) => url.trim() !== '');
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      category: formData.category,
      discount: discountNumeric,
      isFeatured: formData.isFeatured,
      images: validImages,
    };

    setLoading(true);
    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct}`, payload);
        toast.success('Product updated.');
      } else {
        await api.post('/api/products', payload);
        toast.success('Product created.');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.map((e) => e.msg).join(', ') ||
        'Operation failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add / Edit Form */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-card p-8"
      >
        <h3 className="text-xl font-medium text-neutral-800 mb-4">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-neutral-700"
            >
              Name *
            </label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-neutral-300 rounded-2xl px-3 py-2 bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-neutral-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-neutral-300 rounded-2xl px-3 py-2 bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-neutral-700"
              >
                Price (Tsh) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-neutral-300 rounded-2xl px-3 py-2 bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            {/* Stock */}
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-neutral-700"
              >
                Stock *
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-neutral-300 rounded-2xl px-3 py-2 bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-neutral-700"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-neutral-300 rounded-2xl px-3 py-2 bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="">-- Select a category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Discount & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="discount"
                className="block text-sm font-medium text-neutral-700"
              >
                Discount (%)
              </label>
              <input
                id="discount"
                name="discount"
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={handleChange}
                placeholder="0"
                className="mt-1 block w-full border border-neutral-300 rounded-2xl px-3 py-2 bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="isFeatured"
                name="isFeatured"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <label
                htmlFor="isFeatured"
                className="text-sm font-medium text-neutral-700"
              >
                Mark as Featured
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-neutral-700">Images *</p>
            {formData.images.map((url, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center"
              >
                {url ? (
                  <img
                    src={url}
                    alt={`Preview ${idx}`}
                    className="w-32 h-32 object-cover rounded-lg border border-neutral-200"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-neutral-100 rounded-lg border border-neutral-200 text-neutral-400">
                    No image
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor={`file-input-${idx}`}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-2xl cursor-pointer hover:bg-primary-700 transition-colors"
                  >
                    {uploadingIdx === idx ? (
                      <span>Uploading…</span>
                    ) : (
                      <span>{url ? 'Change File' : 'Choose File'}</span>
                    )}
                    <input
                      id={`file-input-${idx}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileInput(e, idx)}
                      className="hidden"
                      disabled={uploadingIdx === idx}
                    />
                  </label>

                  <input
                    name="images"
                    value={url}
                    onChange={(e) => handleChange(e, idx)}
                    placeholder="Or paste image URL here"
                    className="mt-1 block w-full border border-neutral-300 rounded-2xl px-3 py-2 bg-neutral-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>

                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(idx)}
                    className="text-red-500 hover:text-red-700 focus:outline-none self-start mt-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addImageField}
              className="text-accent-500 hover:underline text-sm"
            >
              + Add another image slot
            </button>
          </div>

          {/* Submit / Cancel */}
          <div className="flex space-x-4 mt-4">
            <AnimatedButton
              type="submit"
              className="px-6 py-2"
              disabled={loading || uploadingIdx !== null}
            >
              {editingProduct
                ? loading
                  ? 'Updating…'
                  : 'Update'
                : loading
                ? 'Creating…'
                : 'Create'}
            </AnimatedButton>
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-neutral-300 rounded-2xl text-neutral-700 hover:bg-neutral-100 focus:outline-none"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Products List Table */}
      <div className="bg-neutral-50 p-8 rounded-2xl shadow-card">
        <h3 className="text-xl font-medium mb-4 text-neutral-800">
          All Products
        </h3>
        {Array.isArray(products) && products.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-2xl shadow-card">
            <table className="min-w-full bg-transparent">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">
                    Name
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-neutral-600">
                    Price (Tsh)
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-neutral-600">
                    Discount (%)
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-neutral-600">
                    Disc. Price (Tsh)
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-neutral-600">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">
                    Category
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-neutral-600">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">
                    Images
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-neutral-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod, idx) => {
                  // Compute discounted price
                  const rawPrice = prod.price;
                  const parsedDiscount = parseFloat(prod.discount);
                  const rawDiscount =
                    isNaN(parsedDiscount) || parsedDiscount < 0
                      ? 0
                      : parsedDiscount;
                  const discountedRaw =
                    (rawPrice * (100 - rawDiscount)) / 100;
                  const discountedPrice =
                    Math.round(discountedRaw * 100) / 100;

                  return (
                    <motion.tr
                      key={prod._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b even:bg-white hover:bg-neutral-100 transition-colors"
                    >
                      <td className="px-6 py-4 text-neutral-800">
                        {prod.name}
                      </td>
                      <td className="px-6 py-4 text-neutral-700 text-right">
                        {rawPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-neutral-700 text-right">
                        {rawDiscount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-neutral-800 text-right font-semibold">
                        {discountedPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-neutral-700 text-center">
                        {prod.stock}
                      </td>
                      <td className="px-6 py-4 text-neutral-700">
                        {prod.category?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleFeaturedInline(prod)}
                          className={`text-xl ${
                            prod.isFeatured
                              ? 'text-yellow-500'
                              : 'text-neutral-400'
                          } focus:outline-none`}
                          title={
                            prod.isFeatured
                              ? 'Unmark as Featured'
                              : 'Mark as Featured'
                          }
                        >
                          {prod.isFeatured ? '★' : '☆'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {Array.isArray(prod.images) && prod.images.length > 0 ? (
                          <div className="flex space-x-2">
                            {prod.images.slice(0, 3).map((imgUrl, i) => (
                              <img
                                key={i}
                                src={imgUrl}
                                alt={`Prod ${idx} img${i}`}
                                className="w-12 h-12 object-cover rounded-md border"
                              />
                            ))}
                            {prod.images.length > 3 && (
                              <span className="text-sm text-neutral-500">
                                +{prod.images.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-sm">
                            No images
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center space-x-4">
                        <button
                          onClick={() => startEdit(prod)}
                          className="text-blue-600 hover:text-blue-800 focus:outline-none"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => confirmDeletion(prod._id)}
                          className="text-red-600 hover:text-red-800 focus:outline-none"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-neutral-500 py-6">
            No products found.
          </p>
        )}
      </div>

      {/* Confirmation Modal via Portal */}
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
                  Are you sure you want to delete this product?
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={cancelDeletion}
                    className="px-4 py-2 bg-neutral-200 rounded-2xl hover:bg-neutral-300 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
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
